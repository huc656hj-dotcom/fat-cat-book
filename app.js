// ====== 1) Put your pages here ======
// Tip: export each booklet page as an image, then list them in order.
const pages = [
  { label: "Cover", src: "assets/cover.png" },
  { label: "Project Statement", src: "assets/p01.png" },
  { label: "How the Cat Works", src: "assets/p02.png" },
  { label: "Index", src: "assets/p03.png" },
  // ... add more
  // { label: "No.01–No.10", src: "assets/p04.png" },
];

let index = 0;
let isAnimating = false;

const currentImg = document.getElementById("currentImg");
const nextImg = document.getElementById("nextImg");
const flipLayer = document.getElementById("flipLayer");
const flipFrontImg = document.getElementById("flipFrontImg");
const flipBackImg = document.getElementById("flipBackImg");
const pageIndicator = document.getElementById("pageIndicator");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const tocBtn = document.getElementById("tocBtn");
const tocModal = document.getElementById("tocModal");
const tocList = document.getElementById("tocList");
const closeTocBtn = document.getElementById("closeTocBtn");

const fullscreenBtn = document.getElementById("fullscreenBtn");
const book = document.querySelector(".book");

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function renderCurrent(){
  currentImg.src = pages[index].src;
  pageIndicator.textContent = `${pages[index].label}  ·  ${index+1}/${pages.length}`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === pages.length - 1;
}

function buildTOC(){
  tocList.innerHTML = "";
  pages.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "toc-item";
    item.innerHTML = `<div>${p.label}</div><span>${i+1}/${pages.length}</span>`;
    item.addEventListener("click", () => {
      tocModal.close();
      jumpTo(i);
    });
    tocList.appendChild(item);
  });
}

function jumpTo(i){
  i = clamp(i, 0, pages.length - 1);
  index = i;
  renderCurrent();
}

function flipTo(nextIndex){
  if (isAnimating) return;
  nextIndex = clamp(nextIndex, 0, pages.length - 1);
  if (nextIndex === index) return;

  const forward = nextIndex > index;
  isAnimating = true;

  // Prepare images for the flip
  // Front = current page, Back = next page (for forward)
  // For backward, we reverse the transform origin (right side)
  flipLayer.classList.add("animating");
  flipLayer.style.transition = "none";

  const fromSrc = pages[index].src;
  const toSrc = pages[nextIndex].src;

  if (forward){
    flipLayer.style.transformOrigin = "left center";
    flipFrontImg.src = fromSrc;
    flipBackImg.src = toSrc;
    nextImg.src = toSrc;
    // start position
    flipLayer.style.transform = "rotateY(0deg)";
    requestAnimationFrame(() => {
      flipLayer.style.transition = "transform 520ms cubic-bezier(.2,.8,.2,1)";
      flipLayer.style.transform = "rotateY(-180deg)";
    });
  } else {
    // Backward: simulate flipping from right to left
    flipLayer.style.transformOrigin = "right center";
    // We swap faces so it looks natural
    flipFrontImg.src = fromSrc;
    flipBackImg.src = toSrc;
    nextImg.src = toSrc;
    flipLayer.style.transform = "rotateY(0deg)";
    requestAnimationFrame(() => {
      flipLayer.style.transition = "transform 520ms cubic-bezier(.2,.8,.2,1)";
      flipLayer.style.transform = "rotateY(180deg)";
    });
  }

  // Finalize
  setTimeout(() => {
    index = nextIndex;
    renderCurrent();
    flipLayer.classList.remove("animating");
    flipLayer.style.transition = "none";
    flipLayer.style.transform = "rotateY(0deg)";
    isAnimating = false;
  }, 540);
}

// Buttons
prevBtn.addEventListener("click", () => flipTo(index - 1));
nextBtn.addEventListener("click", () => flipTo(index + 1));

// TOC
tocBtn.addEventListener("click", () => tocModal.showModal());
closeTocBtn.addEventListener("click", () => tocModal.close());

// Fullscreen (works best on Android; iOS Safari has limitations)
fullscreenBtn.addEventListener("click", async () => {
  try{
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch(e){
    // ignore
  }
});

// Swipe support
let startX = 0;
let startY = 0;
let moved = false;

book.addEventListener("touchstart", (e) => {
  if (!e.touches || e.touches.length !== 1) return;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  moved = false;
}, { passive: true });

book.addEventListener("touchmove", (e) => {
  if (!e.touches || e.touches.length !== 1) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) moved = true;
}, { passive: true });

book.addEventListener("touchend", (e) => {
  if (!moved) return;
  const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
  const dx = endX - startX;
  if (dx < -30) flipTo(index + 1);
  if (dx > 30) flipTo(index - 1);
});

// Init
buildTOC();
renderCurrent();
