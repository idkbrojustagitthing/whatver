/* =============================================================================
 * common.js - the three things every HTML overlay needs.
 *
 * tasks.js, meeting.js, sabotage.js, lobby.js and browser.js each used to carry
 * their own identical copy of all three. That is how the fullscreen bug came to
 * be five bugs: the overlay host had to be corrected in five files, and any one
 * of them left behind would have kept failing on its own.
 *
 * MUST be loaded before the overlays that use it - see index.html.
 * ===========================================================================*/
(function () {
  'use strict';

  var YapUI = window.YapUI = {};

  /** A DOM node, with an optional class and inline style. */
  YapUI.el = function (tag, cls, css) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (css) { node.style.cssText = css; }
    return node;
  };

  /**
   * Where an overlay must be attached to actually be visible.
   *
   * In fullscreen the browser paints ONLY the fullscreen element and its descendants. Unity's own
   * SetFullscreen puts the CANVAS fullscreen, and a <canvas> cannot show child elements at all, so an
   * overlay attached to it simply vanishes. The fullscreen button therefore takes the container
   * fullscreen instead, and that container holds the canvas and the overlays together.
   */
  YapUI.overlayHost = function () {
    var full = document.fullscreenElement || document.webkitFullscreenElement;

    if (full && full.tagName !== 'CANVAS') {
      return full;
    }

    return document.getElementById('unity-container') || document.body;
  };

  // The room-code banner is created in YapPeerTransport.jslib, which has no access to YapUI.
  window.yapOverlayHost = YapUI.overlayHost;

  /**
   * A little crewmate in the given colour. Styled by .lob-bean* in tasks.css.
   *
   * Lived in lobby.js until the kill screen needed one too.
   */
  YapUI.crewmate = function (hex, size) {
    var wrap = YapUI.el('div', 'lob-bean');
    wrap.style.width = size + 'px';
    wrap.style.height = (size * 1.28) + 'px';

    var body = YapUI.el('div', 'lob-bean-body');
    body.style.background = hex;
    wrap.appendChild(body);

    wrap.appendChild(YapUI.el('div', 'lob-bean-visor'));

    var pack = YapUI.el('div', 'lob-bean-pack');
    pack.style.background = hex;
    wrap.appendChild(pack);

    return wrap;
  };

  /**
   * Builds the "send this to Unity" function for one overlay.
   *
   * Unity is addressed by GameObject NAME, so each overlay talks to its own: getting the name wrong
   * fails silently, which is why it is named once here per overlay rather than written out at every
   * call site.
   */
  YapUI.sender = function (objectName, logTag) {
    return function (method, value) {
      try {
        if (typeof SendMessage === 'function') { SendMessage(objectName, method, value); return; }
      } catch (e) { /* fall through to unityInstance */ }

      try {
        if (window.unityInstance) { window.unityInstance.SendMessage(objectName, method, value); }
      } catch (e2) { console.warn('[' + logTag + '] could not reach Unity:', e2); }
    };
  };
}());
