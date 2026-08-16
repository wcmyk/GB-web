(function () {
  "use strict";

  // ---- Sticky header state ----
  var header = document.getElementById("site-header");
  function onScrollHeader() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  document.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  // ---- Mobile nav toggle ----
  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // ---- Reveal-on-scroll ----
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ---- Higgsfield scroll-scrub film ----
  // The hero-generated video is scrubbed frame-by-frame as the visitor
  // scrolls through the pinned film section, rather than autoplaying.
  var filmSection = document.getElementById("film-section");
  var filmVideo = document.getElementById("film-video");

  var duration = 0;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setScrubTime() {
    if (!duration || reduceMotion) return;
    var rect = filmSection.getBoundingClientRect();
    var total = filmSection.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var scrolled = -rect.top;
    var progress = Math.min(Math.max(scrolled / total, 0), 1);
    var targetTime = progress * duration;
    if (Math.abs(filmVideo.currentTime - targetTime) > 0.03) {
      try { filmVideo.currentTime = targetTime; } catch (e) { /* ignore seek errors */ }
    }
  }

  var ticking = false;
  function onScrollFilm() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        setScrubTime();
        ticking = false;
      });
      ticking = true;
    }
  }

  filmVideo.addEventListener("loadedmetadata", function () {
    duration = filmVideo.duration || 0;
    if (reduceMotion) {
      filmVideo.autoplay = true;
      filmVideo.loop = true;
      filmVideo.play().catch(function () {});
    } else {
      filmVideo.pause();
      document.addEventListener("scroll", onScrollFilm, { passive: true });
      setScrubTime();
    }
  });
})();
