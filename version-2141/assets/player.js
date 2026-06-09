(function () {
  var video = document.querySelector('[data-player-video]');
  var button = document.querySelector('[data-player-button]');

  if (!video || !button) {
    return;
  }

  var streamUrl = video.getAttribute('data-stream-url');
  var ready = false;
  var hlsInstance = null;

  function attach() {
    if (ready || !streamUrl) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    attach();
    button.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
