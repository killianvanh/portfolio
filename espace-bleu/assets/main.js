/* Espace Bleu — interactions (vanilla JS) */
(function () {
  "use strict";

  /* ---- Sticky nav: solidify on scroll ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const toggle = document.getElementById("navToggle");
  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav__menu a").forEach((a) =>
    a.addEventListener("click", closeMenu)
  );
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---- Reveal on scroll ---- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---- Contact form validation (no alert) ---- */
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");
  const setError = (field, on) => field.classList.toggle("invalid", on);
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    const checks = [
      ["#f-name", (v) => v.trim().length > 1],
      ["#f-email", (v) => emailOk(v.trim())],
      ["#f-type", (v) => v !== ""],
      ["#f-msg", (v) => v.trim().length > 3],
    ];
    checks.forEach(([sel, test]) => {
      const input = form.querySelector(sel);
      const field = input.closest(".field");
      const valid = test(input.value);
      setError(field, !valid);
      if (!valid && ok) input.focus();
      ok = ok && valid;
    });
    if (!ok) return;
    form.querySelectorAll("input, select, textarea, button").forEach((el) => (el.disabled = true));
    success.classList.add("show");
    success.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", () => {
      const field = input.closest(".field");
      if (field.classList.contains("invalid")) setError(field, false);
    });
  });

  /* ---- Demo badge dismiss ---- */
  const badge = document.getElementById("demoBadge");
  const close = document.getElementById("demoClose");
  if (close) close.addEventListener("click", () => badge.remove());

  /* ---- Light parallax on hero image ---- */
  if (!reduce) {
    const heroImg = document.querySelector(".hero__media img");
    if (heroImg) {
      window.addEventListener(
        "scroll",
        () => {
          const y = window.scrollY;
          if (y < window.innerHeight) heroImg.style.transform = "translateY(" + y * 0.18 + "px) scale(1.06)";
        },
        { passive: true }
      );
    }
  }
})();
