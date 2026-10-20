/**
 * 領袖社 課前QA：共用後台接收程式（支援第二堂、第三堂、第四堂）
 *
 * 使用方式：在原本那份 Google 試算表的「擴充功能 → Apps Script」，把本檔內容整份貼上取代舊程式，
 * 再「部署 → 管理部署作業 → 編輯（鉛筆）→ 版本選『新版本』→ 部署」，網址不變。
 *
 * 每堂課的回覆會寫進各自的工作表（第一次收到回覆時自動建立，含標題列）。
 * 網頁送出時會帶 form 欄位（例如 "class3"）；沒有帶的舊網頁一律視為第二堂。
 * 之後新增一堂課：在 FORMS 裡複製一段 class4，改工作表名稱、欄位與 build 即可。
 * withRole: true 的表單會多收「身分」（社員、幹部、家族長），放在姓名與家別之間。
 */

const FAMILIES = ['1家', '2家', '3家', '4家', '5家', '6家', '7家'];
const ROLES = ['社員', '幹部', '家族長'];

const FORMS = {
  class2: {
    sheet: '第二堂課前QA',
    headers: [
      '時間戳記', '姓名', '家別',
      'Q1 專注持續力（分數）', 'Q1 選項',
      'Q2 拉回當下（分數）', 'Q2 選項',
      'Q3 心腦一致（分數）', 'Q3 選項',
      'Q4 呼吸頻率（分數）', 'Q4 選項',
      '專注自評總分（Q1到Q3）',
      '想問講師的問題'
    ],
    build: function (d) {
      const keys = ['q1', 'q2', 'q3', 'q4'];
      const s = keys.map(function (k) { return Number(d[k + '_score']); });
      s.forEach(function (v) { if (!(v >= 1 && v <= 5)) throw new Error('invalid score'); });
      const cols = [];
      keys.forEach(function (k, i) { cols.push(s[i], safe_(d[k + '_answer'])); });
      cols.push(s[0] + s[1] + s[2]);
      return cols;
    }
  },

  class3: {
    sheet: '第三堂課前QA',
    headers: [
      '時間戳記', '姓名', '家別',
      'Q1 不求回報的付出',
      'Q2 精神導師或典範人物',
      'Q3 領袖最重要的特質',
      'Q4 對世界和平的看法',
      'Q5 專注大腦實作的困難（複選）',
      '想問講師的問題'
    ],
    build: function (d) {
      const cols = ['q1', 'q2', 'q3', 'q4'].map(function (k) { return choice_(d[k]); });
      const multi = Array.isArray(d.q5) ? d.q5 : [];
      if (multi.length < 1 || multi.length > 6) throw new Error('invalid q5');
      cols.push(multi.map(choice_).join('、'));
      return cols;
    }
  },

  class4: {
    sheet: '第四堂課前QA',
    withRole: true,
    headers: [
      '時間戳記', '姓名', '身分', '家別',
      'Q1 平常會不會主動觀察自己',
      'Q2 感到壓力時的第一反應',
      'Q3 壓力很大時怎麼調整',
      'Q4 禪定時專注力被拉走的第一反應',
      '想問講師的問題'
    ],
    build: function (d) {
      return ['q1', 'q2', 'q3', 'q4'].map(function (k) { return choice_(d[k]); });
    }
  }
};

// 答案格式為「A 關鍵字」或「A 選項句子」，檢查格式並避免被當成公式
function choice_(v) {
  const t = String(v || '').trim();
  if (!/^[A-F] \S/.test(t) || t.length > 80) throw new Error('invalid answer');
  return t;
}

// 以 = + - @ 開頭的文字前面加 '，避免被試算表當成公式執行
function safe_(v) {
  const t = String(v || '');
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function getSheet_(f) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(f.sheet);
  if (!sheet) sheet = ss.insertSheet(f.sheet);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(f.headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, f.headers.length).setFontWeight('bold');
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

    const f = FORMS[d.form || 'class2'];
    if (!f) throw new Error('unknown form');

    const name = String(d.name || '').trim().slice(0, 30);
    const family = String(d.family || '');
    const ask = String(d.ask || '').trim().slice(0, 500);
    if (!name) throw new Error('missing name');
    if (FAMILIES.indexOf(family) === -1) throw new Error('invalid family');

    const row = [new Date(), safe_(name)];
    if (f.withRole) {
      const role = String(d.role || '');
      if (ROLES.indexOf(role) === -1) throw new Error('invalid role');
      row.push(role);
    }
    row.push(family);
    const fullRow = row.concat(f.build(d), [safe_(ask)]);
    getSheet_(f).appendRow(fullRow);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// 用瀏覽器直接打開網頁應用程式網址時，看到 {"ok":true,...} 代表部署成功
function doGet() {
  return json_({ ok: true, message: 'Leadership Club QA backend is running', forms: Object.keys(FORMS) });
}
