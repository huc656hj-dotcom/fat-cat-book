const pages = [
  { label: "Cover", src: "assets/cover.png" },
  { label: "Project Statement", src: "assets/p01.png" },
  { label: "How the Cat Works", src: "assets/p02.png" },
  { label: "Details", src: "assets/p03.png" },
  { label: "Fat Cat Index", src: "assets/p04.png" },
  { label: "Fat Cat Evolution", src: "assets/p05.png" },
  { label: "Behind the Scenes", src: "assets/p06.png" },
];

let index = 0;
let isFlipping = false;

const flip = document.getElementById("flipLayer");
const front = flip.querySelector(".front img");
const back = flip.querySelector(".back img");
const pageA = document.querySelector("#pageA img");
const pageB = document.querySelector("#pageB img");
const indicator = document.getElementById("pageIndicator");

function showPage() {
  pageA.src = pages[index].src;
  indicator.textContent = `${pages[index].label} · ${index + 1}/${pages.length}`;
}

function flipTo(next) {
  if (isFlipping || next < 0 || next >= pages.length || next === index) return;
  isFlipping = true;

  const forward = next > index;
  flip.style.transformOrigin = forward ? "left center" : "right center";
  flip.classList.add("active");

  front.src = pages[index].src;
  back.src = pages[next].src;

  requestAnimationFrame(() => {
    flip.style.transition = "transform 0.7s cubic-bezier(.4,.2,.2,1)";
    flip.style.transform = forward ? "rotateY(-180deg)" : "rotateY(180deg)";
  });

  setTimeout(() => {
    flip.classList.remove("active");
    flip.style.transition = "none";
    flip.style.transform = "rotateY(0deg)";
    index = next;
    showPage();
    isFlipping = false;
  }, 750);
}

document.getElementById("prevBtn").addEventListener("click", () => flipTo(index - 1));
document.getElementById("nextBtn").addEventListener("click", () => flipTo(index + 1));

flip.addEventListener("transitionstart", () => flip.classList.add("shadow"));
flip.addEventListener("transitionend", () => flip.classList.remove("shadow"));

showPage();
