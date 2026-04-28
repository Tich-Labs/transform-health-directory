/**
 * Transform Health Directory — Apps Script MVP template
 * - POST submissions to doPost (JSON)
 * - GET approved entries: ?api=entries&status=live
 * - Admin UI: ?admin=true (serves Admin.html)
 *
 * Deployment instructions are in apps-script/README_DEPLOY.md
 */

const SHEET_NAME = 'Submissions';

function doGet(e) {
  if (e && e.parameter && e.parameter.admin === 'true') {
    return HtmlService.createHtmlOutputFromFile('Admin').setTitle('Admin - Transform Health');
  }
  if (e && e.parameter && e.parameter.api === 'entries') {
    const status = e.parameter.status || 'live';
    const payload = getEntries(status);
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('Transform Health Apps Script').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var payload = {};
    if (e.postData && e.postData.type === 'application/json') {
      payload = JSON.parse(e.postData.contents);
    } else {
      // Accept form-encoded fallback
      payload = e.parameter || {};
    }

    // admin approve via POST?action=approve with JSON {id, adminPassword}
    if (e.parameter && e.parameter.action === 'approve') {
      var body = (e.postData && e.postData.type === 'application/json') ? JSON.parse(e.postData.contents) : e.parameter;
      if (!checkAdminPassword(body.adminPassword)) return ContentService.createTextOutput(JSON.stringify({ok:false, error:'auth'})).setMimeType(ContentService.MimeType.JSON);
      var ok = approveById(body.id, 'live');
      return ContentService.createTextOutput(JSON.stringify({ok:ok})).setMimeType(ContentService.MimeType.JSON);
    }

    // create new submission row
    var id = generateId();
    var now = new Date().toISOString();
    var row = [
      id,
      now,
      payload.branch || 'self',
      payload.firstName || payload.first_name || '',
      payload.lastName || payload.last_name || '',
      payload.role || '',
      payload.organisation || payload.org || '',
      payload.bio || '',
      payload.linkedin || '',
      payload.photo_url || payload.photo || '',
      'pending', // status
      generateToken(), // admin_token
      payload.editor_email || payload.email || '',
      payload.internal_note || ''
    ];

    var ss = SpreadsheetApp.openById(getSheetId());
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id','created_at','branch','first_name','last_name','role','organisation','bio','linkedin','photo_url','status','admin_token','editor_email','internal_note']);
    }
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ok:true, id:id})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getEntries(status) {
  var ss = SpreadsheetApp.openById(getSheetId());
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var headers = data.shift().map(function(h){ return String(h); });
  var rows = data.map(function(r){ var obj = {}; r.forEach(function(val,i){ obj[headers[i]] = val; }); return obj; });
  if (status) return rows.filter(function(r){ return String(r.status).toLowerCase() === String(status).toLowerCase(); });
  return rows;
}

function approveById(id, status) {
  var ss = SpreadsheetApp.openById(getSheetId());
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return false;
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  var idIndex = headers.indexOf('id');
  var statusIndex = headers.indexOf('status');
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][idIndex]) === String(id)) {
      sheet.getRange(i+2, statusIndex+1).setValue(status);
      return true;
    }
  }
  return false;
}

function generateId() { return 'th_' + (new Date().getTime()) + '_' + Math.floor(Math.random()*9000+1000); }
function generateToken() { return Math.random().toString(36).slice(2,12); }

function checkAdminPassword(pw) {
  var props = PropertiesService.getScriptProperties();
  var admin = props.getProperty('ADMIN_PASSWORD') || '';
  return admin && pw === admin;
}

function getSheetId() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('TARGET_SHEET_ID');
  if (!id) throw new Error('TARGET_SHEET_ID not set in script properties. Set it in Project Settings -> Script Properties.');
  return id;
}

// server functions callable from Admin.html
function serverGetPending() { return getEntries('pending'); }
function serverApprove(id) { return approveById(id, 'live'); }
function serverReject(id) { return approveById(id, 'rejected'); }
function serverGetAll() { return getEntries(); }
