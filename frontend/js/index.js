// Fade-up animation on scroll
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
