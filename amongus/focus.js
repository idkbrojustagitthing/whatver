/* =============================================================================
 * focus.js - decides who receives the keyboard: the game, or an HTML text box.
 *
 * WHY THIS EXISTS. The build sets WebGLInput.captureAllKeyboardInput = false so
 * that the HTML overlays (room code, chat, keypads) can actually be typed in.
 * The side effect is that Unity stops listening on the document and listens on
 * the CANVAS instead - and a <canvas> cannot take keyboard focus at all unless
 * it has a tabindex. Without one, every keystroke goes to <body>, Unity never
 * sees a single key, and the player simply never moves.
 *
 * So: give the canvas a tabindex, and hand focus back to it after any click that
 * did not land in a text box. Typing still works, because clicking an input
 * leaves that input focused.
 * ===========================================================================*/
(function () {
  'use strict';

  function gameCanvas() {
    return document.getElementById('unity-canvas');
  }

  function isTextBox(element) {
    if (!element) { return false; }

    return element.tagName === 'INPUT'
        || element.tagName === 'TEXTAREA'
        || element.isContentEditable === true;
  }

  /** Give the keyboard back to the game. Overlays call this when they close. */
  function focusGame() {
    var canvas = gameCanvas();
    if (canvas) { canvas.focus(); }
  }

  window.yapFocusGame = focusGame;

  function prepare() {
    var canvas = gameCanvas();
    if (!canvas) {
      setTimeout(prepare, 200); // the loader has not built it yet
      return;
    }

    canvas.setAttribute('tabindex', '0'); // the whole point - see the note above
    canvas.style.outline = 'none';        // no focus ring around the game

    canvas.addEventListener('mousedown', focusGame);
    focusGame();
  }

  /* Checked AFTER the click has settled, so whatever the click focused has already won. A click on a
     text box leaves it focused and is left alone; anything else hands the keyboard back. */
  document.addEventListener('mouseup', function () {
    setTimeout(function () {
      if (isTextBox(document.activeElement)) { return; }
      focusGame();
    }, 0);
  });

  /* An overlay closing DELETES the box that had focus, which drops focus to <body> and would leave the
     game deaf until the next click. */
  document.addEventListener('focusout', function () {
    setTimeout(function () {
      var active = document.activeElement;
      if (!active || active === document.body) { focusGame(); }
    }, 0);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prepare);
  } else {
    prepare();
  }
}());
