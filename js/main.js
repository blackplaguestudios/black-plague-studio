/* ============================================================
   BLACK PLAGUE STUDIOS — Site behaviour
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Loading screen (first visit per session) ---------- */
  var loader = document.getElementById("loader");
  if (loader) {
    var SEEN_KEY = "bps_loaded";
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch (e) {}

    var hideLoader = function () {
      if (loader.classList.contains("is-hidden")) return; // run once
      loader.classList.add("is-hidden");
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
      window.setTimeout(function () {
        if (loader && loader.parentNode) loader.remove();
        document.documentElement.classList.remove("is-loading");
      }, 650);
    };

    if (alreadySeen) {
      // Skip the intro on subsequent page views within the session.
      loader.remove();
      document.documentElement.classList.remove("is-loading");
    } else {
      document.documentElement.classList.add("is-loading");
      var introVideo = loader.querySelector(".loader-video");

      if (introVideo) {
        // Play the intro animation once, then reveal the site.
        introVideo.addEventListener("ended", hideLoader);
        introVideo.addEventListener("error", function () {
          // Video failed to load — fall back to a short beat after page load.
          window.addEventListener("load", function () { window.setTimeout(hideLoader, 1000); });
          window.setTimeout(hideLoader, 3000);
        });

        var playAttempt = introVideo.play && introVideo.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(function () {
            // Autoplay blocked (e.g. reduced-motion / policy) — reveal after load.
            window.addEventListener("load", function () { window.setTimeout(hideLoader, 1000); });
          });
        }
        // Safety cap so a long or stalled video never traps the visitor.
        window.setTimeout(hideLoader, 8000);
      } else {
        // No video present — show for a minimum beat after load, then hide.
        window.addEventListener("load", function () { window.setTimeout(hideLoader, 1200); });
        window.setTimeout(hideLoader, 4000); // safety net
      }
    }
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    // Close when a link is chosen or on resize to desktop.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Active nav link (based on current file) ---------- */
  var path = window.location.pathname.split("/").pop() || "index.html";
  var links = document.querySelectorAll(".main-nav a[href]");
  links.forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }
  }

  /* ---------- Contact form -> mailto ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("formStatus");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.elements.name.value || "").trim();
      var email = (form.elements.email.value || "").trim();
      var message = (form.elements.message.value || "").trim();

      if (!name || !email || !message) {
        if (status) status.textContent = "Please fill in every field before sending.";
        return;
      }

      var to = "blackplaguestudios3@gmail.com";
      var subject = "Website enquiry from " + name;
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n\n" +
        message + "\n";

      var href =
        "mailto:" + to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;
      if (status) {
        status.textContent =
          "Opening your email app… if nothing happens, email us directly at " + to + ".";
      }
    });
  }

  /* ---------- Footer year (keeps © current if desired) ---------- */
  var yearEls = document.querySelectorAll("[data-year]");
  if (yearEls.length) {
    // Brand copyright is fixed to 2025 per brief; this only fills optional spots.
    yearEls.forEach(function (el) { el.textContent = el.getAttribute("data-year") || "2025"; });
  }
})();
