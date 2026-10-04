const nav = document.querySelector<HTMLElement>("[data-site-nav]");

if (nav) {
  const threshold = 80;
  let floating = false;
  let ticking = false;
  const updateNav = () => {
    const next = window.scrollY > threshold;
    if (next !== floating) {
      floating = next;
      nav.classList.toggle("is-floating", floating);
    }
  };
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateNav();
      ticking = false;
    });
  }, { passive: true });
  updateNav();
}

const revealItems = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrowViewport = window.matchMedia("(max-width: 39.99rem)").matches;

const slides = [...document.querySelectorAll<HTMLElement>("[data-hero-slide]")];
const slideCurrent = document.querySelector<HTMLElement>("[data-slide-current]");
const slideToggle = document.querySelector<HTMLButtonElement>("[data-slide-toggle]");
const hero = document.querySelector<HTMLElement>("[data-hero]");
let activeSlide = 0;
let slideTimer = 0;
let carouselPaused = false;

const advanceSlide = () => {
    slides[activeSlide]?.classList.remove("is-active");
    activeSlide = (activeSlide + 1) % slides.length;
    slides[activeSlide]?.classList.add("is-active");
    if (slideCurrent) slideCurrent.textContent = String(activeSlide + 1).padStart(2, "0");
};

const stopCarousel = () => {
  window.clearInterval(slideTimer);
  slideTimer = 0;
};

const startCarousel = () => {
  if (reduceMotion || carouselPaused || slides.length < 2 || slideTimer) return;
  slideTimer = window.setInterval(advanceSlide, 5200);
};

if (slides.length > 1) {
  startCarousel();
  hero?.addEventListener("pointerenter", stopCarousel);
  hero?.addEventListener("pointerleave", startCarousel);
  hero?.addEventListener("focusin", stopCarousel);
  hero?.addEventListener("focusout", startCarousel);
  slideToggle?.addEventListener("click", () => {
    carouselPaused = !carouselPaused;
    slideToggle.setAttribute("aria-pressed", String(carouselPaused));
    slideToggle.setAttribute("aria-label", carouselPaused ? "Reanudar carrusel" : "Pausar carrusel");
    if (carouselPaused) stopCarousel(); else startCarousel();
  });
}

const menuToggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");

if (menuToggle && mobileMenu) {
  const setMenu = (open: boolean) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  };
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
}

if (reduceMotion || narrowViewport || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
}
