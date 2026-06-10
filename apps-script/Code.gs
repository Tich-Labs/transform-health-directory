/**
 * Transform Health Directory — Email Relay (via Google Apps Script MailApp)
 *
 * Called by the Supabase Edge Function (send-email) to send magic link emails
 * using Google Workspace's MailApp. No Script Properties needed.
 *
 * POST { action: 'sendRawEmail', to, subject, htmlBody }
 */

function doPost(e) {
  try {
    var payload = {};
    if (e.postData && e.postData.type === 'application/json') {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    var action = payload.action || '';

    if (action === 'sendRawEmail') {
      return jsonResponse(sendRawEmail(payload));
    }

    return jsonResponse({ ok: false, error: 'unknown_action' });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function sendRawEmail(payload) {
  var to       = payload.to       || '';
  var subject  = payload.subject  || '';
  var htmlBody = payload.htmlBody || '';

  if (!to || !subject || !htmlBody) {
    return { ok: false, error: 'missing_fields' };
  }

  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: htmlBody,
  });

  return { ok: true };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
