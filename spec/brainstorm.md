ブレスト用MD

indexhtmlの
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  name="viewport" → 「ビューポート（表示領域）」に関する設定
  width=device-width → ページの横幅を「その端末の画面幅」に合わせる。
  initial-scale=1.0 → ページを読み込んだときの拡大率を「1倍」にする。 

    <div class="header-right">
      <button id="menu-toggle" class="menu-toggle" aria-label="メニュー">
        <span class="material-symbols-outlined">
          more_vert
        </span>
      </button>

      <nav id="menu-bar" class="menu-bar">
        <!-- a href="#" class="login-link" aria-label="ログイン">ログイン</!-->
        <!-- a href="#" class="register-link" aria-label="新規登録">新規登録</!-->
        <a href="setting.html">設定</a>
      </nav>
    </div>


テストだからsettings-formの初期値のvalueは短い値で設定

/* ===========================
   全体レイアウト（ダークモード）
   =========================== */
:root {
  --bg-1: hsl(0 0 0);
  --bg-2: hsl(0 0 12);
  --bg-3: hsl(0 0 22);
  --bg-4: hsl(0 0 30);

  --font-1: hsl(0 0 90);
  --font-2: hsl(0 0 66);
  --font-3: hsl(0 0 39);

  --accent-1: hsl(227 95 62);
  --accent-2: hsl(227 94 50);

  --radius: 8px;

  --transition: 0.2s;

  --z-menu: 9999;
  --z-overlay: 1000;

  --opacity-muted: 0.7;

  --font-base: clamp(16px, 1.2vw, 20px);
  --font-mid: clamp(14px, 1.2vw, 16px);
  --font-small: clamp(12px, 1vw, 14px);
  --font-H2: clamp(20px, 3vw, 24px);
 
  --font-timer: clamp(50px, 3vw, 70px);

  --timer-size: clamp(220px, 50vw, 320px);

  --btn-size: clamp(35px, 8vw, 60px);
  --icon-size: clamp(20px, 5vw, 32px);

  --spacing: clamp(16px, 4vw, 24px);
}