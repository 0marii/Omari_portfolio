/**
 * Mohammed Al-Omari — Portfolio Scripts
 */

document.addEventListener("DOMContentLoaded", () => {

  // ── Mobile Navigation ────────────────────────────────────────────────────
  const toggle = document.querySelector(".nav__toggle");
  const menu   = document.querySelector(".nav__menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !open);
      menu.classList.toggle("is-open", !open);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  // ── Interactive Card Glow ────────────────────────────────────────────────
  document.querySelectorAll(".interactive-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  // ── Scroll Animations ────────────────────────────────────────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".fade-in, .fade-in-up").forEach((el) => {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.style.animationPlayState = "paused";
      observer.observe(el);
    }
  });

  // ── Active Nav Link on Scroll ────────────────────────────────────────────
  const sections = document.querySelectorAll("section[id]");
  const navLinks  = document.querySelectorAll(".nav__menu a[href^='#']");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.style.color = link.getAttribute("href") === `#${entry.target.id}`
              ? "var(--text)"
              : "";
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => sectionObserver.observe(s));

});
