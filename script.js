/**
 * Portfolio Interactive Scripts
 */

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Toggle
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");
  const hamburger = document.querySelector(".hamburger");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !expanded);
      menu.classList.toggle("is-open", !expanded);

      if (!expanded) {
        hamburger.style.background = "transparent";
        hamburger.style.setProperty("--pseudo-top", "0");
        hamburger.style.setProperty("--pseudo-rotate", "45deg");
        hamburger.style.setProperty("--pseudo-bottom", "0");
        hamburger.style.setProperty("--pseudo-rotate-bot", "-45deg");
      } else {
        hamburger.style.background = "";
      }
    });

    // Close menu when a link is clicked
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        hamburger.style.background = "";
      });
    });
  }

  // Interactive Card Glow Effect (Mouse Follow)
  const cards = document.querySelectorAll(".interactive-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
        // Add a class that triggers the CSS animation if it was paused or to ensure it fully plays
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Note: Elements using 'fade-in-up' or 'fade-in' already have animations,
  // but if we want to pause them until scroll:
  const animatedElements = document.querySelectorAll(".fade-in, .fade-in-up");
  animatedElements.forEach((el) => {
    // Only pause elements below the fold initially
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.style.animationPlayState = "paused";
      observer.observe(el);
    }
  });
});
