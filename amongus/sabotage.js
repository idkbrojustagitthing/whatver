/* =============================================================================
 * sabotage.js - the sabotage repair minigames and the alert banner.
 *
 * Same shape as tasks.js: Unity says "open this repair", the player does
 * something in the DOM, and the answer goes back with SendMessage to the
 * GameObject named "SabotageSystem".
 *
 * Picking WHAT to sabotage is not here. That happens on the Unity map, because
 * in Among Us the map and the sabotage screen are the same screen.
 *
 * Add a repair:  YapSabotage.fixes['Lights'] = function (body, done, index) {};
 * The key must match the C# SabotageType name exactly.
 * ===========================================================================*/
(function () {
  'use strict';

  var YapSabotage = window.YapSabotage = {
    fixes: {},
    open: false,
    _root: null,
    _banner: null,
    _state: { type: 'None', seconds: 0, mask: 0 }
  };

  var el = window.YapUI.el;

  var toUnity = window.YapUI.sender('SabotageSystem', 'YapSabotage');

  /* Overlays must live inside whatever is fullscreen or the browser will not paint them. */
  var overlayHost = window.YapUI.overlayHost;

  function followFullscreen() {
    var move = function () {
      var host = overlayHost();
      [YapSabotage._root, YapSabotage._banner].forEach(function (node) {
        if (node && node.parentNode !== host) { host.appendChild(node); }
      });
    };
    document.addEventListener('fullscreenchange', move);
    document.addEventListener('webkitfullscreenchange', move);
  }
  followFullscreen();

  var LABELS = {
    Reactor: 'Reactor Meltdown',
    Oxygen: 'O2 Depleted',
    Lights: 'Lights Out',
    Communications: 'Comms Sabotaged'
  };


  /* ------------------------------------------------------------- the repairs */

  YapSabotage.openFix = function (sabotageName, consoleIndex) {
    if (YapSabotage.open) { return; }

    var fix = YapSabotage.fixes[sabotageName];
    if (!fix) {
      console.error('[YapSabotage] no repair registered for "' + sabotageName + '"');
      toUnity('OnHtmlSabotageCancelled', sabotageName);
      return;
    }

    YapSabotage.open = true;

    var overlay = el('div');
    overlay.id = 'yap-task-overlay';
    var panel = el('div');
    panel.id = 'yap-task-panel';
    overlay.appendChild(panel);

    var closeButton = el('button', 'yap-x');
    closeButton.textContent = 'X';
    closeButton.onclick = function () { YapSabotage.close(true); };
    panel.appendChild(closeButton);

    var body = el('div');
    panel.appendChild(body);

    overlayHost().appendChild(overlay);
    YapSabotage._root = overlay;

    var finished = false;
    fix(body, function () {
      if (finished) { return; }
      finished = true;
      toUnity('OnHtmlSabotageFixed', sabotageName + '|' + consoleIndex);
      setTimeout(function () { YapSabotage.close(false); }, 400);
    }, consoleIndex);
  };

  YapSabotage.close = function (cancelled) {
    if (YapSabotage._root && YapSabotage._root.parentNode) {
      YapSabotage._root.parentNode.removeChild(YapSabotage._root);
    }
    YapSabotage._root = null;
    YapSabotage._onState = null;
    YapSabotage.open = false;

    if (cancelled) { toUnity('OnHtmlSabotageCancelled', ''); }
  };

  /* ------------------------------------------------------------- the banner */

  /* Unity pushes the authoritative state here every time the server speaks. */
  YapSabotage.setState = function (sabotageName, secondsLeft, fixedMask, heldMask) {
    YapSabotage._state = {
      type: sabotageName, seconds: secondsLeft, mask: fixedMask, held: heldMask || 0
    };

    /* An open repair panel (the reactor one) redraws itself from the new state. */
    if (YapSabotage._onState) { YapSabotage._onState(YapSabotage._state); }

    if (!sabotageName || sabotageName === 'None') {
      if (YapSabotage._banner && YapSabotage._banner.parentNode) {
        YapSabotage._banner.parentNode.removeChild(YapSabotage._banner);
      }
      YapSabotage._banner = null;

      /* A repair panel left open for a sabotage that is already fixed would be a dead end. */
      if (YapSabotage.open && YapSabotage._root) { YapSabotage.close(false); }
      return;
    }

    if (!YapSabotage._banner) {
      var banner = el('div', 'sab-banner');
      banner.appendChild(el('div', 'sab-banner-name'));
      banner.appendChild(el('div', 'sab-banner-timer'));
      overlayHost().appendChild(banner);
      YapSabotage._banner = banner;
    }

    var critical = sabotageName === 'Reactor' || sabotageName === 'Oxygen';

    YapSabotage._banner.querySelector('.sab-banner-name').textContent =
      LABELS[sabotageName] || sabotageName;

    var timer = YapSabotage._banner.querySelector('.sab-banner-timer');
    if (critical) {
      var seconds = Math.max(0, Math.ceil(secondsLeft));
      timer.textContent = '0:' + (seconds < 10 ? '0' : '') + seconds;
      timer.style.display = '';
      YapSabotage._banner.classList.toggle('urgent', seconds <= 10);
    } else {
      timer.style.display = 'none';
      YapSabotage._banner.classList.remove('urgent');
    }
  };

  /* ------------------------------------------------- the repair minigames */

  /* LIGHTS: five breakers, all have to end up up. Deliberately quick — the
     crew is standing in the dark while somebody does this. */
  YapSabotage.fixes['Lights'] = function (body, done) {
    var title = el('div', 'yap-title');
    title.textContent = 'RESET BREAKERS';
    body.appendChild(title);

    var sub = el('div', 'yap-sub');
    sub.textContent = 'Flip every switch up.';
    body.appendChild(sub);

    var row = el('div', 'sab-breakers');
    body.appendChild(row);

    var states = [false, false, false, false, false];

    function check() {
      if (states.every(function (up) { return up; })) {
        sub.textContent = 'Power restored.';
        sub.classList.add('yap-ok');
        done();
      }
    }

    states.forEach(function (_, index) {
      var breaker = el('button', 'sab-breaker');
      var lever = el('i');
      breaker.appendChild(lever);

      breaker.onclick = function () {
        if (states[index]) { return; }
        states[index] = true;
        breaker.classList.add('up');
        check();
      };

      row.appendChild(breaker);
    });
  };

  /* COMMS: drag the dial until the wave lines up with the target. */
  YapSabotage.fixes['Communications'] = function (body, done) {
    var title = el('div', 'yap-title');
    title.textContent = 'RETUNE COMMS';
    body.appendChild(title);

    var sub = el('div', 'yap-sub');
    sub.textContent = 'Match the signal.';
    body.appendChild(sub);

    var stage = el('div', 'yap-stage', 'width:420px;height:160px;');
    body.appendChild(stage);

    var target = 20 + Math.random() * 60; /* percent */
    var current = target > 50 ? 5 : 95;

    var wanted = el('div', 'sab-wave target');
    stage.appendChild(wanted);
    var actual = el('div', 'sab-wave actual');
    stage.appendChild(actual);

    var slider = el('input', 'sab-slider');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = String(Math.round(current));
    body.appendChild(slider);

    function draw() {
      wanted.style.left = target + '%';
      actual.style.left = current + '%';

      var close = Math.abs(current - target) < 2.5;
      actual.classList.toggle('locked', close);

      if (close) {
        sub.textContent = 'Comms restored.';
        sub.classList.add('yap-ok');
        slider.disabled = true;
        done();
      }
    }

    slider.oninput = function () {
      current = parseFloat(slider.value);
      draw();
    };

    draw();
  };

  /* O2: a four-digit code, typed on a keypad. Both keypads use the same code,
     which is what makes two people faster than one. */
  YapSabotage.fixes['Oxygen'] = function (body, done, index) {
    var code = ['0', '2', '8', '9'];

    var title = el('div', 'yap-title');
    title.textContent = 'RESTORE OXYGEN';
    body.appendChild(title);

    var sub = el('div', 'yap-sub');
    sub.textContent = 'Enter ' + code.join('') + (index === 0 ? ' — keypad 1' : ' — keypad 2');
    body.appendChild(sub);

    var display = el('div', 'sab-code');
    body.appendChild(display);

    var pad = el('div', 'sab-pad');
    body.appendChild(pad);

    var typed = [];

    function render() {
      display.textContent = typed.join('') + '_'.repeat(Math.max(0, code.length - typed.length));
    }

    function press(digit) {
      if (typed.length >= code.length) { return; }

      typed.push(digit);
      render();

      if (typed.length < code.length) { return; }

      if (typed.join('') === code.join('')) {
        sub.textContent = 'Accepted.';
        sub.classList.add('yap-ok');
        done();
      } else {
        sub.textContent = 'Wrong — try again.';
        sub.classList.add('yap-bad');
        typed = [];
        setTimeout(function () { sub.classList.remove('yap-bad'); render(); }, 320);
      }
    }

    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', ''].forEach(function (label) {
      var key = el('button', 'sab-key');
      key.textContent = label;
      key.disabled = label === '';

      key.onclick = function () {
        if (label === 'C') { typed = []; render(); return; }
        press(label);
      };

      pad.appendChild(key);
    });

    render();
  };

  /* REACTOR: hold the hand scanner. BOTH scanners have to be held at the same
     moment, so this does not finish itself — it tells Unity the hand is down and
     waits for the server to say the reactor is fixed. One person running between
     the two panels cannot do it. */
  YapSabotage.fixes['Reactor'] = function (body, done, index) {
    var title = el('div', 'yap-title');
    title.textContent = 'REACTOR HAND SCAN';
    body.appendChild(title);

    var sub = el('div', 'yap-sub');
    sub.textContent = 'Hold the scanner — ' + (index === 0 ? 'left panel' : 'right panel');
    body.appendChild(sub);

    var scanner = el('div', 'sab-hand');
    scanner.appendChild(el('div', 'sab-hand-print'));
    body.appendChild(scanner);

    /* One lamp per scanner, so you can see the other panel is covered. */
    var lamps = el('div', 'sab-lamps');
    var mine = el('div', 'sab-lamp');
    var theirs = el('div', 'sab-lamp');
    mine.textContent = index === 0 ? 'L' : 'R';
    theirs.textContent = index === 0 ? 'R' : 'L';
    lamps.appendChild(mine);
    lamps.appendChild(theirs);
    body.appendChild(lamps);

    var holding = false;

    function tellUnity(isHolding) {
      toUnity('OnHtmlSabotageHold', 'Reactor|' + index + '|' + (isHolding ? '1' : '0'));
    }

    function hold(on) {
      if (holding === on) { return; }
      holding = on;
      scanner.classList.toggle('held', on);
      tellUnity(on);
    }

    scanner.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      try { scanner.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
      hold(true);
    });

    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (name) {
      scanner.addEventListener(name, function () { hold(false); });
    });

    /* The server owns the truth about who is holding what; just draw it. */
    YapSabotage._onState = function (state) {
      if (state.type !== 'Reactor') { return; }

      var otherIndex = index === 0 ? 1 : 0;
      var otherHeld = (state.held & (1 << otherIndex)) !== 0;
      var selfHeld = (state.held & (1 << index)) !== 0;

      mine.classList.toggle('on', selfHeld);
      theirs.classList.toggle('on', otherHeld);

      if (selfHeld && !otherHeld) {
        sub.textContent = 'Holding — waiting for the other scanner...';
        sub.classList.remove('yap-ok');
      } else if (!selfHeld && otherHeld) {
        sub.textContent = 'Someone is on the other scanner. Hold yours!';
        sub.classList.remove('yap-ok');
      } else if (!selfHeld) {
        sub.textContent = 'Hold the scanner — ' + (index === 0 ? 'left panel' : 'right panel');
      }
    };

    /* Nothing is returned: the panel closes when the server clears the sabotage. */
  };

}());
