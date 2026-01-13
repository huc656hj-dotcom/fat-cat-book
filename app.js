document.addEventListener("DOMContentLoaded", () => {
  // ===== 22 pages total: cover + p01..p21 =====
  const PAGES = [
    "assets/cover.png",
    ...Array.from({ length: 21 }, (_, i) => {
      const n = i + 1;
      // p01..p09 uses leading zero, p10..p21 no need
      const name = n < 10 ? `p0${n}` : `p${n}`;
      return `assets/${name}.png`;
    }),
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

  pageFlip.loadFromImages(PAGES);

  function updateIndicator() {
    const idx = pageFlip.getCurrentPageIndex() + 1;
    pageIndicator.textContent = `${idx}/${PAGES.length}`;
  }
  pageFlip.on("flip", updateIndicator);
  updateIndicator();

  // Both directions
  prevBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    pageFlip.flipPrev();
  });

  nextBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    pageFlip.flipNext();
  });

  // TOC (optional: shows Cover + Page 1..21)
  const TOC = PAGES.map((_, i) => ({
    title: i === 0 ? "Cover" : `Page ${i}`,
    page: i + 1,
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

  // Keep stable on resize
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => pageFlip.update(), 120);
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => pageFlip.update(), 200);
  });
});
