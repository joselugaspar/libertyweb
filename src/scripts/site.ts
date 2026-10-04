const nav = document.querySelector<HTMLElement>("[data-site-nav]");

if (nav) {
  const showThreshold = 96;
  const hideThreshold = 12;
  let floating = false;
  let ticking = false;
  const updateNav = () => {
    const next = floating ? window.scrollY > hideThreshold : window.scrollY > showThreshold;
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

const revealItems = [...document.querySelectorAll<HTMLElement>("[data-reveal], [data-zone-reveal]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  const menuRoot = menuToggle.closest<HTMLElement>("[data-site-nav]");
  const mobileBreakpoint = window.matchMedia("(max-width: 48rem)");
  const setMenu = (open: boolean) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  };
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("pointerdown", (event) => {
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;
    if (menuRoot?.contains(event.target as Node)) return;
    setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menuToggle.getAttribute("aria-expanded") !== "true") return;
    setMenu(false);
    menuToggle.focus();
  });
  mobileBreakpoint.addEventListener("change", (event) => {
    if (!event.matches) setMenu(false);
  });
}

document.querySelectorAll<HTMLElement>("[data-work-carousel]").forEach((carousel) => {
  const viewport = carousel.querySelector<HTMLElement>("[data-work-viewport]");
  const slides = [...carousel.querySelectorAll<HTMLElement>("[data-work-slide]")];
  const previous = carousel.querySelector<HTMLButtonElement>("[data-work-prev]");
  const next = carousel.querySelector<HTMLButtonElement>("[data-work-next]");
  const current = carousel.querySelector<HTMLElement>("[data-work-current]");
  if (!viewport || !previous || !next || !slides.length) return;

  let slideIndex = 0;
  let carouselTicking = false;
  const updateCarousel = () => {
    slideIndex = slides.reduce((closest, slide, index) => (
      Math.abs(slide.offsetLeft - viewport.scrollLeft) < Math.abs(slides[closest].offsetLeft - viewport.scrollLeft) ? index : closest
    ), 0);
    if (current) current.textContent = String(slideIndex + 1).padStart(2, "0");
    previous.disabled = slideIndex === 0;
    next.disabled = slideIndex === slides.length - 1;
  };
  const goToSlide = (index: number) => {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    viewport.scrollTo({ left: slides[target].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
  };

  previous.addEventListener("click", () => goToSlide(slideIndex - 1));
  next.addEventListener("click", () => goToSlide(slideIndex + 1));
  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goToSlide(slideIndex - 1);
    if (event.key === "ArrowRight") goToSlide(slideIndex + 1);
  });
  viewport.addEventListener("scroll", () => {
    if (carouselTicking) return;
    carouselTicking = true;
    window.requestAnimationFrame(() => {
      updateCarousel();
      carouselTicking = false;
    });
  }, { passive: true });
  updateCarousel();
});

if (reduceMotion || !("IntersectionObserver" in window)) {
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
