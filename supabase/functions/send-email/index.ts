// Supabase Function: send-email
// Sends magic link emails for profile management
// Uses Google Workspace (Gmail SMTP) — free for Google Workspace users
// Fallback: SendGrid → generic SMTP

import { serve } from "https://deno.land/x/supabase@0.37.3/functions.ts";
import { SmtpClient } from "https://deno.land/x/smtp@0.11.0/mod.ts";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req: Request) => {
  try {
    const payload: EmailPayload = await req.json();
    const { to, subject, html, from = Deno.env.get("SMTP_FROM") || "noreply@transformhealthcoalition.org" } = payload;

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try Google Workspace (Gmail SMTP) first — free for Workspace users
    const googleUser = Deno.env.get("GOOGLE_SMTP_USER"); // e.g. noreply@transformhealthcoalition.org
    const googlePass = Deno.env.get("GOOGLE_SMTP_PASS"); // App Password (not regular password)

    if (googleUser && googlePass) {
      try {
        const client = new SmtpClient({
          host: "smtp.gmail.com",
          port: 587,
          username: googleUser,
          password: googlePass,
          tls: true,
        });

        await client.connect();
        await client.send({
          from,
          to,
          subject,
          html,
        });
        await client.close();

        return new Response(JSON.stringify({ ok: true, provider: "google-workspace" }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Google SMTP failed:", err.message);
        // Fall through to next provider
      }
    }

    // Fallback: SendGrid
    const sendGridKey = Deno.env.get("SENDGRID_API_KEY");
    if (sendGridKey) {
      const sgMsg = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: "text/html", value: html }],
      };

      const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendGridKey}`,
        },
        body: JSON.stringify(sgMsg),
      });

      if (resp.ok) {
        return new Response(JSON.stringify({ ok: true, provider: "sendgrid" }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Fallback: Generic SMTP
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USERNAME") || "";
    const smtpPass = Deno.env.get("SMTP_PASSWORD") || "";

    if (!smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: "No email provider configured. Set GOOGLE_SMTP_USER + GOOGLE_SMTP_PASS (Google Workspace) or SENDGRID_API_KEY or SMTP_* secrets." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = new SmtpClient({
      host: smtpHost || "smtp.gmail.com",
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
      tls: true,
    });

    await client.connect();
    await client.send({
      from,
      to,
      subject,
      html,
    });
    await client.close();

    return new Response(JSON.stringify({ ok: true, provider: "smtp" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
    }

    // Try SendGrid first (if configured)
    const sendGridKey = Deno.env.get("SENDGRID_API_KEY");
    if (sendGridKey) {
      const sgMsg = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: "text/html", value: html }],
      };

      const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendGridKey}`,
        },
        body: JSON.stringify(sgMsg),
      });

      if (resp.ok) {
        return new Response(JSON.stringify({ ok: true, provider: "sendgrid" }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Fallback: SMTP (SendGrid not configured)
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp.sendgrid.net";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USERNAME") || "";
    const smtpPass = Deno.env.get("SMTP_PASSWORD") || "";

    if (!smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: "No email provider configured. Set SENDGRID_API_KEY or SMTP_* secrets." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = new SmtpClient({
      host: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
      tls: true,
    });

    await client.connect();
    await client.send({
      from,
      to,
      subject,
      html,
    });
    await client.close();

    return new Response(JSON.stringify({ ok: true, provider: "smtp" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
