/**
 * Transform Health Directory — Apps Script backend
 *
 * GET  ?api=entries&status=live        → returns live profile entries
 * GET  ?api=profile&token=xxx          → returns profile snapshot for magic link token
 * POST {action: 'sendProfileLink'}     → looks up profile, emails magic link to user
 * POST {action: 'profileRequest'}      → saves update/delete request from user
 * POST {action: 'approve', id}         → admin approves a submission
 * POST (no action)                     → creates new submission
 *
 * Script Properties required:
 *   TARGET_SHEET_ID   — Google Sheet ID
 *   ADMIN_PASSWORD    — admin auth password
 *   SITE_URL          — deployed app URL (e.g. https://yourname.github.io/repo)
 */

const SHEET_NAME = 'Submissions';
const REQUESTS_SHEET = 'Requests';

// ---------------------------------------------------------------------------
// GET router
// ---------------------------------------------------------------------------
function doGet(e) {
  if (e && e.parameter) {
    if (e.parameter.admin === 'true') {
      return HtmlService.createHtmlOutputFromFile('Admin').setTitle('Admin - Transform Health');
    }
    if (e.parameter.api === 'entries') {
      var status = e.parameter.status || 'live';
      return jsonResponse(getEntries(status));
    }
    if (e.parameter.api === 'profile' && e.parameter.token) {
      return jsonResponse(getProfileByToken(e.parameter.token));
    }
  }
  return ContentService.createTextOutput('Transform Health Apps Script').setMimeType(ContentService.MimeType.TEXT);
}

// ---------------------------------------------------------------------------
// POST router
// ---------------------------------------------------------------------------
function doPost(e) {
  try {
    var payload = {};
    if (e.postData && e.postData.type === 'application/json') {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    var action = payload.action || (e.parameter && e.parameter.action) || '';

    if (action === 'approve') {
      if (!checkAdminPassword(payload.adminPassword)) {
        return jsonResponse({ ok: false, error: 'auth' });
      }
      return jsonResponse({ ok: approveById(payload.id, 'live') });
    }

    if (action === 'sendProfileLink') {
      return jsonResponse(sendProfileLink(payload));
    }

    if (action === 'profileRequest') {
      return jsonResponse(saveProfileRequest(payload));
    }

    // Default: new submission
    return jsonResponse(createSubmission(payload));

  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// ---------------------------------------------------------------------------
// Magic link: send profile link to user
// ---------------------------------------------------------------------------
function sendProfileLink(payload) {
  var firstName = (payload.firstName || payload.first_name || '').trim();
  var lastName  = (payload.lastName  || payload.last_name  || '').trim();
  var email     = (payload.email || '').trim();
  var linkedin  = (payload.linkedin || '').trim();

  if (!firstName || !lastName || !email) {
    return { ok: false, error: 'missing_fields' };
  }

  // Look up the profile in Submissions sheet
  var profile = findProfile(firstName, lastName, linkedin);
  if (!profile) {
    return { ok: false, error: 'not_found' };
  }

  // Generate token and store request
  var token = generateToken();
  var now   = new Date().toISOString();
  var id    = generateId();

  var ss    = SpreadsheetApp.openById(getSheetId());
  var sheet = getOrCreateRequestsSheet(ss);

  sheet.appendRow([
    id,
    now,
    'link_request',
    firstName,
    lastName,
    email,
    linkedin,
    token,
    false,                          // token_used
    profile.id || '',               // profile_id
    JSON.stringify(profile),        // profile_snapshot
    '',                             // changes
    '',                             // reason
    'pending'                       // status
  ]);

  // Send email
  var siteUrl  = PropertiesService.getScriptProperties().getProperty('SITE_URL') || '';
  var magicUrl = siteUrl + (siteUrl.includes('?') ? '&' : '?') + 'token=' + token;

  MailApp.sendEmail({
    to: email,
    subject: 'Your Transform Health Directory profile',
    body: [
      'Hi ' + firstName + ',',
      '',
      'You requested a link to review and update your profile on the Transform Health Women Leaders Directory.',
      '',
      'Click the link below to open your profile and submit any changes:',
      '',
      magicUrl,
      '',
      'This link can only be used once. If you did not request this, you can safely ignore this email.',
      '',
      'Transform Health Team'
    ].join('\n')
  });

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Profile lookup: find profile by name (and optionally LinkedIn)
// ---------------------------------------------------------------------------
function findProfile(firstName, lastName, linkedin) {
  var ss    = SpreadsheetApp.openById(getSheetId());
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return null;

  var data    = sheet.getDataRange().getValues();
  var headers = data.shift().map(function(h) { return String(h); });
  var rows    = data.map(function(r) {
    var obj = {};
    r.forEach(function(val, i) { obj[headers[i]] = val; });
    return obj;
  });

  var fn = firstName.toLowerCase();
  var ln = lastName.toLowerCase();

  var matches = rows.filter(function(r) {
    return String(r.first_name || '').toLowerCase() === fn &&
           String(r.last_name  || '').toLowerCase() === ln &&
           String(r.status     || '').toLowerCase() === 'live';
  });

  // If multiple name matches and LinkedIn provided, narrow down
  if (matches.length > 1 && linkedin) {
    var li = linkedin.toLowerCase();
    var narrowed = matches.filter(function(r) {
      return String(r.linkedin || '').toLowerCase().includes(li) ||
             li.includes(String(r.linkedin || '').toLowerCase());
    });
    if (narrowed.length > 0) matches = narrowed;
  }

  return matches.length > 0 ? matches[0] : null;
}

// ---------------------------------------------------------------------------
// Magic link: retrieve profile by token
// ---------------------------------------------------------------------------
function getProfileByToken(token) {
  var ss    = SpreadsheetApp.openById(getSheetId());
  var sheet = ss.getSheetByName(REQUESTS_SHEET);
  if (!sheet) return { ok: false, error: 'not_found' };

  var data    = sheet.getDataRange().getValues();
  var headers = data.shift().map(function(h) { return String(h); });

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    headers.forEach(function(h, j) { obj[h] = row[j]; });

    if (String(obj.token) === String(token) && String(obj.request_type) === 'link_request') {
      if (obj.token_used) {
        return { ok: false, error: 'token_used' };
      }
      // Mark token as used
      var tokenUsedCol = headers.indexOf('token_used') + 1;
      sheet.getRange(i + 2, tokenUsedCol).setValue(true);

      var profile = {};
      try { profile = JSON.parse(obj.profile_snapshot); } catch (e) {}
      return { ok: true, profile: profile };
    }
  }

  return { ok: false, error: 'invalid_token' };
}

// ---------------------------------------------------------------------------
// Save update / delete request from user
// ---------------------------------------------------------------------------
function saveProfileRequest(payload) {
  var id   = generateId();
  var now  = new Date().toISOString();

  var ss    = SpreadsheetApp.openById(getSheetId());
  var sheet = getOrCreateRequestsSheet(ss);

  sheet.appendRow([
    id,
    now,
    payload.requestType || 'update',
    payload.firstName || payload.first_name || '',
    payload.lastName  || payload.last_name  || '',
    payload.email     || '',
    payload.linkedin  || '',
    '',     // token (not applicable for direct submissions)
    false,  // token_used
    '',     // profile_id
    '',     // profile_snapshot
    payload.changes || '',
    payload.reason  || '',
    'pending'
  ]);

  return { ok: true, id: id };
}

// ---------------------------------------------------------------------------
// Create new submission
// ---------------------------------------------------------------------------
function createSubmission(payload) {
  var id  = generateId();
  var now = new Date().toISOString();
  var row = [
    id,
    now,
    payload.branch || 'self',
    payload.firstName || payload.first_name || '',
    payload.lastName  || payload.last_name  || '',
    payload.role || '',
    payload.organisation || payload.org || '',
    payload.bio || '',
    payload.linkedin || '',
    payload.photo_url || payload.photoUrl || payload.photo || '',
    'pending',
    generateToken(),
    payload.editor_email || payload.email || '',
    payload.internal_note || '',
    payload.country || ''
  ];

  var ss    = SpreadsheetApp.openById(getSheetId());
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id','created_at','branch','first_name','last_name','role','organisation','bio','linkedin','photo_url','status','admin_token','editor_email','internal_note','country']);
  }
  sheet.appendRow(row);
  return { ok: true, id: id };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getEntries(status) {
  var ss    = SpreadsheetApp.openById(getSheetId());
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return [];
  var data    = sheet.getDataRange().getValues();
  var headers = data.shift().map(function(h) { return String(h); });
  var rows    = data.map(function(r) {
    var obj = {};
    r.forEach(function(val, i) { obj[headers[i]] = val; });
    return obj;
  });
  if (status) return rows.filter(function(r) {
    return String(r.status).toLowerCase() === String(status).toLowerCase();
  });
  return rows;
}

function approveById(id, status) {
  var ss    = SpreadsheetApp.openById(getSheetId());
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return false;
  var data        = sheet.getDataRange().getValues();
  var headers     = data.shift();
  var idIndex     = headers.indexOf('id');
  var statusIndex = headers.indexOf('status');
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.getRange(i + 2, statusIndex + 1).setValue(status);
      return true;
    }
  }
  return false;
}

function getOrCreateRequestsSheet(ss) {
  var sheet = ss.getSheetByName(REQUESTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(REQUESTS_SHEET);
    sheet.appendRow([
      'id','created_at','request_type','first_name','last_name',
      'email','linkedin','token','token_used','profile_id',
      'profile_snapshot','changes','reason','status'
    ]);
  }
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateId()    { return 'th_' + (new Date().getTime()) + '_' + Math.floor(Math.random() * 9000 + 1000); }
function generateToken() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10); }

function checkAdminPassword(pw) {
  var props = PropertiesService.getScriptProperties();
  var admin = props.getProperty('ADMIN_PASSWORD') || '';
  return admin && pw === admin;
}

function getSheetId() {
  var props = PropertiesService.getScriptProperties();
  var id    = props.getProperty('TARGET_SHEET_ID');
  if (!id) throw new Error('TARGET_SHEET_ID not set in Script Properties.');
  return id;
}

// Server functions callable from Admin.html
function serverGetPending() { return getEntries('pending'); }
function serverApprove(id)  { return approveById(id, 'live'); }
function serverReject(id)   { return approveById(id, 'rejected'); }
function serverGetAll()     { return getEntries(); }
