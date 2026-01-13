document.addEventListener("DOMContentLoaded", () => {

  const pages = [
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

  if (!bookEl) {
    alert("Book container not found");
    return;
  }

  if (typeof St === "undefined") {
    alert("PageFlip not loaded");
    return;
  }

  const pageFlip = new St.PageFlip(bookEl, {
    width: 600,
    height: 800,

    size: "stretch",          // 关键：自动适配屏幕
    minWidth: 320,
    maxWidth: 1200,
    minHeight: 420,
    maxHeight: 1400,

    showCover: false,
    mobileScrollSupport: false,
    maxShadowOpacity: 0.25,
  });

  // ✅ 用最稳定的方式加载图片
  pageFlip.loadFromImages(pages);

  function updateIndicator() {
    const idx = pageFlip.getCurrentPageIndex() + 1;
    pageIndicator.textContent = `${idx}/${pages.length}`;
  }

  pageFlip.on("flip", updateIndicator);
  updateIndicator();

  prevBtn?.addEventListener("click", () => pageFlip.flipPrev());
  nextBtn?.addEventListener("click", () => pageFlip.flipNext());

  // 屏幕变化时刷新尺寸
  window.addEventListener("resize", () => pageFlip.update());
  window.addEventListener("orientationchange", () => {
    setTimeout(() => pageFlip.update(), 200);
  });
});
