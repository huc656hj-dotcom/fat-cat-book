document.addEventListener("DOMContentLoaded", async () => {
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

  if (!bookEl) return;

  if (typeof St === "undefined" || !St.PageFlip) {
    bookEl.innerHTML = `
      <div style="padding:16px;font-family:system-ui;color:#111;background:#fff;border-radius:12px">
        PageFlip library failed to load. Check index.html script order.
      </div>
    `;
    return;
  }

  // ---- 1) Read the real pixel size of the first image ----
  function loadImageSize(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      // cache-bust so GitHub/Safari won't reuse old images while testing
      img.src = src + (src.includes("?") ? "&" : "?") + "v=" + Date.now();
    });
  }

  // cover.png 的尺寸决定“清晰上限”
  let imgW = 1200, imgH = 1600; // fallback
  try {
    const size = await loadImageSize(PAGES[0]);
    imgW = size.w;
    imgH = size.h;
  } catch (_) {}

  // Retina：图片像素 / DPR 才是“清晰的 CSS 尺寸上限”
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const crispMaxW = Math.floor(imgW / dpr);
  const crispMaxH = Math.floor(imgH / dpr);

  // ---- 2) Choose a book size that fits screen AND never exceeds crisp limit ----
  function calcBookSize() {
    const topbar = 56;
    const bottombar = 80;

    // 屏幕允许的最大尺寸
    const screenMaxW = Math.floor(Math.min(window.innerWidth * 0.92, 980));
    const screenMaxH = Math.floor(Math.min(window.innerHeight * 0.92 - topbar - bottombar, 780));

    // 真正的最大尺寸 = 屏幕允许 && 清晰上限 取更小
    const maxW = Math.max(320, Math.min(screenMaxW, crispMaxW));
    const maxH = Math.max(420, Math.min(screenMaxH, crispMaxH));

    // 保持图片比例（以第一张图比例为准）
    const ratio = imgW / imgH;
    let w = maxW;
    let h = Math.floor(w / ratio);
    if (h > maxH) {
      h = maxH;
      w = Math.floor(h * ratio);
    }

    return { w, h };
  }

  const { w, h } = calcBookSize();

  // 直接给容器锁定尺寸（避免被 CSS 拉大）
  bookEl.style.width = `${w}px`;
  bookEl.style.height = `${h}px`;

  // ---- 3) Init PageFlip with fixed size (prevents upscaling blur) ----
  const pageFlip = new St.PageFlip(bookEl, {
    width: w,
    height: h,
    size: "fixed",              // 关键：固定像素尺寸，不让它为了屏幕去放大
    showCover: false,
    mobileScrollSupport: false,
    maxShadowOpacity: 0.25,
  });

  pageFlip.loadFromImages(PAGES);

  // ---- 4) Page indicator ----
  function updateIndicator() {
    const idx = pageFlip.getCurrentPageIndex() + 1;
    pageIndicator.textContent = `${idx}/${PAGES.length}`;
  }
  pageFlip.on("flip", updateIndicator);
  updateIndicator();

  // ---- 5) Arrows ----
  prevBtn?.addEventListener("click", () => pageFlip.flipPrev());
  nextBtn?.addEventListener("click", () => pageFlip.flipNext());

  // ---- 6) TOC ----
  const TOC = PAGES.map((_, i) => ({
    title: i === 0 ? "Cover" : `Page ${i}`,
    page: i + 1
  }));

  function openToc() {
    tocModal.classList.add("show");
    tocModal.setAttribute("aria-hidden", "false");
  }
  function closeToc() {
    tocModal.classList.remove("show");
    tocModal.setAttribute("aria-hidden", "true");
  }

  tocBtn?.addEventListener("click", openToc);
  closeTocBtn?.addEventListener("click", closeToc);
  tocModal?.addEventListener("click", (e) => {
    if (e.target === tocModal) closeToc();
  });

  if (tocList) {
    tocList.innerHTML = TOC.map(
      (item) => `<div class="toc-item" data-page="${item.page}">${item.title}</div>`
    ).join("");

    tocList.addEventListener("click", (e) => {
      const el = e.target.closest(".toc-item");
      if (!el) return;
      pageFlip.flip(Number(el.dataset.page) - 1);
      closeToc();
    });
  }

  // ---- 7) Full screen ----
  fsBtn?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {}
  });

  // ---- 8) On resize/orientation: reload (simplest + avoids re-init bugs) ----
  window.addEventListener("orientationchange", () => setTimeout(() => location.reload(), 150));
  window.addEventListener("resize", () => {
    clearTimeout(window.__rz);
    window.__rz = setTimeout(() => location.reload(), 150);
  });
});
