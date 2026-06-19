(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var empty = document.querySelector("[data-no-results]");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!filterForm || !cards.length) {
      return;
    }

    var keywordInput = filterForm.querySelector("[name='keyword']");
    var yearSelect = filterForm.querySelector("[name='year']");
    var typeSelect = filterForm.querySelector("[name='type']");
    var keyword = normalize(keywordInput && keywordInput.value);
    var year = yearSelect ? yearSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year
      ].join(" "));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || card.dataset.year === year;
      var matchType = !type || card.dataset.type === type;
      var keep = matchKeyword && matchYear && matchType;

      card.style.display = keep ? "" : "none";
      if (keep) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterForm) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var keywordInput = filterForm.querySelector("[name='keyword']");

    if (q && keywordInput) {
      keywordInput.value = q;
    }

    filterForm.addEventListener("input", applyFilters);
    filterForm.addEventListener("change", applyFilters);
    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters();
    });
    applyFilters();
  }
})();
