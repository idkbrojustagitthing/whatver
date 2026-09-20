/* =============================================================================
 * kill.js - the death screen.
 *
 * Shown to the VICTIM only, the moment they are killed: the impostor lunges in,
 * the screen flashes, and the name of whoever did it comes up. Being killed used
 * to be completely silent — you simply stopped being able to do anything, with
 * no idea what had happened.
 *
 * Unity drives it through YapKill.jslib. Nothing is sent back, so there is no
 * GameObject name to keep in step here.
 * ===========================================================================*/
(function () {
  'use strict';

  var YapKill = window.YapKill = { _root: null, _timer: 0 };

  function overlayHost() {
    if (window.yapOverlayHost) { return window.yapOverlayHost(); }
    return document.getElementById('unity-container') || document.body;
  }

  /** Payload: {"killer":"Mikey","killerHex":"#c51111","victimHex":"#132ed1"} */
  YapKill.show = function (payloadJson) {
    YapKill.hide();

    var data;
    try {
      data = JSON.parse(payloadJson) || {};
    } catch (e) {
      data = {};
    }

    var el = window.YapUI.el;

    var overlay = el('div', 'kill-overlay');

    var stage = el('div', 'kill-stage');
    overlay.appendChild(stage);

    // The victim stands still; the killer comes in from the right and strikes.
    var victim = window.YapUI.crewmate(data.victimHex || '#8a8a8a', 130);
    victim.classList.add('kill-victim');
    stage.appendChild(victim);

    var killer = window.YapUI.crewmate(data.killerHex || '#c51111', 155);
    killer.classList.add('kill-killer');
    stage.appendChild(killer);

    stage.appendChild(el('div', 'kill-slash'));
    stage.appendChild(el('div', 'kill-flash'));

    var caption = el('div', 'kill-caption');
    caption.textContent = data.killer ? 'KILLED BY ' + data.killer : 'YOU WERE KILLED';
    overlay.appendChild(caption);

    var hint = el('div', 'kill-hint');
    hint.textContent = 'You are a ghost. You can still finish your tasks.';
    overlay.appendChild(hint);

    // Nobody wants to sit through it twice.
    overlay.onclick = function () { YapKill.hide(); };

    overlayHost().appendChild(overlay);
    YapKill._root = overlay;

    YapKill._timer = setTimeout(YapKill.hide, 4200);
  };

  YapKill.hide = function () {
    if (YapKill._timer) {
      clearTimeout(YapKill._timer);
      YapKill._timer = 0;
    }

    if (YapKill._root && YapKill._root.parentNode) {
      YapKill._root.parentNode.removeChild(YapKill._root);
    }

    YapKill._root = null;

    // The canvas lost focus to the overlay, and without this the player cannot move afterwards.
    if (window.yapFocusGame) { window.yapFocusGame(); }
  };

  // Fullscreen is entered and left mid-round; the overlay has to move with it or it stops being drawn.
  document.addEventListener('fullscreenchange', function () {
    if (YapKill._root) { overlayHost().appendChild(YapKill._root); }
  });
}());
