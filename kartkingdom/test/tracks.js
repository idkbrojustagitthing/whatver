(function(){
  let trackList;
  let racers;

  async function getRacers() {
    const ROOT = window.location.protocol + '//' + window.location.host;
    const AVATAR_ROOT = `${ROOT}/racers/`;

    let res = await fetch('../configs/racers.json');
    let racers = await res.json();

    // Update avatar urls to be absolute. REQUIRED for loading them in the race game.
    for (let r in racers) {
      let racer = racers[r];
      racer.avatarURL = AVATAR_ROOT + racer.avatarURL;
    }

    return racers;
  }

  async function onTrackSelected() {
    if (Racing._instance) {
      // Destroy previous instance.
      Racing._instance.engine.canvas.remove();
      Racing.destroy();
    }

    // Start the race.
    Racing.run(new RacingAPI.default('dot', racers, trackList.value));
  }

  async function onDomReady() {
    trackList = document.getElementById('trackList');
    racers = await getRacers();

    // Populate trackList
    let res = await fetch('../configs/all-tracks.json');
    let tracks = await res.json();
    tracks = tracks.tracks;

    // Update avatar urls to be absolute. REQUIRED for loading them in the race game.
    for (let t in tracks) {
      let trackName = tracks[t];
      let optionEl = document.createElement('option');
      optionEl.value = trackName;
      optionEl.innerText = trackName;
      trackList.appendChild(optionEl);
    }

    trackList.onchange = onTrackSelected;
  }

  (function domReadyCheck(callback) {
    var isDomReady = (window.document.readyState === 'interactive' || window.document.readyState === 'complete');
    isDomReady ? callback() : window.document.addEventListener('DOMContentLoaded', callback);
  })(onDomReady);

})();
