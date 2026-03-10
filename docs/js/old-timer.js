// Web Notifications APIの許可リクエスト
Notification.requestPermission().then(permission => {
  console.log("通知許可:", permission);
});

// --- アナログ表示（円形プログレス）初期化 ---
const circle = document.getElementById("progress-circle");
const radius = circle.r.baseVal.value; //HTMLから半径を取得
const circumference = 2 * Math.PI * radius; //2πrで円周を計算

circle.style.strokeDasharray = circumference; // 円周の長さを初期設定
circle.style.strokeDashoffset = circumference; // 最初は円が完全に隠れている状態

// 進捗に応じて"隠す量"を変える関数
function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

// ポモドーロ回数を管理 初期値は0
let pomodoroCount = 0;

// セッションタイプと時間（分）をまとめて管理 （テスト用に短縮）
const sessionDurations = {
  work: 2,        // 作業時間 25分
  shortBreak: 1,  // 短い休憩 5分
  longBreak: 3,    // 長い休憩 15分
  longBreakFrequency: 3 // 長い休憩の頻度 とりあえず3回ごと
};

//マジックナンバー回避 - 1000ms = 1秒
const ONE_SECOND = 1000;

let seconds = sessionDurations.work * 60; // 作業時間を初期値に設定
let currentSession = "work"; // "work" / "shortBreak" / "longBreak" workを初期値に設定
let timerId = null; //setInterval()が返すIDを格納する変数。初期値はタイマーが動いていないことを示すnull

//ローカルサーバーに保存されたJSON文字列を取得
const savedSettings = JSON.parse(localStorage.getItem("pomodoroSettings"));

if (savedSettings) {
  //保存された設定があれば、sessionDurationsオブジェクトを上書き
  //pareseIntでJSON文字列を整数に変換、第二引数は基数10進数を意味する

  sessionDurations.work = parseInt(savedSettings.workDuration, 10);
  sessionDurations.shortBreak = parseInt(savedSettings.shortBreak, 10);
  sessionDurations.longBreak = parseInt(savedSettings.longBreak, 10);
  sessionDurations.longBreakFrequency = parseInt(savedSettings.longBreakFrequency, 10);
  console.log("保存された設定を読み込みました:", sessionDurations);
} else {
  console.log("保存された設定はありません。デフォルト設定を使用します。", sessionDurations);
}

//初期表示時間を"work"セッションに合わせて表示する//
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// 初期表示の更新
document.getElementById("timer-container").textContent =
  formatTime(sessionDurations[currentSession] * 60);



// カウントダウン処理 ロジックとUIが混ざってるけど放置
function countDown() {
  seconds--;
  if (seconds >= 0) {
    updateTimerUI(seconds); // ★
  } else {
    clearInterval(timerId);
    timerId = null;
    updateControlBtnUI(false); // ★
    console.log("タイマー終了！");

    // 通知
    if (Notification.permission === "granted") {
      new Notification("⏰ タイマー終了！");
    }

    // セッション管理
    if (currentSession === "work") {
      pomodoroCount++;

      updatePomodoroCountUI(); // ★

      if (pomodoroCount % 3 === 0) {
        currentSession = "longBreak";
        console.log("長い休憩へ移行");

      } else {
        currentSession = "shortBreak";
        console.log("短い休憩へ移行");

      }
      console.log("ポモドーロ回数:", pomodoroCount);
    } else {
      currentSession = "work";
      console.log("作業へ戻る");
      console.log("ポモドーロ回数:", pomodoroCount);

    }
  }
}

// セッション初期化処理
function initSession() {
  seconds = sessionDurations[currentSession] * 60; // セッションタイプに応じた秒数にリセット

  // セッションステータス表示の更新
  if (currentSession === "work") {
    console.log("作業開始");
    document.getElementById("session-status").textContent = "💼 作業中"; 
  } else if (currentSession === "shortBreak") {
    console.log("短い休憩開始");
    document.getElementById("session-status").textContent = "☕ 休憩中"; 
  } else if (currentSession === "longBreak") {
    console.log("長い休憩開始");
    document.getElementById("session-status").textContent = "🌿 長めの休憩中"; 
  }

  //タイマー表示の更新
  updateTimerUI(seconds);
}

function startSession() {
  initSession();
  
  timerId = setInterval(countDown, ONE_SECOND);
  updateControlBtnUI(true);
}

// 残り時間の表示に関するする関数
function updateTimerUI(seconds) {
  // --- デジタル表示の更新 ---
  const formatted = formatTime(seconds);
  document.getElementById("timer-container").textContent = formatted;

  // --- アナログ表示の更新 ---
  const total = sessionDurations[currentSession] * 60;
  const percent = (seconds / total) * 100;
  setProgress(percent);

  // デバッグ用ログ
  console.log("残り時間:", formatted);
}

// コントロールボタンの表示更新 innerHTMLでアイコンを表示するバージョン 
function updateControlBtnUI(isRunning) {
  const btn = document.getElementById("control-btn");
  btn.innerHTML = isRunning ? "&#9208;" : "&#9654;";
}

// ポモドーロ回数表示更新 
function updatePomodoroCountUI() {
  document.getElementById("pomodoro-count").textContent =
    `現在 ${pomodoroCount} ポモドーロ完了！`;
}

//コントロールタイマーイベント 
let hasStarted = false; // 初期状態は「まだ開始していない」
document.getElementById("control-btn").addEventListener("click", () => {
  if (!timerId) {
    if (!hasStarted || seconds <= 0) {
      // 新しいセッション開始
      startSession();
      hasStarted = true;
    } else {
      // 停止後の再開（残り時間から続行）
      console.log("タイマー再開");
      timerId = setInterval(countDown, 1000);
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


// リセットボタンイベント
document.getElementById("reset-btn").addEventListener("click", () => {

  clearInterval(timerId); // タイマーを停止
  timerId = null; // タイマーIDをリセット
  hasStarted = false; // リセット後は「まだ開始していない」状態に戻す

  initSession(); // セッションを初期化して表示を更新

  updateControlBtnUI(false); // コントロールボタンを「開始」状態に更新

  console.log("タイマーリセット");
});

