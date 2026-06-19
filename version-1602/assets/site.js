import { H as Hls } from "./hls-dru42stk.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const normalize = (value) => (value || "").toString().trim().toLowerCase();

ready(() => {
  setupMobileMenu();
  setupHeroSlider();
  setupFilters();
  setupPlayer();
});

function setupMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function setupHeroSlider() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;
  let timer = null;

  const activate = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  const start = () => {
    timer = window.setInterval(() => activate(activeIndex + 1), 5200);
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      activate(Number(dot.dataset.heroDot));
      restart();
    });
  });

  if (slides.length > 1) {
    start();
  }
}

function setupFilters() {
  const scopes = document.querySelectorAll("[data-filter-scope]");

  scopes.forEach((scope) => {
    const input = scope.querySelector("[data-filter-input]");
    const yearFilter = scope.querySelector("[data-year-filter]");
    const categoryFilter = scope.querySelector("[data-category-filter]");
    const reset = scope.querySelector("[data-filter-reset]");
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const empty = scope.querySelector("[data-empty-state]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const apply = () => {
      const query = normalize(input ? input.value : "");
      const year = yearFilter ? yearFilter.value : "";
      const category = categoryFilter ? categoryFilter.value : "";
      let visibleCount = 0;

      cards.forEach((card) => {
        const text = normalize(card.innerText + " " + card.dataset.title + " " + card.dataset.region + " " + card.dataset.type);
        const matchesQuery = !query || text.includes(query);
        const matchesYear = !year || card.dataset.year === year;
        const matchesCategory = !category || card.dataset.category === category;
        const visible = matchesQuery && matchesYear && matchesCategory;

        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount > 0;
      }
    };

    [input, yearFilter, categoryFilter].forEach((control) => {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", () => {
        if (input) {
          input.value = "";
        }
        if (yearFilter) {
          yearFilter.value = "";
        }
        if (categoryFilter) {
          categoryFilter.value = "";
        }
        apply();
      });
    }

    apply();
  });
}

function setupPlayer() {
  const video = document.querySelector("#movie-player");
  const playButton = document.querySelector("[data-play-button]");

  if (!video) {
    return;
  }

  const source = video.dataset.src;

  if (source && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(source);
    hls.attachMedia(video);
  } else if (source && video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  }

  const play = () => {
    const promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        video.controls = true;
      });
    }
  };

  if (playButton) {
    playButton.addEventListener("click", play);
    video.addEventListener("play", () => playButton.classList.add("is-hidden"));
    video.addEventListener("pause", () => playButton.classList.remove("is-hidden"));
  }
}
