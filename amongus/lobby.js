/* =============================================================================
 * lobby.js - the lobby computer menu.
 *
 * Two halves: pick your colour (with a live preview of your crewmate), and the
 * lobby settings. The HOST gets the settings as controls; everybody else sees
 * the same numbers, read-only, so they know what they are walking into.
 *
 * Unity opens it and pushes state; answers go back with SendMessage to the
 * GameObject named "LobbySystem".
 * ===========================================================================*/
(function () {
  'use strict';

  var YapLobby = window.YapLobby = { open: false, _root: null, _state: null };

  var el = window.YapUI.el;

  var toUnity = window.YapUI.sender('LobbySystem', 'YapLobby');

  var overlayHost = window.YapUI.overlayHost;

  document.addEventListener('fullscreenchange', function () {
    if (YapLobby._root) { overlayHost().appendChild(YapLobby._root); }
  });

  /* MUST match the C# PlayerColor enum, in order, because the INDEX is the value Unity sends back:
     "taken" is a list of enum integers and "myColor" is one. This list used to be in a different order
     from Yellow onwards, so the right colour was applied (the click sends a name) while the wrong swatch
     was greyed out and the wrong one was marked as yours.

     Hexes are PlayerColorHex.cs, which is what the rest of the game tints crewmates with. */
  var COLORS = [
    { name: 'Red',    hex: '#c51111' },
    { name: 'Blue',   hex: '#132ed1' },
    { name: 'Green',  hex: '#117f2d' },
    { name: 'Yellow', hex: '#f5f557' },
    { name: 'Pink',   hex: '#ee54bb' },
    { name: 'Orange', hex: '#ef7d0d' },
    { name: 'Purple', hex: '#6b2fbb' },
    { name: 'Black',  hex: '#3f474e' },
    { name: 'Brown',  hex: '#71491e' },
    { name: 'Cyan',   hex: '#38fedc' },
    { name: 'Lime',   hex: '#50ef39' },
    { name: 'White',  hex: '#d6e0f0' }
  ];

  /* Each setting: the key Unity knows it by, a label, the steps it can take, and
     how to write the value out. Steps rather than a slider, like the real game.

     NO VISIBILITY ROW. Whether a game is public is carried by the FIRST LETTER of the room code (P or
     X) and decided when you press HOST, and the code never changes afterwards. A switch here could not
     have made an existing game findable, so it was a control that did nothing. */
  var SETTINGS = [
    { key: 'speed', label: 'Player Speed', steps: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3], suffix: 'x' },
    { key: 'crewVision', label: 'Crewmate Vision', steps: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3], suffix: 'x' },
    { key: 'impostorVision', label: 'Impostor Vision', steps: [0.25, 0.5, 1, 1.25, 1.5, 1.75, 2, 3], suffix: 'x' },
    { key: 'killCooldown', label: 'Kill Cooldown', steps: [10, 15, 20, 25, 30, 35, 40, 45, 50, 60], suffix: 's' },
    { key: 'killDistance', label: 'Kill Distance', steps: [1, 1.5, 2, 2.5, 3], names: ['Very Short', 'Short', 'Normal', 'Long', 'Very Long'] },
    { key: 'impostors', label: 'Impostors', steps: [0, 1, 2, 3], names: ['Auto', '1', '2', '3'] },
    { key: 'maxPlayers', label: 'Max Players', steps: [4, 6, 8, 10, 12, 15, 18, 20] },
    { key: 'emergencies', label: 'Emergency Meetings', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { key: 'emergencyCooldown', label: 'Emergency Cooldown', steps: [0, 5, 10, 15, 20, 25, 30, 45, 60], suffix: 's' },
    { key: 'discussion', label: 'Discussion Time', steps: [0, 15, 30, 45, 60, 90, 120], suffix: 's' },
    { key: 'voting', label: 'Voting Time', steps: [15, 30, 45, 60, 90, 120, 180, 300], suffix: 's' },
    { key: 'common', label: 'Common Tasks', steps: [0, 1, 2] },
    { key: 'long', label: 'Long Tasks', steps: [0, 1, 2, 3] },
    { key: 'short', label: 'Short Tasks', steps: [0, 1, 2, 3, 4, 5] }
  ];

  function describe(setting, value) {
    if (setting.names) {
      var index = nearestStep(setting, value);
      return setting.names[index];
    }

    var text = String(Math.round(value * 100) / 100);
    return text + (setting.suffix || '');
  }

  /* The value we hold may not be exactly a step (an older save, or a clamp), so
     always work from the closest one. */
  function nearestStep(setting, value) {
    var best = 0;
    var bestGap = Infinity;

    setting.steps.forEach(function (step, index) {
      var gap = Math.abs(step - value);
      if (gap < bestGap) { bestGap = gap; best = index; }
    });

    return best;
  }

  /* ------------------------------------------------------------- the crewmate */

  /* A little bean, drawn with divs, so the preview needs no artwork. */
  var crewmate = window.YapUI.crewmate;

  /* ------------------------------------------------------------------ the menu */

  YapLobby.open_ = function (state) {
    YapLobby._state = state;

    if (YapLobby.open) { YapLobby.render(); return; }
    YapLobby.open = true;

    var overlay = el('div');
    overlay.id = 'yap-task-overlay';

    var panel = el('div');
    panel.id = 'yap-task-panel';
    panel.classList.add('lob-panel');
    overlay.appendChild(panel);

    var closeButton = el('button', 'yap-x');
    closeButton.textContent = 'X';
    closeButton.onclick = function () { YapLobby.close(); };
    panel.appendChild(closeButton);

    var body = el('div', 'lob-body');
    panel.appendChild(body);

    overlayHost().appendChild(overlay);
    YapLobby._root = overlay;

    YapLobby.render();
  };

  YapLobby.render = function () {
    if (!YapLobby._root || !YapLobby._state) { return; }

    var state = YapLobby._state;
    var body = YapLobby._root.querySelector('.lob-body');
    body.innerHTML = '';

    /* ---- left: colour ---- */
    var left = el('div', 'lob-col');
    body.appendChild(left);

    var title = el('div', 'yap-title');
    title.textContent = 'CUSTOMISE';
    left.appendChild(title);

    var previewWrap = el('div', 'lob-preview');
    previewWrap.appendChild(crewmate(COLORS[state.myColor] ? COLORS[state.myColor].hex : '#c51111', 96));
    left.appendChild(previewWrap);

    var previewName = el('div', 'yap-sub');
    previewName.textContent = COLORS[state.myColor] ? COLORS[state.myColor].name : '';
    left.appendChild(previewName);

    var grid = el('div', 'lob-colors');
    left.appendChild(grid);

    COLORS.forEach(function (color, index) {
      var taken = state.taken.indexOf(index) !== -1 && index !== state.myColor;

      var swatch = el('button', 'lob-swatch' + (taken ? ' taken' : '') + (index === state.myColor ? ' mine' : ''));
      swatch.style.background = color.hex;
      swatch.title = taken ? color.name + ' (taken)'
                   : (index === state.myColor ? color.name + ' (yours)' : color.name);
      swatch.disabled = taken;

      swatch.onclick = function () {
        /* Show it straight away; the server confirms a moment later, and if it
           says no the next state push puts it back. */
        state.myColor = index;
        YapLobby.render();
        toUnity('OnHtmlColorChosen', color.name);
      };

      grid.appendChild(swatch);
    });

    /* ---- right: settings ---- */
    var right = el('div', 'lob-col lob-settings');
    body.appendChild(right);

    var settingsTitle = el('div', 'yap-title');
    settingsTitle.textContent = state.isHost ? 'GAME SETTINGS' : 'GAME SETTINGS (HOST ONLY)';
    right.appendChild(settingsTitle);

    var hint = el('div', 'yap-sub');
    hint.textContent = state.isHost
      ? 'Everyone sees these change as you set them.'
      : 'Only the host can change these.';
    right.appendChild(hint);

    var list = el('div', 'lob-list');
    right.appendChild(list);

    SETTINGS.forEach(function (setting) {
      var value = state.settings[setting.key];
      if (value === undefined) { return; }

      var row = el('div', 'lob-row');

      var label = el('div', 'lob-label');
      label.textContent = setting.label;
      row.appendChild(label);

      if (!state.isHost) {
        var readOnly = el('div', 'lob-value');
        readOnly.textContent = describe(setting, value);
        row.appendChild(readOnly);
        list.appendChild(row);
        return;
      }

      var minus = el('button', 'lob-step');
      minus.textContent = '-';
      row.appendChild(minus);

      var display = el('div', 'lob-value');
      display.textContent = describe(setting, value);
      row.appendChild(display);

      var plus = el('button', 'lob-step');
      plus.textContent = '+';
      row.appendChild(plus);

      function move(by) {
        var index = nearestStep(setting, state.settings[setting.key]) + by;
        index = Math.max(0, Math.min(setting.steps.length - 1, index));

        var next = setting.steps[index];
        state.settings[setting.key] = next;
        display.textContent = describe(setting, next);

        toUnity('OnHtmlSettingChanged', setting.key + '|' + next);
      }

      minus.onclick = function () { move(-1); };
      plus.onclick = function () { move(1); };

      list.appendChild(row);
    });
  };

  YapLobby.close = function () {
    if (YapLobby._root && YapLobby._root.parentNode) {
      YapLobby._root.parentNode.removeChild(YapLobby._root);
    }

    YapLobby._root = null;
    YapLobby.open = false;

    toUnity('OnHtmlLobbyClosed', '');
  };

  /* ---- called from the .jslib ---- */

  YapLobby.openWithJson = function (json) {
    try {
      YapLobby.open_(JSON.parse(json));
    } catch (e) {
      console.error('[YapLobby] bad state from Unity:', e, json);
    }
  };

  YapLobby.setStateJson = function (json) {
    if (!YapLobby.open) { return; }

    try {
      YapLobby._state = JSON.parse(json);
      YapLobby.render();
    } catch (e) {
      console.error('[YapLobby] bad state from Unity:', e, json);
    }
  };
}());
