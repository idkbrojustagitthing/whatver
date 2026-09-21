function onDomReady() {
  // Create the new container.
  var container = new springroll.Container('#game', {
    plugins: [
      new springroll.SoundPlugin({
        soundButtons: '#soundButton',
      }),
      new springroll.PausePlugin('#pauseButton'),
    ]
  });


  // Open the game.
  container.openPath('/index.html', {
    playOptions: {}
  });


  // Resize the game frame to test responsiveness.
  let gameFrame = document.getElementById('game');
  let deviceList = document.getElementById('deviceList');

  deviceList.onchange = function onDeviceSeleted() {
    gameFrame.className = deviceList.value;
  };


  // Set initial game size.
  gameFrame.className = deviceList.value;
}

(function domReadyCheck(callback) {
  var isDomReady = (window.document.readyState === 'interactive' || window.document.readyState === 'complete');
  isDomReady ? callback() : window.document.addEventListener('DOMContentLoaded', callback);
})(onDomReady);
