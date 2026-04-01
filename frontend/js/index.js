// Fade-up animation on scroll (RETAINED FOR OTHER PAGES)
const elements = document.querySelectorAll('.fade-up');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  },
  { threshold: 0.15 }
);

elements.forEach(el => observer.observe(el));

// Loader helpers (used later everywhere)
window.showLoader = function (text = "Loading...") {
  document.getElementById("loader-text").innerText = text;
  document.getElementById("global-loader").classList.remove("d-none");
};

window.hideLoader = function () {
  document.getElementById("global-loader").classList.add("d-none");
};

/* =========================================
   GSAP ANIMATIONS FOR INDEX.HTML
   ========================================= */

// ensure GSAP is available (only runs on index.html where gsap is included)
document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // 1. Navbar fade in
    gsap.from(".gs-nav-item", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    });

    // 2. Hero Section Timeline
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    heroTl.from(".gs-hero-item", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        delay: 0.2
    })
    .from(".gs-hero-visual", {
        scale: 0.8,
        opacity: 0,
        duration: 1.2
    }, "-=0.8")
    .from(".gs-scroll-indicator", {
        y: -10,
        opacity: 0,
        duration: 0.8
    }, "-=0.5");

    // 3. Features Section
    gsap.from(".gs-feature-title", {
        scrollTrigger: {
            trigger: "#features",
            start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8
    });

    gsap.from(".gs-feature-subtitle", {
        scrollTrigger: {
            trigger: "#features",
            start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.1
    });

    gsap.from(".gs-feature-card", {
        scrollTrigger: {
            trigger: ".gs-feature-card",
            start: "top 85%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.2)"
    });

    // 4. Architecture Section
    gsap.from(".gs-arch-text .section-title, .gs-arch-text p", {
        scrollTrigger: {
            trigger: "#architecture",
            start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });

    gsap.from(".tech-item", {
        scrollTrigger: {
            trigger: ".tech-list",
            start: "top 85%",
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15
    });

    gsap.from(".flow-node", {
        scrollTrigger: {
            trigger: ".gs-arch-visual",
            start: "top 75%",
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)"
    });

    gsap.from(".flow-arrow", {
        scrollTrigger: {
            trigger: ".gs-arch-visual",
            start: "top 75%",
        },
        y: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        delay: 0.4
    });

    // 5. Workflow Timeline (The AI Pipeline)
    gsap.from(".gs-wf-header > *", {
        scrollTrigger: {
            trigger: "#workflow",
            start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2
    });

    // Timeline Line Progress
    gsap.to(".timeline-progress", {
        scrollTrigger: {
            trigger: ".workflow-container",
            start: "top center",
            end: "bottom center",
            scrub: 1
        },
        height: "100%",
        ease: "none"
    });

    // Workflow Steps
    const steps = gsap.utils.toArray(".gs-wf-step");
    steps.forEach((step, i) => {
        // Animate the card
        gsap.from(step.querySelector(".step-card"), {
            scrollTrigger: {
                trigger: step,
                start: "top 85%",
                toggleActions: "play reverse play reverse"
            },
            x: i % 2 === 0 ? 50 : -50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });

        // Animate the dot
        gsap.from(step.querySelector(".timeline-dot"), {
            scrollTrigger: {
                trigger: step,
                start: "top 60%",
                toggleActions: "play reverse play reverse"
            },
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(2)"
        });
    });

    // 6. CTA Section
    gsap.from(".gs-cta-section .glass-panel", {
        scrollTrigger: {
            trigger: ".gs-cta-section",
            start: "top 85%"
        },
        y: 50,
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});
