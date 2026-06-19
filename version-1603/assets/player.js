(function () {
  window.initMoviePlayer = function (url) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("player-start");
    var loaded = false;

    if (!video || !url) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function startVideo() {
      loadVideo();

      if (button) {
        button.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", startVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startVideo();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });
  };
})();
