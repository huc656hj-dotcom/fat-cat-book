document.addEventListener("DOMContentLoaded", () => {
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
  const shellEl = document.getElementById("shell");
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

  // Buttons: both directions
  prevBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    pageFlip.flipPrev();
  });

  nextBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    pageFlip.flipNext();
  });

  // Swipe gestures: reliable back/forward on mobile
  let startX = 0, startY = 0, isTouching = false;

  function onTouchStart(ev) {
    if (!ev.touches || ev.touches.length !== 1) return;
    isTouching = true;
    startX = ev.touches[0].clientX;
    startY = ev.touches[0].clientY;
  }

  function onTouchEnd(ev) {
    if (!isTouching) return;
    isTouching = false;

    const t = ev.changedTouches && ev.changedTouches[0];
    if (!t) return;

    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // horizontal swipe only
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx > 0) {
      // swipe right -> previous
      pageFlip.flipPrev();
    } else {
      // swipe left -> next
      pageFlip.flipNext();
    }
  }

  // attach on the whole shell so it always works
  shellEl?.addEventListener("touchstart", onTouchStart, { passive: true });
  shellEl?.addEventListener("touchend", onTouchEnd, { passive: true });

  // TOC
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

  // Fullscreen
  fsBtn?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {}
  });

  // Resize/orientation: update
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => pageFlip.update(), 120);
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => pageFlip.update(), 200);
  });
});
