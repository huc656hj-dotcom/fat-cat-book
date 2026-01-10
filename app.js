// ====== 1) Put your pages here ======
// Make sure these files exist in /assets
const pages = [
  { label: "Cover", src: "assets/cover.png" },
  { label: "Project Statement", src: "assets/p01.png" },
  { label: "How the Cat Works", src: "assets/p02.png" },
  { label: "Index", src: "assets/p03.png" },
  // { label: "Cats 01–08", src: "assets/p04.png" },
  // ...
];

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// --- Elements ---
const book = document.getElementById("book");
const leftImg = document.getElementById("leftImg");
const rightImg = document.getElementById("rightImg");
const pageIndicator = document.getElementById("pageIndicator");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const flipLayer = document.getElementById("flipLayer");
const flipFrontImg = document.getElementById("flipFrontImg");
const flipBackImg = document.getElementById("flipBackImg");
const flipShadow = document.querySelector(".flip-shadow");

const tocBtn = document.getElementById("tocBtn");
const tocModal = document.getElementById("tocModal");
const tocList = document.getElementById("tocList");
const closeTocBtn = document.getElementById("closeTocBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// --- State ---
let index = 0;          // page index pointer (0..pages.length-1)
let isAnimating = false;

// Spread mode: landscape => show 2 pages (except cover special)
function isSpreadMode(){
  return window.matchMedia("(orientation: landscape)").matches && window.innerWidth >= 700;
}

// Compute what should be shown on left/right for current index
function getSpreadForIndex(i){
  if (!pages.length) return { left: null, right: null, start: 0, end: 0 };

  if (!isSpreadMode()){
    const p = pages[i] || null;
    return { left: null, right: p, start: i, end: i };
  }

  // Spread mode
  // Special: cover alone on right, left blank (like opening a book)
  if (i <= 0){
    return { left: null, right: pages[0] || null, start: 0, end: 0 };
  }

  // After cover: spreads are (1,2), (3,4), (5,6)...
  const start = 1 + Math.floor((i - 1) / 2) * 2; // 1,3,5...
  const left = pages[start] || null;
  const right = pages[start + 1] || null;
  return { left, right, start, end: Math.min(start + 1, pages.length - 1) };
}

function render(){
  if (!pages.length){
    pageIndicator.textContent = "No pages configured";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    leftImg.src = "";
    rightImg.src = "";
    return;
  }

  const spread = getSpreadForIndex(index);

  // Images
  leftImg.src = spread.left ? spread.left.src : "";
  rightImg.src = spread.right ? spread.right.src : "";

  // Indicator
  if (!isSpreadMode()){
    const label = pages[index]?.label ?? "";
    pageIndicator.textContent = `${label}  ·  ${index + 1}/${pages.length}`;
  } else {
    if (index <= 0){
      pageIndicator.textContent = `${pages[0].label}  ·  1/${pages.length}  ·  (cover)`;
    } else {
      const leftLabel = spread.left?.label ?? "";
      const rightLabel = spread.right?.label ?? "";
      pageIndicator.textContent =
        `Spread  ·  ${spread.start + 1}-${spread.end + 1}/${pages.length}` +
        `  ·  ${leftLabel}${rightLabel ? " + " + rightLabel : ""}`;
    }
  }

  // Buttons
  prevBtn.disabled = (index <= 0);
  nextBtn.disabled = (index >= pages.length - 1);
}

function goNext(){
  if (isAnimating) return;
  if (!pages.length) return;

  if (!isSpreadMode()){
    flipTo(index + 1, true);
    return;
  }

  // Spread mode:
  if (index <= 0){
    // cover -> first spread start (page 1)
    flipTo(1, true);
    return;
  }

  const nextStart = 1 + (Math.floor((index - 1) / 2) + 1) * 2; // next odd start
  flipTo(clamp(nextStart, 0, pages.length - 1), true);
}

function goPrev(){
  if (isAnimating) return;
  if (!pages.length) return;

  if (!isSpreadMode()){
    flipTo(index - 1, false);
    return;
  }

  // Spread mode:
  if (index <= 0) return;

  if (index <= 1){
    // first spread -> cover
    flipTo(0, false);
    return;
  }

  const prevStart = 1 + (Math.floor((index - 1) / 2) - 1) * 2;
  flipTo(clamp(prevStart, 0, pages.length - 1), false);
}

// Flip animation: in portrait flip full page; in landscape flip right page only (CSS makes flip layer right-half)
function flipTo(targetIndex, forward){
  targetIndex = clamp(targetIndex, 0, pages.length - 1);
  if (targetIndex === index) return;

  isAnimating = true;

  // Choose from/to visuals (we flip the "right page" visual)
  const fromSpread = getSpreadForIndex(index);
  const toSpread = getSpreadForIndex(targetIndex);

  const fromRight = (isSpreadMode() ? (fromSpread.right || fromSpread.left) : (pages[index])) || null;
  const toRight = (isSpreadMode() ? (toSpread.right || toSpread.left) : (pages[targetIndex])) || null;

  flipLayer.classList.add("animating");
  flipLayer.style.transition = "none";
  flipShadow.style.transition = "none";
  flipShadow.style.opacity = "0";

  // Prepare images
  flipFrontImg.src = fromRight ? fromRight.src : "";
  flipBackImg.src = toRight ? toRight.src : "";

  // Transform origin + direction
  if (forward){
    flipLayer.style.transformOrigin = isSpreadMode() ? "left center" : "left center";
    flipLayer.style.transform = "rotateY(0deg)";
  } else {
    flipLayer.style.transformOrigin = isSpreadMode() ? "right center" : "right center";
    flipLayer.style.transform = "rotateY(0deg)";
  }

  // Start animation
  requestAnimationFrame(() => {
    flipLayer.style.transition = "transform 560ms cubic-bezier(.2,.8,.2,1)";
    flipShadow.style.transition = "opacity 240ms ease";
    flipShadow.style.opacity = "1";

    flipLayer.style.transform = forward ? "rotateY(-180deg)" : "rotateY(180deg)";
  });

  setTimeout(() => {
    index = targetIndex;
    render();

    flipLayer.classList.remove("animating");
    flipLayer.style.transition = "none";
    flipLayer.style.transform = "rotateY(0deg)";
    flipShadow.style.opacity = "0";

    isAnimating = false;
  }, 590);
}

// --- TOC ---
function buildTOC(){
  tocList.innerHTML = "";
  pages.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "toc-item";
    item.innerHTML = `<div>${p.label}</div><span>${i+1}/${pages.length}</span>`;
    item.addEventListener("click", () => {
      tocModal.close();
      // In spread mode, jumping to an even/odd is ok; render logic will normalize it.
      index = i;
      render();
    });
    tocList.appendChild(item);
  });
}

// --- Events ---
prevBtn.addEventListener("click", goPrev);
nextBtn.addEventListener("click", goNext);

tocBtn.addEventListener("click", () => tocModal.showModal());
closeTocBtn.addEventListener("click", () => tocModal.close());

// Keyboard support (desktop)
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === "ArrowRight") goNext();
});

// Fullscreen (iOS Safari has limitations)
fullscreenBtn.addEventListener("click", async () => {
  try{
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {}
});

// Swipe support (simple)
let sx = 0, sy = 0, moved = false;
book.addEventListener("touchstart", (e) => {
  if (isAnimating) return;
  if (!e.touches || e.touches.length !== 1) return;
  sx = e.touches[0].clientX;
  sy = e.touches[0].clientY;
  moved = false;
}, { passive: true });

book.addEventListener("touchmove", (e) => {
  if (!e.touches || e.touches.length !== 1) return;
  const dx = e.touches[0].clientX - sx;
  const dy = e.touches[0].clientY - sy;
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) moved = true;
}, { passive: true });

book.addEventListener("touchend", (e) => {
  if (!moved) return;
  const ex = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : sx;
  const dx = ex - sx;
  if (dx < -30) goNext();
  if (dx > 30) goPrev();
}, { passive: true });

// Re-render on rotate/resize so spread mode updates
window.addEventListener("resize", () => render());

// Init
buildTOC();
render();
