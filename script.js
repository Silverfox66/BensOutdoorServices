// ── Loader ────────────────────────────────────────────────────
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => loader?.classList.add("hide"), 700);
});

// ── Canvas Hero Image Sequence ────────────────────────────────
(function initCanvasHero() {
  const canvas  = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx     = canvas.getContext("2d");
  const section = document.getElementById("canvas-hero-section");
  const label   = document.getElementById("sceneLabel");

  const SCENES = [
    { src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=80", caption: "Lawn Mowing &amp; Edging" },
    { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80", caption: "Hedge &amp; Shrub Trimming" },
    { src: "https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?auto=format&fit=crop&w=1920&q=80", caption: "Garden Bed Care" },
    { src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80", caption: "Beautiful Results" },
    { src: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1920&q=80", caption: "Seasonal Cleanups" },
    { src: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=1920&q=80", caption: "Your Dream Yard" },
  ];

  // Preload all images
  const images = SCENES.map(({ src }) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.addEventListener("load", renderFrame);
    return img;
  });

  let lastCaptionIndex = -1;

  function drawCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return false;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale, h = ih * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    return true;
  }

  function renderFrame() {
    const sectionTop    = section.getBoundingClientRect().top + window.scrollY;
    const scrolled      = window.scrollY - sectionTop;
    const totalRange    = section.offsetHeight - window.innerHeight;
    const progress      = Math.max(0, Math.min(1, scrolled / totalRange));

    const n = images.length;
    const frameF  = progress * (n - 1);
    const frameA  = Math.min(Math.floor(frameF), n - 1);
    const frameB  = Math.min(frameA + 1, n - 1);
    const blend   = frameF - frameA;

    // Fill fallback
    ctx.fillStyle = "#0c2318";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCover(images[frameA]);
    if (blend > 0.005) {
      ctx.globalAlpha = blend;
      drawCover(images[frameB]);
      ctx.globalAlpha = 1;
    }

    // Update scene caption
    const captionIndex = Math.round(progress * (n - 1));
    if (label && captionIndex !== lastCaptionIndex) {
      lastCaptionIndex = captionIndex;
      label.innerHTML = SCENES[captionIndex].caption;
      label.style.opacity = "0";
      requestAnimationFrame(() => { label.style.opacity = "1"; });
    }
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame();
  }

  window.addEventListener("scroll",  renderFrame, { passive: true });
  window.addEventListener("resize",  resize);
  resize();
})();

// ── Main Init ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const nav       = document.querySelector(".glass-nav");
  const navLinks  = document.getElementById("nav-links");
  const mobileBtn = document.querySelector(".mobile-menu-btn");
  const progress  = document.getElementById("scroll-progress");
  const year      = document.getElementById("year");
  const hasLenis  = Boolean(window.Lenis);
  const hasGSAP   = Boolean(window.gsap && window.ScrollTrigger);
  const gsapLib   = window.gsap;
  const stLib     = window.ScrollTrigger;

  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile nav
  mobileBtn?.addEventListener("click", () => {
    const expanded = mobileBtn.getAttribute("aria-expanded") === "true";
    mobileBtn.setAttribute("aria-expanded", String(!expanded));
    navLinks?.classList.toggle("open");
  });
  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      mobileBtn?.setAttribute("aria-expanded", "false");
    });
  });

  // Lenis smooth scroll
  if (hasLenis) {
    const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (hasGSAP) lenis.on("scroll", stLib.update);
  }

  // Scroll progress bar & nav state
  window.addEventListener("scroll", () => {
    nav?.classList.toggle("scrolled", window.scrollY > 40);
    const h   = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = `${max > 0 ? Math.min((h.scrollTop / max) * 100, 100) : 0}%`;
  });

  // GSAP animations
  if (hasGSAP) {
    document.body.classList.add("anim-ready");
    gsapLib.registerPlugin(stLib);

    // Reveal on scroll
    gsapLib.utils.toArray(".reveal").forEach((el) => {
      gsapLib.fromTo(
        el,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" }
        }
      );
    });

    // Hero content parallax
    gsapLib.to(".hero-content", {
      y: -60, opacity: 0.8, ease: "none",
      scrollTrigger: {
        trigger: ".canvas-hero",
        start: "top top",
        end: "40% top",
        scrub: true
      }
    });

    // Counter animations
    document.querySelectorAll(".counter").forEach((counter) => {
      const target   = Number(counter.getAttribute("data-target")) || 0;
      const decimals = Number(counter.getAttribute("data-decimals")) || 0;
      stLib.create({
        trigger: counter, start: "top 85%", once: true,
        onEnter: () => {
          const obj = { value: 0 };
          gsapLib.to(obj, {
            value: target, duration: 2.1, ease: "power2.out",
            onUpdate: () => {
              counter.textContent = decimals > 0
                ? obj.value.toFixed(decimals)
                : Math.round(obj.value).toString();
            }
          });
        }
      });
    });

    // Step highlight on scroll
    gsapLib.utils.toArray(".step").forEach((step) => {
      stLib.create({
        trigger: step, start: "top 70%", end: "bottom 50%",
        onEnter:      () => step.classList.add("active"),
        onEnterBack:  () => step.classList.add("active"),
        onLeaveBack:  () => step.classList.remove("active")
      });
    });

    // Card entrance stagger — service & why cards
    gsapLib.utils.toArray(".service-card, .why-card").forEach((card) => {
      gsapLib.fromTo(
        card,
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%" }
        }
      );
    });

    // Testimonial cards: entrance then continuous float
    gsapLib.utils.toArray(".testimonial-card").forEach((card, i) => {
      gsapLib.fromTo(
        card,
        { y: 28, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          delay: i * 0.12,
          scrollTrigger: { trigger: card, start: "top 90%" },
          onComplete: () => {
            gsapLib.to(card, {
              y: -11,
              duration: 3.2 + i * 0.7,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1
            });
          }
        }
      );
    });

    // Section title underline reveal
    gsapLib.utils.toArray(".section-title").forEach((title) => {
      stLib.create({
        trigger: title, start: "top 88%", once: true,
        onEnter: () => title.classList.add("title-visible")
      });
    });

    // Timeline line draw
    if (document.querySelector(".timeline .line")) {
      gsapLib.fromTo(".timeline .line",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.8, ease: "power2.inOut",
          scrollTrigger: { trigger: ".timeline", start: "top 75%" }
        }
      );
    }

    // Service area map towns: staggered pop-in
    const towns = document.querySelectorAll(".service-map__town");
    if (towns.length > 0) {
      stLib.create({
        trigger: ".service-map", start: "top 80%", once: true,
        onEnter: () => {
          towns.forEach((town, i) => {
            setTimeout(() => town.classList.add("town-visible"), i * 110);
          });
        }
      });
    }

    // Service area list items slide in
    gsapLib.utils.toArray(".service-area-list li").forEach((li, i) => {
      gsapLib.fromTo(li,
        { x: -22, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.55, ease: "power2.out",
          delay: i * 0.07,
          scrollTrigger: { trigger: ".service-area-list", start: "top 85%", once: true }
        }
      );
    });

    // Stat cards pop in with scale
    gsapLib.utils.toArray(".stat-card").forEach((card, i) => {
      gsapLib.fromTo(card,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.65, ease: "back.out(1.7)",
          delay: i * 0.1,
          scrollTrigger: { trigger: ".stats-grid", start: "top 85%", once: true }
        }
      );
    });

    // Why cards: alternating slide from left/right
    gsapLib.utils.toArray(".why-card").forEach((card, i) => {
      gsapLib.fromTo(card,
        { x: i % 2 === 0 ? -35 : 35, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%" }
        }
      );
    });

    // Mouse parallax on hero content
    if (window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        document.addEventListener("mousemove", (e) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 10;
          const y = (e.clientY / window.innerHeight - 0.5) * 10;
          gsapLib.to(el, { x, y, duration: 0.8, ease: "power3.out" });
        });
      });
    }
  }

  // FAQ toggle animation
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open && hasGSAP) {
        gsapLib.fromTo(item, { y: 8 }, { y: 0, duration: 0.3, ease: "power2.out" });
      }
    });
  });

  const spotlightCards = Array.from(
    document.querySelectorAll(".service-card, .why-card, .testimonial-card, .stat-card")
  );
  if (spotlightCards.length > 0) {
    let spotlightIndex = 0;
    const rotateSpotlight = () => {
      spotlightCards.forEach((card) => card.classList.remove("card-spotlight"));
      spotlightCards[spotlightIndex]?.classList.add("card-spotlight");
      spotlightIndex = (spotlightIndex + 1) % spotlightCards.length;
    };
    rotateSpotlight();
    window.setInterval(rotateSpotlight, 1800);
  }
});
