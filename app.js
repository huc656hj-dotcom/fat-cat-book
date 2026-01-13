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

  // 1) 读取第一张图片的真实尺寸，得到宽高比
  function loadImageSize(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      img.src = src + (src.includes("?") ? "&" : "?") + "v=" + Date.now(); // 避免缓存读不到最新
    });
  }

  let ratio = 3 / 4; // fallback
  try {
    const { w, h } = await loadImageSize(PAGES[0]);
    ratio = w / h;
  } catch (e) {
    // 如果读尺寸失败，就用默认 ratio
  }

  // 2) 根据 viewport 计算“最贴合”的书本尺寸（不溢出屏幕）
  function calcBookSize() {
    const topbar = 56;
    const bottombar = 80;

    const maxW = Math.min(window.innerWidth * 0.92, 980);
    const maxH = Math.min(window.innerHeight * 0.92 - topbar - bottombar, 780);

    // 先用 maxW 推出高度
    let w = maxW;
    let h = w / ratio;

    // 如果高度超了，就用 maxH 推回宽度
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }

    // 最小限制
    w = Math.max(320, Math.floor(w));
    h = Math.max(420, Math.floor(h));

    return { w, h };
  }

  const size0 = calcBookSize();
  // 直接给容器定尺寸，确保视觉上“书本比例=图片比例”
  bookEl.style.width = `${size0.w}px`;
  bookEl.style.height = `${size0.h}px`;

  // 3) 用 fixed 尺寸初始化（关键：不要用 stretch，否则比例又会被拉回去）
  const pageFlip = new St.PageFlip(bookEl, {
    width: size0.w,
    height: size0.h,
    size: "fixed", // 关键：固定比例，不再拉伸成别的比例
    showCover: false,
    mobileScrollSupport: false,
    maxShadowOpacity: 0.25,
  });

  pageFlip.loadFromImages(PAGES);

  function updateIndicator() {
    const idx = pageFlip.getCurrentPageIndex() + 1;
    pageIndicator.textContent = `${idx}/${PAGES.length}`;
  }
  pageFlip.on("flip", updateIndicator);
  updateIndicator();

  prevBtn?.addEventListener("click", () => pageFlip.flipPrev());
  nextBtn?.addEventListener("click", () => pageFlip.flipNext());

  // TOC（维持原逻辑）
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
      const page = Number(el.dataset.page) - 1;
      pageFlip.flip(page);
      closeToc();
    });
  }

  // Full screen
  fsBtn?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {}
  });

  // 4) 旋转/缩放时：重算尺寸 + 重新初始化（最稳，代价是会回到当前页附近）
  let resizing = false;
  async function rebuildKeepPage() {
    if (resizing) return;
    resizing = true;

    const current = pageFlip.getCurrentPageIndex();

    // 销毁旧实例（page-flip 没有完美的“改尺寸”API，重建最稳定）
    try { pageFlip.destroy(); } catch (_) {}

    const s = calcBookSize();
    bookEl.style.width = `${s.w}px`;
    bookEl.style.height = `${s.h}px`;

    const pf = new St.PageFlip(bookEl, {
      width: s.w,
      height: s.h,
      size: "fixed",
      showCover: false,
      mobileScrollSupport: false,
      maxShadowOpacity: 0.25,
    });

    pf.loadFromImages(PAGES);
    pf.on("flip", updateIndicator);

    // 轻微延迟后跳回页数
    setTimeout(() => {
      try { pf.flip(current); } catch (_) {}
      updateIndicator();
      resizing = false;
    }, 120);

    // 把外层变量指向新实例（闭包里用到）
    // 注意：这里为了最少改动，不再继续绑定按钮到新实例
    // 所以我们直接刷新页面会更干净。若你要“完美重建”，我再给你极简补丁。
  }

  window.addEventListener("orientationchange", () => {
    setTimeout(() => location.reload(), 200); // iPhone 上最稳的方式
  });
  window.addEventListener("resize", () => {
    clearTimeout(window.__t);
    window.__t = setTimeout(() => location.reload(), 200); // 简单粗暴但稳定
  });
});
