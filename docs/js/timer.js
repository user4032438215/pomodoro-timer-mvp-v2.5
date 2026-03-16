// ===============================
// ① 設定層（Config Layer）
// ===============================

// Web Notifications APIの許可リクエスト
Notification.requestPermission().then(permission => {
  console.log("通知許可:", permission);
});

// セッションタイプと時間（分）をまとめて管理 （初期値はテスト用に短縮）
const sessionDurations = {
  work: 2,        // 作業時間 25分
  shortBreak: 1,  // 短い休憩 5分
  longBreak: 3,    // 長い休憩 15分
  longBreakFrequency: 3 // 長い休憩の頻度 とりあえず3回ごと
};

// アナログ表示（円形プログレス）初期化
const circle = document.getElementById("progress-circle");
const radius = circle.r.baseVal.value; //HTMLから半径を取得
const circumference = 2 * Math.PI * radius; //2πrで円周を計算
circle.style.strokeDasharray = circumference; // 円周の長さを初期設定(線を円状に描写したと考えればよい)
circle.style.strokeDashoffset = circumference; // 最初は円が完全に隠れている状態

const ONE_SECOND = 1000; // マジックナンバー回避 1000ms = 1秒
let seconds = sessionDurations.work * 60; // 作業時間を初期値に設定
let currentSession = "work"; // "work" / "shortBreak" / "longBreak" workを初期値に設定
let pomodoroCount = 0; // ポモドーロ回数を管理 初期値は0
let hasStarted = false; // タイマーが開始されたかどうかを管理するフラグ 初期値はfalse
let timerId = null; //setInterval()が返すIDを格納する変数。初期値はタイマーが動いていないことを示すnull

//ローカルサーバーに保存されたJSON文字列を取得
const savedSettings = JSON.parse(localStorage.getItem("pomodoroSettings"));
if (savedSettings) {
  //保存された設定があれば、sessionDurationsオブジェクトを上書き pareseIntでJSON文字列を整数に変換、第二引数は基数10進数を意味する
  sessionDurations.work = parseInt(savedSettings.workDuration, 10);
  sessionDurations.shortBreak = parseInt(savedSettings.shortBreak, 10);
  sessionDurations.longBreak = parseInt(savedSettings.longBreak, 10);
  sessionDurations.longBreakFrequency = parseInt(savedSettings.longBreakFrequency, 10);
  console.log("保存された設定を読み込みました:", sessionDurations);
} else {
  console.log("保存された設定はありません。デフォルト設定を使用します。", sessionDurations);
}

// 進捗に応じてアナログ表記の"隠す量"を変える関数
function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

// ===============================
// ② ロジック層（Logic Layer）
// ===============================

// 初期表示時間をセッションに合わせて表示する 秒 → "MM:SS"
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// 初期表示の更新
document.getElementById("timer-container").textContent =
  formatTime(sessionDurations[currentSession] * 60);

// セッション初期化共通処理
function initSession() {
  seconds = sessionDurations[currentSession] * 60; // セッションタイプに応じた秒数に初期化

  updateSessionStatusUI();
  updateTimerUI(seconds);
}

// セッション開始
function startSession() {
  initSession();

  timerId = setInterval(countDown, ONE_SECOND);
  updateControlBtnUI(true);
}

// カウントダウン処理 ロジックとUIが混ざってるけど放置
function countDown() {
  seconds--;

  if (seconds >= 0) {
    updateTimerUI(seconds);
    console.log("残り時間:", formatTime(seconds));
    return;
  }

  // タイマー終了
  clearInterval(timerId);
  timerId = null;
  updateControlBtnUI(false);
  if (Notification.permission === "granted") {
    new Notification("⏰ タイマー終了！");
  }
  console.log("タイマー終了！");

  // セッション切り替えと UI（updatePomodoroCountUI）が混ざってるけど放置
  if (currentSession === "work") {
    pomodoroCount++;
    updatePomodoroCountUI();
    console.log("ポモドーロ回数:", pomodoroCount);

    pomodoroCount % sessionDurations.longBreakFrequency === 0
      ? currentSession = "longBreak"
      : currentSession = "shortBreak";
    console.log("現在のセッション:", currentSession);
  } else {
    currentSession = "work";
    console.log("現在のセッション:", currentSession);
  }
}

// ===============================
// ③ UI層（UI Layer）
// ===============================

// 残り時間の表示更新
function updateTimerUI(seconds) {
  // --- デジタル表示の更新 ---
  const formatted = formatTime(seconds);
  document.getElementById("timer-container").textContent = formatted;

  // --- アナログ表示の更新 ---
  const total = sessionDurations[currentSession] * 60;
  const percent = (seconds / total) * 100;
  setProgress(percent);
}

// セッションステータス表示更新
function updateSessionStatusUI() {
  const status = document.getElementById("session-status");

  if (currentSession === "work") {
    status.textContent = "💼 作業中";
  } else if (currentSession === "shortBreak") {
    status.textContent = "☕ 休憩中";
  } else if (currentSession === "longBreak") {
    status.textContent = "🌿 長めの休憩中";
  }
}

// control-btnの表示更新 
function updateControlBtnUI(isRunning) {
  const btn = document.getElementById("control-btn");

  const playSVG = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <polygon points="10,7 17,12 10,17" />
    </svg>
  `;

  const pauseSVG = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round">
      <line x1="9"  y1="6" x2="9"  y2="18" />
      <line x1="15" y1="6" x2="15" y2="18" />
    </svg>
  `;

  // btn.innerHTML = isRunning ? playSVG : pauseSVG;
  btn.innerHTML = isRunning ? pauseSVG : playSVG;
}

// reset-btnの表示更新
function showResetBtn() {
  document.getElementById("reset-btn").style.display = "flex";
}

function hideResetBtn() {
  document.getElementById("reset-btn").style.display = "none";
}

// ポモドーロ回数表示更新 
function updatePomodoroCountUI() {
  document.getElementById("pomodoro-count").textContent =
    `現在 ${pomodoroCount} ポモドーロ完了！`;
}

// ===============================

//control-btnイベント 
document.getElementById("control-btn").addEventListener("click", () => {
  showResetBtn();
  if (!timerId) {
    if (!hasStarted || seconds <= 0) {
      // 新しいセッション開始
      startSession();
      hasStarted = true;
    } else {
      // 停止後の再開（残り時間から続行）
      console.log("タイマー再開");
      timerId = setInterval(countDown, ONE_SECOND);
      updateControlBtnUI(true);
    }
  } else {
    //停止処理
    console.log("タイマー停止");
    clearInterval(timerId);
    timerId = null;
    updateControlBtnUI(false);
  }
});

// reset-btnイベント
document.getElementById("reset-btn").addEventListener("click", () => {

  clearInterval(timerId); // タイマーを停止
  timerId = null; // タイマーIDをリセット
  hasStarted = false; // リセット後は「まだ開始していない」状態に戻す

  initSession(); // セッションを初期化して表示を更新

  updateControlBtnUI(false); // コントロールボタンを「開始」状態に更新

  console.log("タイマーリセット");
});

// menu-toggle, menu-barイベント
const menuToggle = document.getElementById("menu-toggle");
const menuBar = document.getElementById("menu-bar");

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  menuBar.classList.add("is-open");
});

document.addEventListener("click", (e) => {
  if (!menuBar.contains(e.target) && !menuToggle.contains(e.target)) {
    menuBar.classList.remove("is-open");
  }
});