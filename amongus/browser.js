/* =============================================================================
 * browser.js - the lobby browser.
 *
 * Lists the public games running right now, and takes a code for private ones.
 * Answers go back with SendMessage to the GameObject named "LobbyBrowser".
 *
 * HOW PUBLIC GAMES ARE FOUND: every game is a PeerJS peer called
 * "yap-amongus-<code>", and a PUBLIC game's code always starts with P. So the
 * list is "every peer on the broker whose id starts with yap-amongus-P".
 * Private codes start with X and never appear, even though the same lookup
 * would find them - that is the whole difference between the two.
 *
 * The free public broker often has peer listing switched off, in which case the
 * list comes back empty and the code box is the way in. That is a limit of the
 * free broker, not a bug here.
 * ===========================================================================*/
(function () {
  'use strict';

  var YapBrowser = window.YapBrowser = { open: false, _root: null };

  var PREFIX = 'yap-amongus-';

  var el = window.YapUI.el;

  var toUnity = window.YapUI.sender('LobbyBrowser', 'YapBrowser');

  var overlayHost = window.YapUI.overlayHost;

  YapBrowser.open_ = function () {
    if (YapBrowser.open) { return; }
    YapBrowser.open = true;

    var overlay = el('div');
    overlay.id = 'yap-task-overlay';
    // Opaque, unlike the in-game overlays: this one replaces the menu rather than sitting over the game,
    // and the see-through backdrop let the AMONG US logo land right on top of the buttons.
    overlay.classList.add('brw-overlay');

    var panel = el('div');
    panel.id = 'yap-task-panel';
    panel.classList.add('brw-panel');
    overlay.appendChild(panel);

    var closeButton = el('button', 'yap-x');
    closeButton.textContent = 'X';
    closeButton.onclick = function () { YapBrowser.close(true); };
    panel.appendChild(closeButton);

    var title = el('div', 'yap-title');
    title.textContent = 'PLAY';
    panel.appendChild(title);

    /* ---- host ---- */
    var hostRow = el('div', 'brw-host');
    panel.appendChild(hostRow);

    var hostPublic = el('button', 'yap-btn good');
    hostPublic.textContent = 'HOST PUBLIC';
    hostPublic.onclick = function () {
      toUnity('OnHtmlHost', 'public');
      YapBrowser.close(false);
    };
    hostRow.appendChild(hostPublic);

    var hostPrivate = el('button', 'yap-btn');
    hostPrivate.textContent = 'HOST PRIVATE';
    hostPrivate.onclick = function () {
      toUnity('OnHtmlHost', 'private');
      YapBrowser.close(false);
    };
    hostRow.appendChild(hostPrivate);

    /* ---- join by code ---- */
    var codeRow = el('div', 'brw-code');
    panel.appendChild(codeRow);

    var input = el('input', 'brw-input');
    input.placeholder = 'ENTER CODE';
    input.maxLength = 8;
    input.oninput = function () { input.value = input.value.toUpperCase(); };
    codeRow.appendChild(input);

    var joinButton = el('button', 'yap-btn');
    joinButton.textContent = 'JOIN';
    joinButton.onclick = function () {
      var code = (input.value || '').trim().toUpperCase();
      if (!code) { return; }

      toUnity('OnHtmlJoin', code);
      YapBrowser.close(false);
    };
    codeRow.appendChild(joinButton);

    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { joinButton.click(); }
    });

    /* ---- public list ---- */
    var listTitle = el('div', 'yap-sub');
    listTitle.textContent = 'PUBLIC GAMES';
    panel.appendChild(listTitle);

    var list = el('div', 'brw-list');
    panel.appendChild(list);

    overlayHost().appendChild(overlay);
    YapBrowser._root = overlay;

    refresh(list);
  };

  function refresh(list) {
    list.innerHTML = '';

    var searching = el('div', 'brw-empty');
    searching.textContent = 'Looking for games...';
    list.appendChild(searching);

    if (typeof Peer === 'undefined') {
      searching.textContent = 'PeerJS is not loaded, so no games can be found.';
      return;
    }

    /* A throwaway peer, only so the broker will answer the question. It is
       destroyed the moment we have an answer. */
    var scout = new Peer();

    var finished = false;
    var done = function (peers, message) {
      if (finished) { return; }
      finished = true;

      try { scout.destroy(); } catch (e) { /* already gone */ }

      list.innerHTML = '';

      var codes = (peers || [])
        .filter(function (id) { return id.indexOf(PREFIX + 'P') === 0; })
        .map(function (id) { return id.substring(PREFIX.length); });

      if (codes.length === 0) {
        var empty = el('div', 'brw-empty');
        empty.textContent = message || 'No public games right now. Host one, or join with a code.';
        list.appendChild(empty);
        return;
      }

      codes.forEach(function (code) {
        var row = el('button', 'brw-row');

        var name = el('div', 'brw-row-code');
        name.textContent = code;
        row.appendChild(name);

        var join = el('div', 'brw-row-join');
        join.textContent = 'JOIN';
        row.appendChild(join);

        row.onclick = function () {
          toUnity('OnHtmlJoin', code);
          YapBrowser.close(false);
        };

        list.appendChild(row);
      });
    };

    scout.on('open', function () {
      scout.listAllPeers(function (peers) { done(peers, null); });
    });

    scout.on('error', function () {
      done([], 'Could not reach the game list. Join with a code instead.');
    });

    /* The free broker often has listing switched off and simply never answers. */
    setTimeout(function () {
      done([], 'The public list is unavailable on this server. Join with a code instead.');
    }, 4000);
  }

  YapBrowser.close = function (cancelled) {
    if (YapBrowser._root && YapBrowser._root.parentNode) {
      YapBrowser._root.parentNode.removeChild(YapBrowser._root);
    }

    YapBrowser._root = null;
    YapBrowser.open = false;

    if (cancelled) { toUnity('OnHtmlBrowserClosed', ''); }
  };
}());
