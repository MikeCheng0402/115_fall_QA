# 領袖社 第二堂社課 課前QA

前端：GitHub Pages（`index.html`）
後台：Google 試算表 + Apps Script（`apps-script/Code.gs`），每筆回覆存成一列。

## 一、建立後台（Google 試算表）

1. 到 Google 雲端硬碟新增一個試算表，例如命名為「領袖社 第二堂社課 課前QA 回覆」。
2. 上方選單「擴充功能 → Apps Script」。
3. 把 `apps-script/Code.gs` 的內容整份貼上，取代原本的 `function myFunction() {}`，按儲存。
4. 右上角「部署 → 新增部署作業」，類型選「網頁應用程式」：
   - 執行身分：**我**
   - 誰可以存取：**所有人**
5. 按「部署」，第一次會要求授權，用自己的 Google 帳號同意（若出現「Google 尚未驗證這個應用程式」，點「進階 → 前往（不安全）」即可，這是你自己寫的程式）。
6. 複製產生的「網頁應用程式網址」（`https://script.google.com/macros/s/.../exec`）。
7. 用瀏覽器打開這個網址，看到 `{"ok":true,...}` 就代表成功，試算表也會自動多出「回覆」工作表和標題列。

## 二、把網址填進網站

打開 `index.html`，找到這一行，把引號裡換成剛剛的網址：

```js
const SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```

## 三、放上 GitHub Pages

1. 登入 GitHub（MikeCheng0402），右上角「+ → New repository」，名稱例如 `115_fall_QA`，設為 **Public**，建立。
2. 在 repo 頁面點「Add file → Upload files」，把 `index.html`、`README.md`、`apps-script` 資料夾拖進去，Commit。
3. 進入 repo 的「Settings → Pages」，Source 選「Deploy from a branch」，Branch 選 `main`、資料夾 `/ (root)`，Save。
4. 等一兩分鐘，網址會是：`https://mikecheng0402.github.io/115_fall_QA/`

## 四、表格欄位

回覆存在試算表的「第二堂課前QA」工作表（名稱由 `Code.gs` 的 `SHEET_NAME` 決定，第一次收到回覆時自動建立）。

| 時間戳記 | 姓名 | 家別 | Q1 分數 | Q1 選項 | Q2 分數 | Q2 選項 | Q3 分數 | Q3 選項 | Q4 分數 | Q4 選項 | 專注自評總分（Q1到Q3） |
|---|---|---|---|---|---|---|---|---|---|---|---|

- Q1 到 Q3：分數 1 到 5，越高代表專注狀態越好；專注自評總分 3 到 15。
- Q4 呼吸頻率：每分鐘呼吸次數（一吸一吐算一下），20 下以上記 1 分，15 到 20 下記 2 分，10 到 15 下記 3 分，5 到 10 下記 4 分，5 下以內記 5 分；不計入總分。

## 之後要改題目

- 題目文字與選項：改 `index.html` 裡的 `QUESTIONS`。
- 若題數或欄位名稱有變，也要同步改 `Code.gs` 的 `HEADERS` 與 `appendRow`，然後在 Apps Script「部署 → 管理部署作業 → 編輯 → 版本選『新版本』→ 部署」，網址會維持不變。
