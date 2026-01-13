document.addEventListener("DOMContentLoaded", () => {
  // 原始插画页
  const ART_PAGES = [
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

  // ===== Build HTML pages: (art page) + (blank back) + (art page) + (blank back) ...
  // 这样翻页时，翻起来的那一面永远是 blank（纯白），不会“透出/出现另一张图”
  const htmlPages = [];
  for (const src of ART_PAGES) {
    const front = document.createElement("div");
    front.className = "page";
    front.innerHTML = `<img src="${src}" alt="">`;

    const back = document.createElement("div");
    back.className = "page blank";
    // 空白页无需内容

    htmlPages.push(front, back);
  }

  // ===== Init PageFlip
  const pageFlip = new St.PageFlip(bookEl, {
    width: 600,
    height: 800,
    size: "stretch",
    minWidth: 320,
    maxWidth: 1400,
    minHeight: 420,
    maxHeight: 1600,
    showCover: false,
    mobileScrollSupport: false,
    maxShadowOpacity: 0.25,
  });

  pageFlip.loadFromHTML(htmlPages);

  // ===== Helper: keep users on ART pages only (even indices: 0,2,4...)
  function isBlankIndex(i) {
    return i % 2 === 1;
  }
  function artIndexFromReal(i) {
    return Math.floor(i / 2) + 1; // 1-based for display
  }
  function realIndexFromArt(art1Based) {
    return (art1Based - 1) * 2;
  }

  function updateIndicator() {
    const i = pageFlip.getCurrentPageIndex(); // 0-based real index
    const artIdx = artIndexFromReal(i);
    pageIndicator.textContent = `${artIdx}/${ART_PAGES.length}`;
  }

  // 翻到空白页就自动再翻一次，确保用户不会停在 blank
  let autoFixing = false;
  function skipIfBlank() {
    if (autoFixing) return;
    const i = pageFlip.getCurrentPageIndex();
    if (isBlankIndex(i)) {
      autoFixing = true;
      // 往前翻还是往后翻：根据当前更接近哪边决定
      // 简化：一律往后翻（更符合“翻过去看到下一张内容”）
      pageFlip.flipNext();
      setTimeout(() => {
        autoFixing = false;
        updateIndicator();
      }, 50);
    } else {
      updateIndicator();
    }
  }

  pageFlip.on("flip", skipIfBlank);
  updateIndicator();

  // Buttons: always jump between art pages (step = 2)
  prevBtn?.addEventListener("click", () => {
    const i = pageFlip.getCurrentPageIndex();
    const target = Math.max(0, i - 2);
    pageFlip.flip(target);
  });

  nextBtn?.addEventListener("click", () => {
    const i = pageFlip.getCurrentPageIndex();
    const target = Math.min(htmlPages.length - 1, i + 2);
    pageFlip.flip(target);
  });

  // ===== TOC (maps to art pages)
  const TOC = ART_PAGES.map((_, i) => ({
    title: i === 0 ? "Cover" : `Page ${i}`,
    page: i + 1, // art page number (1-based)
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
      (item) => `<div class="toc-item" data-art="${item.page}">${item.title}</div>`
    ).join("");

    tocList.addEventListener("click", (e) => {
      const el = e.target.closest(".toc-item");
      if (!el) return;
      const art = Number(el.dataset.art);
      pageFlip.flip(realIndexFromArt(art));
      closeToc();
    });
  }

  // ===== Fullscreen
  fsBtn?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {}
  });

  // Resize/orientation: simplest stable approach
  window.addEventListener("orientationchange", () => setTimeout(() => location.reload(), 150));
  window.addEventListener("resize", () => {
    clearTimeout(window.__rz);
    window.__rz = setTimeout(() => location.reload(), 150);
  });
});
