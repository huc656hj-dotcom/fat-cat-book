// ===== 1) Put your real image list here (matches your repo) =====
const PAGES = [
  "assets/cover.png",
  "assets/p01.png",
  "assets/p02.png",
  "assets/p03.png",
  "assets/p04.png",
  "assets/p05.png",
  "assets/p06.png"
];

// Optional TOC titles (same length or shorter)
const TOC = [
  { title: "Cover", page: 1 },
  { title: "Page 1", page: 2 },
  { title: "Page 2", page: 3 },
  { title: "Page 3", page: 4 },
  { title: "Page 4", page: 5 },
  { title: "Page 5", page: 6 },
  { title: "Page 6", page: 7 }
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

// ===== 2) Size helper: keep centered + fit any screen =====
function getBookSize() {
  const topbar = 56;
  const bottombar = 80;

  const w = Math.min(window.innerWidth * 0.92, 980);
  const h = Math.min(window.innerHeight * 0.92 - topbar - bottombar, 780);

  return {
    w: Math.max(320, Math.floor(w)),
    h: Math.max(420, Math.floor(h))
  };
}

const { w: initW, h: initH } = getBookSize();

// ===== 3) Init PageFlip =====
const pageFlip = new St.PageFlip(bookEl, {
  width: initW,
  height: initH,

  size: "stretch",
  minWidth: 320,
  maxWidth: 1200,
  minHeight: 420,
  maxHeight: 1400,

  showCover: false,
  mobileScrollSupport: false,
  maxShadowOpacity: 0.25
});

// Wrap image URLs as HTML pages so we can force object-fit: contain
const pageHtml = PAGES.map((src) => {
  return `
    <div class="page">
      <img src="${src}" alt="">
    </div>
  `;
});

pageFlip.loadFromHTML(pageHtml);

// ===== 4) Controls =====
prevBtn.addEventListener("click", () => pageFlip.flipPrev());
nextBtn.addEventListener("click", () => pageFlip.flipNext());

function updateIndicator() {
  // PageFlip uses 0-based index internally; getCurrentPageIndex() returns 0..n-1
  const idx = pageFlip.getCurrentPageIndex() + 1;
  pageIndicator.textContent = `${idx}/${PAGES.length}`;
}

pageFlip.on("flip", updateIndicator);
pageFlip.on("changeOrientation", updateIndicator);
pageFlip.on("changeState", updateIndicator);
updateIndicator();

// Resize on rotation / window resize
function applyResize() {
  const { w, h } = getBookSize();
  pageFlip.updateFromHtml(bookEl); // safe refresh
  pageFlip.getSettings().width = w;
  pageFlip.getSettings().height = h;
  pageFlip.update();
}
window.addEventListener("resize", () => {
  // debounce-ish
  clearTimeout(window.__r);
  window.__r = setTimeout(applyResize, 120);
});
window.addEventListener("orientationchange", () => setTimeout(applyResize, 200));

// ===== 5) TOC modal =====
function openToc() {
  tocModal.classList.add("show");
  tocModal.setAttribute("aria-hidden", "false");
}
function closeToc() {
  tocModal.classList.remove("show");
  tocModal.setAttribute("aria-hidden", "true");
}

tocBtn.addEventListener("click", openToc);
closeTocBtn.addEventListener("click", closeToc);
tocModal.addEventListener("click", (e) => {
  if (e.target === tocModal) closeToc();
});

tocList.innerHTML = TOC.map(item => {
  return `<div class="toc-item" data-page="${item.page}">${item.title}</div>`;
}).join("");

tocList.addEventListener("click", (e) => {
  const el = e.target.closest(".toc-item");
  if (!el) return;
  const page = Number(el.dataset.page) - 1; // to 0-based
  pageFlip.flip(page);
  closeToc();
});

// ===== 6) Fullscreen =====
fsBtn.addEventListener("click", async () => {
  const elem = document.documentElement;
  try {
    if (!document.fullscreenElement) {
      await elem.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    // If browser blocks, ignore quietly
  }
});
