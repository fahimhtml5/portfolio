gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

function revealAnimation() {
  document.querySelectorAll(".reveal").forEach(function (elem) {
    const innerSpans = elem.querySelectorAll(":scope > span");

    if (innerSpans.length > 0) {
      // word-by-word reveal case (jemon #quate)
      innerSpans.forEach((span) => {
        let parent = document.createElement("span");
        let child = document.createElement("span");

        parent.classList.add("parent");
        child.classList.add("child");

        child.innerHTML = span.innerHTML; // textContent er bodole innerHTML
        parent.appendChild(child);

        span.innerHTML = "";
        span.appendChild(parent);
      });
    } else {
      // single-line reveal case (jemon #my-name, h5 headings)
      let parent = document.createElement("span");
      let child = document.createElement("span");

      parent.classList.add("parent");
      child.classList.add("child");

      child.innerHTML = elem.innerHTML; // textContent er bodole innerHTML
      parent.appendChild(child);

      elem.innerHTML = "";
      elem.appendChild(parent);
    }
  });
}

function loaderAnimation() {
  document.body.classList.add("loading");

  if (window.lenis) {
    lenis.stop(); // scroll completely lock
  }

  let tl = gsap.timeline({
    onComplete: () => {
      gsap.set("#loader-wrapper", { display: "none" });
      document.body.classList.remove("loading");
      // upor er 2 ta line already execute hoye geche

      lenis.start();

      try {
        homeAnimation();
      } catch (err) {
        console.error("homeAnimation() failed:", err);
      }
    },
  });

  tl.from("#quate .child", {
    x: 100,
    opacity: 0,
    duration: 0.8,
    delay: 0.8,
    stagger: 0.28,
    ease: "power3.out",
  })
    .to(
      "#loader .parent .child, #my-name",
      { y: "-100%", duration: 1, ease: "power3.inOut" },
      "+=0.7",
    )
    .to(
      "#green",
      {
        height: "100%",
        top: 0,
        duration: 0.8,
        ease: "power3.inOut",
      },
      "-=0.3",
    )
    .to(
      "#green",
      {
        height: "0",
        duration: 1,
        delay: -0.4,
      },
      "+=0.1",
    )
    .to("#loader", {
      height: 0,
      duration: 1,
      delay: -0.9,
      ease: "power3.inOut",
    });
}

revealAnimation();
loaderAnimation();

// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis();

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 800); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

lenis.stop();
window.lenis = lenis; // global access er jonno

function initCustomScrollbar() {
  const scrollbar = document.createElement("div");
  scrollbar.classList.add("custom-scrollbar");

  const thumb = document.createElement("div");
  thumb.classList.add("custom-scrollbar-thumb");

  scrollbar.appendChild(thumb);
  document.body.appendChild(scrollbar);

  // thumb height calculate
  function updateThumb() {
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const thumbHeight = Math.max((winHeight / docHeight) * 100, 3);
    thumb.style.height = thumbHeight + "%";
  }

  // thumb position update
  function updateThumbPosition() {
    const scrollTop = lenis.scroll;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    const thumbHeight = thumb.offsetHeight;
    const maxTop = scrollbar.offsetHeight - thumbHeight;
    thumb.style.top = scrollPercent * maxTop + "px";
  }

  // scrollbar show/hide
  let hideTimeout;
  function showScrollbar() {
    scrollbar.classList.add("visible");
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      scrollbar.classList.remove("visible");
    }, 700);
  }

  lenis.on("scroll", () => {
    updateThumbPosition();
    showScrollbar();
  });

  // drag support
  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;

  thumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    startY = e.clientY;
    startScrollTop = lenis.scroll;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const delta = e.clientY - startY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollbarHeight = scrollbar.offsetHeight;
    const thumbHeight = thumb.offsetHeight;
    const scrollRatio =
      (docHeight - winHeight) / (scrollbarHeight - thumbHeight);
    lenis.scrollTo(startScrollTop + delta * scrollRatio, { immediate: true });
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
  });

  // hover এ show
  document.addEventListener("mousemove", () => {
    showScrollbar();
  });

  updateThumb();
  window.addEventListener("resize", updateThumb);
}
initCustomScrollbar();

function cursorAnimation() {
  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const cursor = document.querySelector("#cursor");
  // const heroTexts = document.querySelectorAll(".hero-text"); // querySelectorAll -> NodeList

  let mouseX = 9999;
  let mouseY = 9999;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let cx = mouseX,
    cy = mouseY,
    lastX = mouseX,
    lastY = mouseY;

  // Scale ekটা plain variable, GSAP eটাকে tween korবে
  let scale = { value: 0 };

  document.addEventListener("mouseenter", () => {
    gsap.to(scale, { value: 1, duration: 0.3, ease: "power2.out" });
  });

  document.addEventListener("mouseleave", () => {
    gsap.to(scale, { value: 0, duration: 0.3, ease: "power2.out" });
  });

  function animate() {
    cx = lerp(cx, mouseX, 0.18);
    cy = lerp(cy, mouseY, 0.18);

    const vx = mouseX - lastX;
    const vy = mouseY - lastY;
    lastX = mouseX;
    lastY = mouseY;

    const speed = clamp(Math.hypot(vx, vy), 0, 40);
    const stretch = 1 + speed / 60;
    const angle = Math.atan2(vy, vx) * (180 / Math.PI);

    // -50%,-50% offset ekhane e bake kora hocche, karon CSS-er transform JS eshe replace kore dey
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${angle}deg) scaleX(${stretch * scale.value}) scaleY(${(1 / (stretch * 0.4 + 0.6)) * scale.value})`;

    requestAnimationFrame(animate);
  }
  animate();
}
cursorAnimation();

function backToTopButton() {
  const backBtn = document.getElementById("back_btn");

  // Button click korle top e smooth scroll
  backBtn.addEventListener("click", () => {
    if (window.lenis) {
      lenis.scrollTo(0, {
        duration: 2,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      // Lenis kono karone load na hole fallback native scroll
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // Scroll position onujayi button show/hide
  const toggleVisibility = () => {
    const scrollY = window.lenis ? lenis.scroll : window.scrollY;

    if (scrollY > window.innerHeight) {
      // ek screen height scroll korar por button show hobe
      backBtn.style.display = "flex";
    } else {
      backBtn.style.display = "none";
    }
  };

  // Lenis thakle Lenis-er scroll event use koro (better sync)
  if (window.lenis) {
    lenis.on("scroll", toggleVisibility);
  } else {
    window.addEventListener("scroll", toggleVisibility);
  }
}
backToTopButton();

function valueSetters() {
  gsap.set("header", { y: "-110%", opacity: 0 });
  gsap.set("#hero-area .parent .child", { y: "100%" });
  gsap.set(".faq-title .parent .child", { y: "100%" });
}

function homeAnimation() {
  let tl = gsap.timeline();

  tl.to("header", {
    y: 0,
    opacity: 1,
    delay: -0.2,
    ease: "power2.inOut",
  });
  tl.to("#hero-area .parent .child", {
    y: 0,
    stagger: 0.2,
    duration: 1.5,
    delay: -0.5,
    ease: "power2.inOut",
  });
}

function menuAnimation() {
  const openBtn = document.getElementById("open-menu");
  const closeBtn = document.getElementById("close-menu");
  const nav = document.querySelector("nav");

  // Custom easing curve — menu er slide animation e use hobe
  CustomEase.create("tilt", "M0,0 C0.55,0 0.45,1 1,1");

  // Reusable function — hero section ke left e slide + rotate koray
  const gsapMenu = (xPercent, rotation) => {
    gsap.to("#hero-area", {
      xPercent,
      rotation,
      duration: 0.77,
      ease: "tilt",
      overwrite: true, // age chola kono animation thakle overwrite hobe, conflict hobe na
    });
  };

  // ---- Menu OPEN ----
  openBtn.addEventListener("click", () => {
    gsapMenu(-50, 12); // hero section ke left e slide + tilt

    if (window.lenis) {
      lenis.stop();
    }
  });

  // ---- Menu CLOSE ----
  closeBtn.addEventListener("click", () => {
    gsapMenu(0, 0); // hero section ke original position e ferot ana

    if (window.lenis) {
      lenis.start();
    }
  });

  // ---- Text roll-up hover animation (nav links er jonno) ----
  document.querySelectorAll(".roll-up").forEach((el) => {
    const label = el.textContent.trim();

    // Original text ke chars diye split kora, mask soho (overflow hidden thakbe)
    const out = SplitText.create(el, { type: "chars", mask: "chars" });

    // Ekta clone text toiri kora hocche — hover korle eita niche theke uthe asbe
    const clone = document.createElement("span");
    clone.className = "roll-clone";
    clone.textContent = label;
    clone.setAttribute("aria-hidden", "true"); // screen reader e duibar read hobe na
    el.appendChild(clone);

    // Clone text-o split kora hocche, same way e
    const into = SplitText.create(clone, { type: "chars", mask: "chars" });

    // Clone er chars gulo shuru te niche lukano thakbe (100% niche)
    gsap.set(into.chars, { yPercent: 100 });

    // Roll animation timeline — paused thakbe, hover e play/reverse hobe
    const roll = gsap
      .timeline({
        paused: true,
        defaults: {
          duration: 0.45,
          ease: "power3.inOut",
          // Word joto boro, stagger toto choto hobe (max 0.022s cap kora)
          stagger: Math.min(0.022, 0.25 / label.length),
        },
      })
      .to(out.chars, { yPercent: -100 }) // original text upore uthe chole jabe
      .to(into.chars, { yPercent: 0 }, 0); // clone text niche theke uthe asbe (same time e)

    // Parent <a> ba <button> thakle tar upor hover listen hobe, nahole element nijer upor e
    const target = el.closest("a, button") || el;
    target.addEventListener("mouseenter", () => roll.play());
    target.addEventListener("mouseleave", () => roll.reverse());
  });
}

function initHorizontalScroll() {
  const scrollContainer = document.querySelector(".scroll-container");
  const section = document.querySelector(".scroll-section");
  const progressAmount = document.querySelector(".progress-amount");

  function getScrollAmount() {
    const scrollWidth = scrollContainer.scrollWidth;
    const windowWidth = window.innerWidth;
    return -(scrollWidth - windowWidth);
  }

  gsap.to(scrollContainer, {
    x: getScrollAmount,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: "top 20%",
      end: () => `+=${-getScrollAmount()}`,
      scrub: true,
      invalidateOnRefresh: true,
      // markers: true,
      onUpdate: (self) => {
        const percent = (self.progress * 100).toFixed(0).padStart(2, "0");
        progressAmount.textContent = `(${percent}%)`;
      },
    },
  });

  document.querySelectorAll(".scroll-card").forEach((card) => {
    gsap.from(card, {
      x: 250,
      duration: 0.6,
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

function page3Animation() {
  document.querySelectorAll(".philosophy").forEach((elem) => {
    gsap.from(elem.querySelectorAll(".parent .child"), {
      y: "100%",
      duration: 0.5,
      ease: "power1.in",
      scrollTrigger: {
        trigger: elem,
        start: "top 90%",
        end: "bottom bottom",
      },
    });
  });
}

function stackingCards() {
  const cards = gsap.utils.toArray(".stack-card");

  cards.forEach((card, i) => {
    if (i === cards.length - 1) return;

    gsap.to(card, {
      scale: 0.9,
      opacity: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top top",
        end: () => `+=${cards[i + 1].offsetHeight}`,
        scrub: true,
      },
    });
  });
}

function processAnimation() {
  const section = document.querySelector("#page5");
  const steps = gsap.utils.toArray(".step");
  const progressFill = document.querySelector(".progress-fill");

  // ---- Title + line draw — desktop-mobile same
  gsap.from(".process-title .parent .child", {
    y: "110%",
    opacity: 1,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: {
      trigger: section,
      start: "top 50%",
    },
  });
  gsap.from(".process-desc .parent .child", {
    y: "110%",
    opacity: 1,
    duration: 0.8,
    delay: 0.4,
    ease: "power3.out",
    scrollTrigger: {
      trigger: section,
      start: "top 50%",
    },
  });

  gsap.to(".step-line", {
    scaleY: 1,
    duration: 0.8,
    stagger: 0.08,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
    },
  });

  // ---- matchMedia — screen size onujayi alada logic ----
  let mm = gsap.matchMedia();

  // ===== DESKTOP (769px+) — pinned step-journey =====
  mm.add("(min-width: 769px)", () => {
    const stepCount = steps.length;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * (stepCount - 1)}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressFill.style.width = `${self.progress * 100}%`;

          const activeIndex = Math.min(
            stepCount - 1,
            Math.floor(self.progress * stepCount)
          );

          steps.forEach((step, i) => {
            step.classList.toggle("active", i === activeIndex);
          });
        },
      },
    });

    steps.forEach((step, i) => {
      const content = step.querySelectorAll(".step-content h3, .step-content p");
      tl.to(
        content,
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
        },
        i
      );
    });

    // Cleanup function — screen resize kore desktop theke mobile e gele eta run hobe
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  });

  // ===== MOBILE (768px ebong tar niche) — simple stacked reveal, pin nai =====
  mm.add("(max-width: 768px)", () => {
    steps.forEach((step) => {
      const content = step.querySelectorAll(".step-content h3, .step-content p");

      gsap.to(content, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: step,
          start: "top 80%", // protyekta step nijer moto scroll-e visible hole reveal hobe
        },
      });

      // Active number/dot color — mobile-e "scroll kore dhoka" matro active dhore nicchi
      ScrollTrigger.create({
        trigger: step,
        start: "top 60%",
        onEnter: () => step.classList.add("active"),
        onLeaveBack: () => step.classList.remove("active"),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (steps.includes(st.trigger)) st.kill();
      });
    };
  });
}

function faqAccordion() {
  const items = gsap.utils.toArray(".faq-item");

  items.forEach((item) => {
    const header = item.querySelector(".faq-header");
    const body = item.querySelector(".faq-body");
    const bodyInner = item.querySelector(".faq-body-inner");
    const iconV = item.querySelector(".faq-icon-line--v");

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Age theke onno kono item open thakle, seta age close koro
      items.forEach((other) => {
        if (other !== item && other.classList.contains("active")) {
          closeItem(other);
        }
      });

      if (isOpen) {
        closeItem(item);
      } else {
        openItem(item);
      }
    });

    function openItem(el) {
      el.classList.add("active");
      const targetBody = el.querySelector(".faq-body");
      const targetInner = el.querySelector(".faq-body-inner");
      const targetIconV = el.querySelector(".faq-icon-line--v");

      // Plus -> X (vertical line rotate kore horizontal-er upor overlap kore)
      gsap.to(targetIconV, {
        rotate: 90,
        duration: 0.35,
        ease: "power2.inOut",
      });

      // Height 0 -> auto (GSAP scrollHeight measure kore animate kore)
      gsap.to(targetBody, {
        height: targetInner.offsetHeight,
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(targetBody, { height: "auto" }); // resize-safe, content wrap change hole o thik thakbe
        },
      });

      gsap.to(targetInner, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        delay: 0.1,
        ease: "power2.out",
      });
    }

    function closeItem(el) {
      el.classList.remove("active");
      const targetBody = el.querySelector(".faq-body");
      const targetInner = el.querySelector(".faq-body-inner");
      const targetIconV = el.querySelector(".faq-icon-line--v");

      gsap.to(targetIconV, {
        rotate: 0,
        duration: 0.35,
        ease: "power2.inOut",
      });

      // Height auto thakle direct animate kora jay na, tai age current pixel height set koro
      gsap.set(targetBody, { height: targetBody.offsetHeight });
      gsap.to(targetBody, {
        height: 0,
        duration: 0.4,
        ease: "power3.inOut",
      });

      gsap.to(targetInner, {
        opacity: 0,
        y: 12,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  });
}

function faqScrollAnimation() {
  const section = document.querySelector("#page7");

  // Left side title — protyekta line stagger kore reveal
  gsap.to(".faq-title .parent .child", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: section,
      start: "top 50%",
    },
  });

  gsap.from(".faq-subtitle .parent .child", {
    y: 40,
    opacity: 0,
    duration: 0.8,
    delay: 0.3,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 55%",
    },
  });

  // Right side — accordion rows stagger-e reveal
  gsap.from(".faq-item", {
    y: 80,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 55%",
    },
  });
}

function contactAnimation() {
  const section = document.querySelector("#page8");

  // ---- Phase 1: Label reveal ----
  gsap.to(".contact-label, .freelance-tag", {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 55%",
    },
  });

  // ---- Phase 2: Headline — SplitText diye line-by-line reveal ----
  const headlineLines = gsap.utils.toArray("#contact-headline .line");

  headlineLines.forEach((line, i) => {
    const split = SplitText.create(line, { type: "lines", mask: "lines" });

    gsap.from(split.lines, {
      y: 80,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: i * 0.08, // ek line-er por porerta slight stagger
      scrollTrigger: {
        trigger: section,
        start: "top 60%",
      },
    });
  });

  gsap.to(".scribble-underline", {
    opacity: 1,
    duration: 0.6,
    delay: 0.9,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
    },
  });

  // ---- Right side paragraph ----
  gsap.to(".contact-para", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    delay: 0.3,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
    },
  });

  // ---- CTA Button — scale + opacity ----
  gsap.to(".cta-btn", {
    scale: 1,
    opacity: 1,
    duration: 0.6,
    delay: 0.5,
    ease: "back.out(1.5)", // subtle bounce, "confident" feel
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
    },
  });

  // ---- Contact list — stagger reveal ----
  gsap.to(".contact-item", {
    x: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
    },
  });
}

// ---- Mouse-reactive glow — desktop only ----
function contactGlow() {
  const glow = document.querySelector(".contact-glow");
  const section = document.querySelector("#page8");

  let mm = gsap.matchMedia();

  mm.add("(min-width: 769px)", () => {
    const handleMouseMove = (e) => {
      const rect = section.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 theke 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(glow, {
        x: relX * 20, // 10-20px shift, spec onujayi
        y: relY * 20,
        duration: 1.2,
        ease: "power2.out",
      });
    };

    section.addEventListener("mousemove", handleMouseMove);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
    };
  });
}

// ---- Footer animation ----
function footerAnimation() {
  const footer = document.querySelector("#footer");

  gsap.to(".footer-link, .footer-badge", {
    y: 0,
    opacity: 1,
    duration: 0.7,
    stagger: 0.06,
    ease: "power2.out",
    scrollTrigger: {
      trigger: footer,
      start: "top 85%",
    },
  });

  const goodbyeSplit = SplitText.create(".footer-goodbye", { type: "chars", mask: "chars" });
  gsap.from(goodbyeSplit.chars, {
    y: 60,
    opacity: 0,
    duration: 0.8,
    stagger: 0.02,
    ease: "power3.out",
    scrollTrigger: {
      trigger: footer,
      start: "top 60%",
    },
  });
}


valueSetters();
menuAnimation();
initHorizontalScroll();
page3Animation();
stackingCards();
processAnimation();
faqAccordion();
faqScrollAnimation();
contactAnimation();
contactGlow();
footerAnimation();


function menuLinkScroll() {
  // Shob menu link, jegular href="#" diye shuru
  const menuLinks = document.querySelectorAll('nav a[href^="#"]');

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault(); // native jump bondho koro

      const targetId = link.getAttribute("href"); // jemon "#page5"
      const targetElement = document.querySelector(targetId);

      if (!targetElement) return; // target na thakle kichu koro na

      // Menu khola thakle age bondho koro (tomar age-er gsapMenu function)
      gsapMenu(0, 0);
      if (window.lenis) {
        lenis.start(); // menu bondho howar sathe sathe scroll abar enable
      }

      // Lenis diye smooth scroll target section-e
      if (window.lenis) {
        lenis.scrollTo(targetElement, {
          duration: 1.8,
          easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic
          offset: 0, // header fixed thakle ekhane negative value dite paro, jemon -80
        });
      } else {
        // Fallback, Lenis kono karone load na hole
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}
menuLinkScroll();

// ---- Footer "Back to top" button — Lenis diye scroll ----
document.getElementById("footer-back-top").addEventListener("click", () => {
  if (window.lenis) {
    lenis.scrollTo(0, { duration: 3, easing: (t) => 1 - Math.pow(1 - t, 3) });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});