/**
 * 禪學社 第二堂社課 課前QA：後台接收程式
 * 使用方式：在 Google 試算表中「擴充功能 → Apps Script」，把本檔內容整份貼上，
 * 再「部署 → 新增部署作業 → 網頁應用程式」，執行身分選「我」，存取權選「所有人」。
 */

const SHEET_NAME = '回覆';
const FAMILIES = ['1家', '2家', '3家', '4家', '5家', '6家', '7家'];
const HEADERS = [
  '時間戳記', '姓名', '家別',
  'Q1 專注持續力（分數）', 'Q1 選項',
  'Q2 拉回當下（分數）', 'Q2 選項',
  'Q3 心腦一致（分數）', 'Q3 選項',
  '總分'
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);

    const name = String(d.name || '').trim().slice(0, 30);
    const family = String(d.family || '');
    const s = ['q1', 'q2', 'q3'].map(function (k) { return Number(d[k + '_score']); });

    if (!name) throw new Error('missing name');
    if (FAMILIES.indexOf(family) === -1) throw new Error('invalid family');
    s.forEach(function (v) { if (!(v >= 1 && v <= 5)) throw new Error('invalid score'); });

    getSheet_().appendRow([
      new Date(), name, family,
      s[0], String(d.q1_answer || ''),
      s[1], String(d.q2_answer || ''),
      s[2], String(d.q3_answer || ''),
      s[0] + s[1] + s[2]
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// 用瀏覽器直接打開網頁應用程式網址時，看到 {"ok":true,...} 代表部署成功
function doGet() {
  getSheet_();
  return json_({ ok: true, message: 'Zen Club QA backend is running' });
}
