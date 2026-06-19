(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var nav = document.getElementById("main-nav");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function setSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function move(step) {
                setSlide(index + step);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    move(1);
                }, 5000);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    move(-1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                    restart();
                });
            }

            restart();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var target = document.querySelector(targetSelector);
            var search = panel.querySelector("[data-filter-search]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var empty = panel.parentElement ? panel.parentElement.querySelector("[data-empty-state]") : null;

            if (!target) {
                return;
            }

            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var q = normalize(search ? search.value : "");
                var y = normalize(year ? year.value : "");
                var t = normalize(type ? type.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type")
                    ].join(" "));
                    var matchSearch = !q || text.indexOf(q) !== -1;
                    var matchYear = !y || normalize(card.getAttribute("data-year")) === y;
                    var matchType = !t || normalize(card.getAttribute("data-type")) === t;
                    var show = matchSearch && matchYear && matchType;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [search, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            if (search && params.get("q")) {
                search.value = params.get("q");
                apply();
            }
        });
    });
})();

function setupMoviePlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var attached = false;
    var hlsPlayer = null;

    if (!video || !button || !sourceUrl) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsPlayer.loadSource(sourceUrl);
            hlsPlayer.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function start() {
        attachSource();
        video.controls = true;
        button.classList.add("is-hidden");
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
