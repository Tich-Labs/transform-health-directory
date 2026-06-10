const FROM =
  Deno.env.get("SMTP_FROM") ||
  "Transform Health <noreply@transformhealthcoalition.org>";

function parseFrom(): { name: string; email: string } {
  const m = FROM.match(/^(.+)\s+<(.+)>/);
  return m ? { name: m[1].trim(), email: m[2] } : { name: "Transform Health", email: FROM };
}

// Read a single line from connection (up to \r\n).
async function readLine(conn: Deno.TcpConn | Deno.TlsConn): Promise<string> {
  const buf = new Uint8Array(1024);
  let acc = "";
  while (true) {
    const n = await conn.read(buf);
    if (n === null) throw new Error("Connection closed");
    acc += new TextDecoder().decode(buf.subarray(0, n));
    const idx = acc.indexOf("\r\n");
    if (idx !== -1) return acc.slice(0, idx);
  }
}

// Drain a multi-line SMTP response (lines starting with NNN- followed by NNN ).
async function drainResponse(conn: Deno.TcpConn | Deno.TlsConn): Promise<void> {
  while (true) {
    const line = await readLine(conn);
    if (line.length >= 4 && line[3] === " ") break;
  }
}

async function sendCmd(conn: Deno.TcpConn | Deno.TlsConn, cmd: string): Promise<string> {
  await conn.write(new TextEncoder().encode(cmd + "\r\n"));
  const line = await readLine(conn);
  // If this is a multi-line response (code + "-"), drain the rest
  if (line.length >= 4 && line[3] === "-") await drainResponse(conn);
  return line;
}

function encodeSmtpBase64(s: string): string {
  return btoa(s);
}

async function tryGoogleSmtp(to: string, subject: string, html: string): Promise<boolean> {
  const user = Deno.env.get("GOOGLE_SMTP_USER");
  const pass = Deno.env.get("GOOGLE_SMTP_PASS");
  if (!user || !pass) return false;

  let conn: Deno.TlsConn | null = null;
  try {
    conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });
    await readLine(conn);
    await sendCmd(conn, "EHLO transformhealth.org");
    await sendCmd(conn, `AUTH LOGIN`);
    await sendCmd(conn, encodeSmtpBase64(user));
    await sendCmd(conn, encodeSmtpBase64(pass));
    const fromEmail = parseFrom().email;
    await sendCmd(conn, `MAIL FROM:<${fromEmail}>`);
    await sendCmd(conn, `RCPT TO:<${to}>`);
    await sendCmd(conn, "DATA");
    const headers = [
      `From: ${FROM}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      html,
    ].join("\r\n");
    await sendCmd(conn, headers + "\r\n.");
    return true;
  } catch {
    return false;
  } finally {
    try { conn?.close(); } catch { /* ignore */ }
  }
}

async function tryGenericSmtp(to: string, subject: string, html: string): Promise<boolean> {
  const host = Deno.env.get("SMTP_HOST");
  const portStr = Deno.env.get("SMTP_PORT");
  const username = Deno.env.get("SMTP_USERNAME");
  const password = Deno.env.get("SMTP_PASSWORD");
  if (!host || !portStr || !username || !password) return false;

  const port = parseInt(portStr, 10);
  const useTls = port === 465;
  let conn: Deno.TcpConn | Deno.TlsConn | null = null;
  try {
    if (useTls) {
      conn = await Deno.connectTls({ hostname: host, port });
    } else {
      conn = await Deno.connect({ hostname: host, port });
    }
    await readLine(conn);
    await sendCmd(conn, "EHLO transformhealth.org");
    if (!useTls) {
      try {
        await sendCmd(conn, "STARTTLS");
        conn.close();
        conn = await Deno.connectTls({ hostname: host, port });
        await readLine(conn);
        await sendCmd(conn, "EHLO transformhealth.org");
      } catch {
        // STARTTLS not available, continue without TLS
      }
    }
    await sendCmd(conn, `AUTH LOGIN`);
    await sendCmd(conn, encodeSmtpBase64(username));
    await sendCmd(conn, encodeSmtpBase64(password));
    const fromEmail = parseFrom().email;
    await sendCmd(conn, `MAIL FROM:<${fromEmail}>`);
    await sendCmd(conn, `RCPT TO:<${to}>`);
    await sendCmd(conn, "DATA");
    const headers = [
      `From: ${FROM}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      html,
    ].join("\r\n");
    await sendCmd(conn, headers + "\r\n.");
    return true;
  } catch {
    return false;
  } finally {
    try { conn?.close(); } catch { /* ignore */ }
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return jsonResponse({ error: "Missing required fields: to, subject, html" }, 400);
    }

    const providers = [
      { name: "Google Workspace", fn: () => tryGoogleSmtp(to, subject, html) },
      { name: "Generic SMTP", fn: () => tryGenericSmtp(to, subject, html) },
    ];

    for (const provider of providers) {
      const ok = await provider.fn();
      if (ok) {
        console.log(`Email sent via ${provider.name}`);
        return jsonResponse({ ok: true, provider: provider.name });
      }
    }

    return jsonResponse(
      {
        error:
          "No email provider configured. Set GOOGLE_SMTP_USER+GOOGLE_SMTP_PASS or SMTP_HOST+SMTP_PORT+SMTP_USERNAME+SMTP_PASSWORD in Supabase project secrets.",
      },
      500,
    );
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message }, 500);
  }
});
