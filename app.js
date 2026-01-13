document.addEventListener("DOMContentLoaded", () => {
  // 你的图片都在 assets 文件夹里（看你截图）
  const PAGES = [
    "assets/cover.png",
    "assets/p01.png",
    "assets/p02.png",
    "assets/p03.png",
    "assets/p04.png",
    "assets/p05.png",
    "assets/p06.png",
  ];

  const bookEl = document.getElementById("book");
  const pageIndicator = document.getElementById("pageIndicator");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const tocBtn = document.getElementById("tocBtn");
  const fsBtn = document.getElementById("fsBtn");
  const tocModal = document.getElementById("tocModal");
  const tocList = document.getElementById("tocList");
  const closeTocBtn = document.getElementById("closeTocBtn");

  // --- 安全检查：如果 page-flip 没加载，会直接提示，而不是白屏 ---
  if (typeof St === "undefined" || !St.PageFlip) {
    bookEl.innerHTML =
      `<div style="padding:16px;font-family:system-ui;color:#111">
        PageFlip library failed to load. Check the CDN script tag order in index.html.
      </div>`;
    return;
  }

  // 用 HTML 页面方式加载，这样你的 CSS object-fit: contain 才能生效（完整显示不裁切）
  const htmlPages = PAGES.map(
    (src) => `
      <div class="page">
        <img src="${src}" alt="">
      </div>
    `
  );

  const pageFlip = new St.PageFlip(bookEl, {
    width: 600,
    height: 800,
    size: "stretch",
    minWidth: 320,
    maxWidth: 1200,
    minHeight: 420,
    ma
