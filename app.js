document.addEventListener("DOMContentLoaded", () => {
  // ===== Image list (MUST match your repo /assets filenames) =====
  const PAGES = [
    "assets/cover.png",
    "assets/p01.png",
    "assets/p02.png",
    "assets/p03.png",
    "assets/p04.png",
    "assets/p05.png",
    "assets/p06.png",
  ];

  // ===== Elements =====
  const bookEl = document.getElementById("book");
  const pageIndicator = document.getElementById("pageIndicator");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const tocBtn = document.getElementById("tocBtn");
  const fsBtn = document.getElementById("fsBtn");

  const tocModal = document.getElementById("tocModal");
  const tocList = document.getElementById("tocList");
  const closeTocBtn = document.getElementById("closeTocBtn");

  // ===== Guard rails (avoid silent white page) =====
  if (!bookEl) {
    alert('Missing container: <div id="book">');
    return;
  }
  if (typeof St === "undefined" || !St.PageFlip) {
    bookEl.innerHTML = `
      <div style="padding:16px;font-family:system-ui;color:#111">
        PageFlip library failed to load. Check index.html script order.
      </div>
    `;
    return;
  }

  // ===== Init PageFlip =====
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

  // ===== Page indicator =====
  function updateIndicator() {
    const idx = pageFlip.getCurrentPageIndex() + 1;
    pageIndicator.textContent = `${idx}/${PAGES.length}`;
  }
  pageFlip.on("flip", updateIndicator);
  updateIndicator();

  // ===== Arrows =====
  prevBtn?.addEventListener("click", () => pageFlip.flipPrev());
  nextBtn?.addEventListener("click", () => pageFlip.flipNext());

  // ===== TOC =====
  // You can rename these titles if you want.
  const TOC = PAGES.map((src, i) => ({
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
      const page = Number(el.dataset.page) - 1; // to 0-based
      pageFlip.flip(page);
      closeToc();
    });
  }

  // ===== Fullscreen =====
  fsBtn?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      // Safari iOS may block fullscreen; ignore quietly
    }
  });

  // ===== Resize / orientation =====
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => pageFlip.update(), 120);
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => pageFlip.update(), 200);
  });
});
