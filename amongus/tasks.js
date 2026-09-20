/* =============================================================================
 * tasks.js - HTML task minigames for the Among Us WebGL build.
 *
 * The whole task UI is DOM drawn over the Unity canvas, so tasks need no Unity
 * prefabs or Inspector wiring. Unity says "open task X step N"; this replies
 * completed/cancelled via SendMessage to the GameObject named "TaskSystem".
 *
 * Add a task:  YapTasks.games['MyTask'] = function (body, done, step) { ... };
 * The key must match the C# TaskType name exactly.
 * ===========================================================================*/
(function () {
  'use strict';

  var YapTasks = window.YapTasks = { games: {}, open: false, _root: null, _cleanup: null };

  var toUnity = window.YapUI.sender('TaskSystem', 'YapTasks');

  /* Styling lives in tasks.css (linked from index.html) so it can be restyled without
     touching this file. If that link is missing for any reason, add it ourselves. */
  function ensureStyle() {
    var loaded = Array.prototype.some.call(document.styleSheets || [], function (sheet) {
      return sheet.href && sheet.href.indexOf('tasks.css') !== -1;
    });
    var tagged = !!document.querySelector('link[href*="tasks.css"]');
    if (loaded || tagged) { return; }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'tasks.css';
    document.head.appendChild(link);
  }


  /**
   * FULLSCREEN FIX: when the Unity canvas goes fullscreen the browser only paints that element and its
   * descendants, so an overlay parented to <body> silently disappears. Parent overlays to whatever is
   * currently fullscreen, and move them if that changes while one is open.
   */
  var overlayHost = window.YapUI.overlayHost;

  function followFullscreen(getNodes) {
    var move = function () {
      var host = overlayHost();
      getNodes().forEach(function (node) {
        if (node && node.parentNode !== host) { host.appendChild(node); }
      });
    };
    document.addEventListener('fullscreenchange', move);
    document.addEventListener('webkitfullscreenchange', move);
  }

  var H = YapTasks.helpers = {
    el: window.YapUI.el,
    title: function (body, text) {
      var node = H.el('div', 'yap-title');
      node.textContent = text;
      body.appendChild(node);
      return node;
    },
    sub: function (body, text) {
      var node = H.el('div', 'yap-sub');
      node.textContent = text || '';
      body.appendChild(node);
      return node;
    },
    stage: function (body, w, h) {
      var node = H.el('div', 'yap-stage', 'width:' + w + 'px;height:' + h + 'px;');
      body.appendChild(node);
      return node;
    },
    bar: function (body) {
      var wrap = H.el('div', 'yap-bar');
      var fill = H.el('i');
      wrap.appendChild(fill);
      body.appendChild(wrap);
      var pct = H.el('div', 'yap-pct');
      body.appendChild(pct);
      return {
        set: function (fraction) {
          var v = Math.max(0, Math.min(1, fraction));
          fill.style.width = (v * 100) + '%';
          pct.textContent = Math.round(v * 100) + '%';
        }
      };
    },
    drag: function (node, onMove, onUp, onDown) {
      node.classList.add('yap-grab');
      node.addEventListener('pointerdown', function (down) {
        down.preventDefault();
        try { node.setPointerCapture(down.pointerId); } catch (e) { /* ignore */ }
        if (onDown) { onDown(down); }
        var move = function (ev) { onMove(ev); };
        var up = function (ev) {
          node.removeEventListener('pointermove', move);
          node.removeEventListener('pointerup', up);
          if (onUp) { onUp(ev); }
        };
        node.addEventListener('pointermove', move);
        node.addEventListener('pointerup', up);
      });
    },
    local: function (element, ev) {
      var rect = element.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top, w: rect.width, h: rect.height };
    },
    shuffle: function (list) {
      for (var i = list.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = list[i]; list[i] = list[j]; list[j] = t;
      }
      return list;
    },
    rand: function (min, max) { return min + Math.random() * (max - min); }
  };

  followFullscreen(function () { return [YapTasks._root]; });

  YapTasks.openTask = function (taskName, stepIndex) {
    if (YapTasks.open) { return; }
    ensureStyle();

    var game = YapTasks.games[taskName];
    if (!game) {
      console.error('[YapTasks] no HTML minigame registered for "' + taskName + '"');
      toUnity('OnHtmlTaskCancelled', taskName + '|' + stepIndex);
      return;
    }

    YapTasks.open = true;
    YapTasks._name = taskName;
    YapTasks._step = stepIndex;

    var overlay = H.el('div');
    overlay.id = 'yap-task-overlay';
    var panel = H.el('div');
    panel.id = 'yap-task-panel';
    overlay.appendChild(panel);

    var closeButton = H.el('button', 'yap-x');
    closeButton.textContent = 'X';
    closeButton.onclick = function () { YapTasks.closeTask(false); };
    panel.appendChild(closeButton);

    var body = H.el('div');
    panel.appendChild(body);
    overlayHost().appendChild(overlay);
    YapTasks._root = overlay;

    var finished = false;
    YapTasks._cleanup = game(body, function () {
      if (finished) { return; }
      finished = true;
      setTimeout(function () { YapTasks.closeTask(true); }, 400);
    }, stepIndex) || null;
  };

  YapTasks.closeTask = function (completed) {
    if (!YapTasks.open) { return; }
    YapTasks.open = false;

    if (typeof YapTasks._cleanup === 'function') {
      try { YapTasks._cleanup(); } catch (e) { /* ignore */ }
    }
    YapTasks._cleanup = null;

    if (YapTasks._root && YapTasks._root.parentNode) {
      YapTasks._root.parentNode.removeChild(YapTasks._root);
    }
    YapTasks._root = null;

    toUnity(completed ? 'OnHtmlTaskCompleted' : 'OnHtmlTaskCancelled',
            YapTasks._name + '|' + YapTasks._step);
  };
})();

/* ---------------- Common tasks ---------------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  G.SwipeCard = function (body, done) {
    H.title(body, 'Swipe Card');
    var status = H.sub(body, 'Swipe the card through the reader');
    var stage = H.stage(body, 460, 210);
    var reader = H.el('div', '', 'position:absolute;left:0;top:44px;width:100%;height:70px;background:#20364f;border-top:3px solid #3d6a99;');
    reader.style.borderTop = '3px solid #3d6a99'; reader.style.borderBottom = '3px solid #3d6a99';
    stage.appendChild(reader);
    var slot = H.el('div', '', 'position:absolute;left:0;top:52px;width:100%;height:54px;background:#0a1524;');
    stage.appendChild(slot);
    var card = H.el('div', '', 'position:absolute;left:8px;top:56px;width:120px;height:46px;border-radius:6px;' +
      'background:linear-gradient(#f3d98b,#d9b45c);border:2px solid #8a6d29;box-shadow:0 3px 6px rgba(0,0,0,.5);');
    var chip = H.el('div', '', 'position:absolute;left:10px;top:12px;width:22px;height:18px;background:#a8862f;border-radius:3px;');
    card.appendChild(chip); stage.appendChild(card);
    var startX = 8, endX = 320, t0 = 0;
    H.drag(card, function (ev) {
      var p = H.local(stage, ev);
      card.style.left = Math.max(startX, Math.min(endX, p.x - 60)) + 'px';
    }, function () {
      var x = parseFloat(card.style.left), dt = (performance.now() - t0) / 1000;
      if (x < endX - 20) { card.style.left = startX + 'px'; status.textContent = 'Bad read. Try again.'; status.className = 'yap-sub yap-bad'; return; }
      if (dt < 0.35) { card.style.left = startX + 'px'; status.textContent = 'Too fast!'; status.className = 'yap-sub yap-bad'; return; }
      if (dt > 1.4) { card.style.left = startX + 'px'; status.textContent = 'Too slow!'; status.className = 'yap-sub yap-bad'; return; }
      status.textContent = 'Accepted'; status.className = 'yap-sub yap-ok'; done();
    }, function () { t0 = performance.now(); });
  };

  G.FixWiring = function (body, done) {
    H.title(body, 'Fix Wiring');
    H.sub(body, 'Connect each wire to the matching colour');
    var colors = ['#e0453f', '#3f6fe0', '#e8d24a', '#e05fc0'];
    var stage = H.stage(body, 460, 300);
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;');
    stage.appendChild(svg);
    var right = H.shuffle([0, 1, 2, 3]), left = [0, 1, 2, 3], joined = 0, lines = [];
    left.forEach(function (idx, row) {
      var y = 40 + row * 68;
      var end = H.el('div', '', 'position:absolute;left:14px;top:' + y + 'px;width:56px;height:34px;border-radius:5px;background:' + colors[idx] + ';');
      stage.appendChild(end);
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', colors[idx]); line.setAttribute('stroke-width', '8'); line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('x1', 70); line.setAttribute('y1', y + 17); line.setAttribute('x2', 70); line.setAttribute('y2', y + 17);
      svg.appendChild(line); lines.push(line);
      H.drag(end, function (ev) {
        if (end.dataset.locked) { return; }
        var p = H.local(stage, ev);
        line.setAttribute('x2', p.x); line.setAttribute('y2', p.y);
      }, function (ev) {
        if (end.dataset.locked) { return; }
        var p = H.local(stage, ev), target = right.indexOf(idx), ty = 40 + target * 68 + 17;
        if (p.x > 350 && Math.abs(p.y - ty) < 34) {
          line.setAttribute('x2', 390); line.setAttribute('y2', ty);
          end.dataset.locked = '1'; joined++;
          if (joined === 4) { done(); }
        } else { line.setAttribute('x2', 70); line.setAttribute('y2', y + 17); }
      });
    });
    right.forEach(function (idx, row) {
      var socket = H.el('div', '', 'position:absolute;right:14px;top:' + (40 + row * 68) + 'px;width:56px;height:34px;border-radius:5px;background:' + colors[idx] + ';');
      stage.appendChild(socket);
    });
  };
})();

/* ---------------- Click / sequence tasks ---------------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  G.ClearAsteroids = function (body, done) {
    H.title(body, 'Clear Asteroids');
    var status = H.sub(body, 'Shoot 20 asteroids');
    var stage = H.stage(body, 520, 320);
    stage.style.background = 'radial-gradient(circle at 50% 50%, #101f36 0%, #060c16 100%)';
    stage.style.cursor = 'crosshair';
    var left = 20, timers = [];
    function spawn() {
      var size = H.rand(28, 52);
      var rock = H.el('div', '', 'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:45% 55% 50% 48%;' +
        'background:#7b6a58;border:2px solid #a2907a;left:' + H.rand(6, 520 - size - 6) + 'px;top:' + H.rand(6, 320 - size - 6) + 'px;');
      rock.style.borderColor = '#a2907a';
      rock.onpointerdown = function (ev) {
        ev.stopPropagation();
        if (!rock.parentNode) { return; }
        stage.removeChild(rock);
        left--; status.textContent = left + ' remaining';
        if (left <= 0) { status.textContent = 'All clear'; status.className = 'yap-sub yap-ok'; done(); }
        else { spawn(); }
      };
      stage.appendChild(rock);
      var t = setTimeout(function () { if (rock.parentNode) { rock.style.opacity = '.55'; } }, 4000);
      timers.push(t);
    }
    for (var i = 0; i < 6; i++) { spawn(); }
    status.textContent = left + ' remaining';
    return function () { timers.forEach(clearTimeout); };
  };

  G.PrimeShields = function (body, done) {
    H.title(body, 'Prime Shields');
    H.sub(body, 'Tap every panel to prime the shield');
    var stage = H.stage(body, 420, 340);
    var lit = 0, total = 7;
    var spots = [[210,60],[120,120],[300,120],[120,220],[300,220],[210,280],[210,170]];
    spots.forEach(function (pos) {
      var hex = H.el('div', '', 'position:absolute;left:' + (pos[0] - 46) + 'px;top:' + (pos[1] - 40) + 'px;' +
        'width:92px;height:80px;background:#22405f;cursor:pointer;' +
        'clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);');
      hex.onpointerdown = function () {
        if (hex.dataset.on) { return; }
        hex.dataset.on = '1';
        hex.style.background = '#ffd34d';
        lit++;
        if (lit >= total) { done(); }
      };
      stage.appendChild(hex);
    });
  };

  G.UnlockManifolds = function (body, done) {
    H.title(body, 'Unlock Manifolds');
    var status = H.sub(body, 'Press the numbers in order');
    var stage = H.stage(body, 420, 420);
    var next = 1, order = H.shuffle([1,2,3,4,5,6,7,8,9,10]), pads = [];
    order.forEach(function (num, i) {
      var col = i % 3, row = Math.floor(i / 3);
      var pad = H.el('div', '', 'position:absolute;left:' + (30 + col * 128) + 'px;top:' + (26 + row * 100) + 'px;' +
        'width:110px;height:82px;border-radius:10px;background:#25456a;border:3px solid #3d6a99;color:#fff;' +
        'font-size:34px;font-weight:bold;display:flex;align-items:center;justify-content:center;cursor:pointer;');
      pad.textContent = num;
      pad.onpointerdown = function () {
        if (num !== next) {
          next = 1; status.textContent = 'Wrong! Start again'; status.className = 'yap-sub yap-bad';
          pads.forEach(function (p) { p.style.background = '#25456a'; });
          return;
        }
        pad.style.background = '#33c96b'; next++;
        status.textContent = 'Press the numbers in order'; status.className = 'yap-sub';
        if (next > 10) { done(); }
      };
      pads.push(pad); stage.appendChild(pad);
    });
  };
})();

/* ---------------- Fill / hold tasks ---------------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  /* Generic filling bar. hold=true means the player must keep the button pressed. */
  function makeFill(titleText, subText, seconds, hold, buttonText) {
    return function (body, done) {
      H.title(body, titleText);
      H.sub(body, subText);
      var bar = H.bar(body);
      var progress = 0, holding = !hold, raf = 0, last = performance.now();

      var wrap = H.el('div', '', 'text-align:center;margin-top:18px;');
      var button = H.el('button', 'yap-btn');
      button.textContent = buttonText || 'HOLD';
      if (hold) {
        button.onpointerdown = function () { holding = true; };
        button.onpointerup = function () { holding = false; };
        button.onpointerleave = function () { holding = false; };
        wrap.appendChild(button);
        body.appendChild(wrap);
      }

      function tick(now) {
        var dt = (now - last) / 1000; last = now;
        if (holding) { progress += dt / seconds; }
        else if (hold) { progress = Math.max(0, progress - dt / seconds); }
        bar.set(progress);
        if (progress >= 1) { done(); return; }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      return function () { cancelAnimationFrame(raf); };
    };
  }

  G.FuelEngines  = makeFill('Fuel Engines', 'Hold the lever to move the fuel', 3.5, true, 'HOLD TO FUEL');
  G.EmptyChute   = makeFill('Empty Chute', 'Hold the lever to open the chute', 3.0, true, 'HOLD LEVER');
  G.EmptyGarbage = makeFill('Empty Garbage', 'Hold the lever to release the garbage', 3.0, true, 'HOLD LEVER');
  G.DownloadData = makeFill('Download Data', 'Downloading...', 4.0, false);
  G.UploadData   = makeFill('Upload Data', 'Uploading...', 4.0, false);
  G.SubmitScan   = makeFill('Submit Scan', 'Hold still. Scanning in progress...', 10.0, false);
})();

/* ---------------- Drag-to-zone tasks ---------------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  /* Vertical slider you drag into a target band. */
  function makeSlider(titleText, subText, targetFrom, targetTo) {
    return function (body, done) {
      H.title(body, titleText);
      var status = H.sub(body, subText);
      var stage = H.stage(body, 240, 340);
      var zone = H.el('div', '', 'position:absolute;left:0;width:100%;background:rgba(51,201,107,.22);' +
        'border-top:2px dashed #33c96b;border-bottom:2px dashed #33c96b;top:' + targetFrom + 'px;height:' + (targetTo - targetFrom) + 'px;');
      stage.appendChild(zone);
      var track = H.el('div', '', 'position:absolute;left:104px;top:10px;width:26px;height:320px;background:#0a1524;border-radius:13px;');
      stage.appendChild(track);
      var handle = H.el('div', '', 'position:absolute;left:74px;top:280px;width:86px;height:38px;border-radius:8px;' +
        'background:#d8a33c;border:3px solid #8a6d29;');
      stage.appendChild(handle);
      H.drag(handle, function (ev) {
        var p = H.local(stage, ev);
        handle.style.top = Math.max(6, Math.min(296, p.y - 19)) + 'px';
      }, function () {
        var mid = parseFloat(handle.style.top) + 19;
        if (mid >= targetFrom && mid <= targetTo) {
          handle.style.background = '#33c96b'; status.textContent = 'Aligned'; status.className = 'yap-sub yap-ok'; done();
        } else {
          status.textContent = 'Not aligned - try again'; status.className = 'yap-sub yap-bad';
        }
      });
    };
  }

  G.AlignEngineOutput    = makeSlider('Align Engine Output', 'Drag the output into the green band', 130, 190);
  G.DivertPower          = makeSlider('Divert Power', 'Push the breaker all the way up', 6, 62);
  G.AcceptDivertedPower  = makeSlider('Accept Diverted Power', 'Pull the switch down to accept power', 254, 316);

  G.StabilizeSteering = function (body, done) {
    H.title(body, 'Stabilize Steering');
    var status = H.sub(body, 'Drag the reticle to the centre');
    var stage = H.stage(body, 420, 340);
    stage.style.background = 'radial-gradient(circle at 50% 50%, #12314a 0%, #081625 100%)';
    var cross = H.el('div', '', 'position:absolute;left:50%;top:50%;width:70px;height:70px;margin:-35px 0 0 -35px;' +
      'border:2px dashed #4d7ea8;border-radius:50%;');
    stage.appendChild(cross);
    var dot = H.el('div', '', 'position:absolute;left:60px;top:250px;width:44px;height:44px;border-radius:50%;' +
      'background:rgba(51,201,107,.25);border:3px solid #33c96b;');
    stage.appendChild(dot);
    H.drag(dot, function (ev) {
      var p = H.local(stage, ev);
      dot.style.left = Math.max(0, Math.min(376, p.x - 22)) + 'px';
      dot.style.top = Math.max(0, Math.min(296, p.y - 22)) + 'px';
      var dx = (parseFloat(dot.style.left) + 22) - 210, dy = (parseFloat(dot.style.top) + 22) - 170;
      if (Math.sqrt(dx * dx + dy * dy) < 26) {
        dot.style.left = '188px'; dot.style.top = '148px';
        status.textContent = 'Stabilized'; status.className = 'yap-sub yap-ok'; done();
      }
    });
  };
})();

/* ---------------- Unique tasks (a) ---------------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  G.CalibrateDistributor = function (body, done) {
    H.title(body, 'Calibrate Distributor');
    var status = H.sub(body, 'Stop each dial at the top notch');
    var stage = H.stage(body, 460, 230);
    var dials = [], rings = [], current = 0, angle = Math.random() * 360, raf = 0, last = performance.now();
    for (var i = 0; i < 3; i++) {
      var ring = H.el('div', '', 'position:absolute;left:' + (40 + i * 140) + 'px;top:24px;width:120px;height:120px;' +
        'border-radius:50%;background:#0a1524;border:4px solid #3d6a99;');
      var notch = H.el('div', '', 'position:absolute;left:50%;top:-2px;width:8px;height:20px;margin-left:-4px;background:#33c96b;');
      ring.appendChild(notch);
      var hand = H.el('div', '', 'position:absolute;left:50%;top:50%;width:6px;height:52px;margin-left:-3px;' +
        'background:#ffd34d;transform-origin:50% 100%;transform:translateY(-100%);');
      ring.appendChild(hand);
      stage.appendChild(ring);
      dials.push(hand); rings.push(ring);
    }
    var button = H.el('button', 'yap-btn', 'position:absolute;left:50%;bottom:14px;transform:translateX(-50%);');
    button.textContent = 'LOCK';
    button.onpointerdown = function () {
      var a = angle % 360, off = Math.min(a, 360 - a);
      if (off > 18) { angle = Math.random() * 360; status.textContent = 'Missed!'; status.className = 'yap-sub yap-bad'; return; }
      rings[current].style.borderColor = '#33c96b';
      current++; angle = Math.random() * 360;
      status.textContent = 'Stop each dial at the top notch'; status.className = 'yap-sub';
      if (current >= 3) { cancelAnimationFrame(raf); done(); }
    };
    stage.appendChild(button);
    function tick(now) {
      var dt = (now - last) / 1000; last = now;
      angle = (angle + 200 * dt) % 360;
      if (current < 3) { dials[current].style.transform = 'translateY(-100%) rotate(' + angle + 'deg)'; }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function () { cancelAnimationFrame(raf); };
  };

  G.ChartCourse = function (body, done) {
    H.title(body, 'Chart Course');
    var status = H.sub(body, 'Drag the ship along the course');
    var stage = H.stage(body, 520, 320);
    var pts = [[60,250],[150,180],[250,220],[340,120],[440,70]], next = 0, dots = [];
    pts.forEach(function (p) {
      var dot = H.el('div', '', 'position:absolute;left:' + (p[0]-11) + 'px;top:' + (p[1]-11) + 'px;' +
        'width:22px;height:22px;border-radius:50%;background:#12253c;border:3px dashed #4d7ea8;');
      stage.appendChild(dot); dots.push(dot);
    });
    var ship = H.el('div', '', 'position:absolute;left:' + (pts[0][0]-16) + 'px;top:' + (pts[0][1]-16) + 'px;' +
      'width:32px;height:32px;background:#d8e6f2;clip-path:polygon(50% 0%,100% 100%,50% 78%,0% 100%);');
    stage.appendChild(ship);
    H.drag(ship, function (ev) {
      var p = H.local(stage, ev);
      ship.style.left = (p.x - 16) + 'px'; ship.style.top = (p.y - 16) + 'px';
      if (next >= pts.length) { return; }
      var dx = p.x - pts[next][0], dy = p.y - pts[next][1];
      if (Math.sqrt(dx*dx + dy*dy) < 32) {
        dots[next].style.background = '#33c96b'; dots[next].style.borderStyle = 'solid'; next++;
        if (next >= pts.length) { status.textContent = 'Course set'; status.className = 'yap-sub yap-ok'; done(); }
      }
    }, function () {
      if (next >= pts.length) { return; }
      next = 0;
      ship.style.left = (pts[0][0]-16) + 'px'; ship.style.top = (pts[0][1]-16) + 'px';
      dots.forEach(function (d) { d.style.background = '#12253c'; d.style.borderStyle = 'dashed'; });
      status.textContent = 'Do not let go - start again'; status.className = 'yap-sub yap-bad';
    });
  };
})();

/* ---------------- Unique tasks (b) ---------------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  G.InspectSample = function (body, done) {
    H.title(body, 'Inspect Sample');
    var status = H.sub(body, 'Press START to begin analysis');
    var stage = H.stage(body, 480, 210);
    var fluids = [], anomaly = Math.floor(Math.random() * 5), ready = false, timer = 0;
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        var tube = H.el('div', '', 'position:absolute;left:' + (30 + idx * 90) + 'px;top:24px;width:56px;height:150px;' +
          'background:#0a1524;border:3px solid #3d6a99;border-radius:8px 8px 22px 22px;cursor:pointer;');
        var fluid = H.el('div', '', 'position:absolute;left:4px;right:4px;bottom:4px;height:70px;background:#3f6fe0;border-radius:0 0 18px 18px;');
        tube.appendChild(fluid);
        tube.onpointerdown = function () {
          if (!ready) { return; }
          if (idx === anomaly) {
            status.textContent = 'Anomaly identified'; status.className = 'yap-sub yap-ok'; done();
          } else {
            status.textContent = 'Wrong sample - restarting'; status.className = 'yap-sub yap-bad';
            ready = false; fluids[anomaly].style.background = '#3f6fe0';
            anomaly = Math.floor(Math.random() * 5); start();
          }
        };
        fluids.push(fluid); stage.appendChild(tube);
      })(i);
    }
    var button = H.el('button', 'yap-btn', 'display:block;margin:16px auto 0;');
    button.textContent = 'START';
    function start() {
      button.disabled = true;
      var left = 8;
      status.textContent = 'Processing... ' + left + 's';
      clearInterval(timer);
      timer = setInterval(function () {
        left--;
        if (left > 0) { status.textContent = 'Processing... ' + left + 's'; return; }
        clearInterval(timer);
        fluids[anomaly].style.background = '#e0453f';
        ready = true;
        status.textContent = 'Select the anomaly'; status.className = 'yap-sub';
      }, 1000);
    }
    button.onpointerdown = start;
    body.appendChild(button);
    return function () { clearInterval(timer); };
  };

  G.CleanO2Filter = function (body, done) {
    H.title(body, 'Clean O2 Filter');
    H.sub(body, 'Drag the leaves into the chute on the right');
    var stage = H.stage(body, 520, 320);
    var chute = H.el('div', '', 'position:absolute;right:0;top:0;width:130px;height:100%;background:#0a1524;border-left:3px dashed #4d7ea8;');
    stage.appendChild(chute);
    var remaining = 8;
    for (var i = 0; i < 8; i++) {
      var leaf = H.el('div', '', 'position:absolute;width:38px;height:26px;border-radius:60% 10% 60% 10%;' +
        'background:#4ea85c;left:' + H.rand(10, 330) + 'px;top:' + H.rand(10, 270) + 'px;');
      stage.appendChild(leaf);
      (function (node) {
        H.drag(node, function (ev) {
          var p = H.local(stage, ev);
          node.style.left = (p.x - 19) + 'px';
          node.style.top = (p.y - 13) + 'px';
        }, function () {
          if (parseFloat(node.style.left) > 380) {
            if (node.parentNode) { stage.removeChild(node); }
            remaining--;
            if (remaining <= 0) { done(); }
          }
        });
      })(leaf);
    }
  };
})();

/* ---------------- Unique tasks (c) ---------------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  G.StartReactor = function (body, done) {
    H.title(body, 'Start Reactor');
    var status = H.sub(body, 'Watch the sequence');
    var stage = H.stage(body, 420, 420);
    var pads = [], seq = [], input = 0, accepting = false, timers = [];
    var colors = ['#e0453f', '#3f6fe0', '#e8d24a', '#4ea85c'];

    function flash(idx, ms) {
      pads[idx].style.opacity = '1';
      timers.push(setTimeout(function () { pads[idx].style.opacity = '.45'; }, ms));
    }

    function nextRound() {
      accepting = false;
      input = 0;
      seq.push(Math.floor(Math.random() * 4));
      status.textContent = 'Watch the sequence';
      status.className = 'yap-sub';
      seq.forEach(function (idx, i) {
        timers.push(setTimeout(function () { flash(idx, 400); }, 500 + i * 620));
      });
      timers.push(setTimeout(function () {
        accepting = true;
        status.textContent = 'Repeat the sequence';
      }, 520 + seq.length * 620));
    }

    for (var i = 0; i < 4; i++) {
      (function (idx) {
        var col = idx % 2, row = Math.floor(idx / 2);
        var pad = H.el('div', '', 'position:absolute;left:' + (30 + col * 190) + 'px;top:' + (30 + row * 190) + 'px;' +
          'width:170px;height:170px;border-radius:14px;opacity:.45;cursor:pointer;background:' + colors[idx] + ';');
        pad.onpointerdown = function () {
          if (!accepting) { return; }
          if (idx !== seq[input]) {
            accepting = false;
            status.textContent = 'Wrong! Restarting'; status.className = 'yap-sub yap-bad';
            seq = [];
            timers.push(setTimeout(nextRound, 900));
            return;
          }
          flash(idx, 220);
          input++;
          if (input < seq.length) { return; }
          if (seq.length >= 5) {
            accepting = false;
            status.textContent = 'Reactor online'; status.className = 'yap-sub yap-ok';
            done();
          } else {
            accepting = false;
            timers.push(setTimeout(nextRound, 650));
          }
        };
        pads.push(pad);
        stage.appendChild(pad);
      })(i);
    }

    timers.push(setTimeout(nextRound, 400));
    return function () { timers.forEach(clearTimeout); };
  };
})();

/* ------- Distinct replacements: these two were both generic sliders before ------- */
(function () {
  var H = window.YapTasks.helpers, G = window.YapTasks.games;

  /* Accept Diverted Power: a breaker panel — flip the one live switch. */
  G.AcceptDivertedPower = function (body, done) {
    H.title(body, 'Accept Diverted Power');
    var status = H.sub(body, 'Flip the switch that is receiving power');
    var stage = H.stage(body, 470, 300);

    var live = Math.floor(Math.random() * 5);
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        var slot = H.el('div', '', 'position:absolute;left:' + (24 + idx * 88) + 'px;top:40px;' +
          'width:64px;height:210px;background:#0a1524;border:4px solid #000;border-radius:8px;' +
          'box-shadow:inset 0 0 0 3px #3f5b78;');

        var lamp = H.el('div', '', 'position:absolute;left:50%;top:12px;width:20px;height:20px;' +
          'margin-left:-10px;border-radius:50%;border:3px solid #000;background:' +
          (idx === live ? '#ffd34d' : '#33465c') + ';');
        slot.appendChild(lamp);

        var lever = H.el('div', '', 'position:absolute;left:8px;top:150px;width:44px;height:44px;' +
          'border-radius:6px;border:4px solid #000;background:#c9d4de;cursor:pointer;');
        slot.appendChild(lever);

        slot.onpointerdown = function () {
          if (idx !== live) {
            status.textContent = 'That breaker is dead'; status.className = 'yap-sub yap-bad';
            return;
          }
          lever.style.top = '48px';
          lamp.style.background = '#46e07a';
          status.textContent = 'Power accepted'; status.className = 'yap-sub yap-ok';
          done();
        };

        stage.appendChild(slot);
      })(i);
    }
  };

  /* Align Engine Output: line the moving engine core up with the fixed centre line. */
  G.AlignEngineOutput = function (body, done) {
    H.title(body, 'Align Engine Output');
    var status = H.sub(body, 'Drag the core onto the centre line');
    var stage = H.stage(body, 300, 360);

    var target = H.el('div', '', 'position:absolute;left:0;top:166px;width:100%;height:28px;' +
      'background:rgba(70,224,122,.18);border-top:3px dashed #46e07a;border-bottom:3px dashed #46e07a;');
    stage.appendChild(target);

    var rail = H.el('div', '', 'position:absolute;left:138px;top:12px;width:16px;height:336px;' +
      'background:#0a1524;border:3px solid #000;border-radius:8px;');
    stage.appendChild(rail);

    var core = H.el('div', '', 'position:absolute;left:78px;top:' + H.rand(20, 300) + 'px;width:136px;height:52px;' +
      'border-radius:10px;border:4px solid #000;background:#ff9b3d;box-shadow:inset 0 -6px 0 rgba(0,0,0,.25);');
    stage.appendChild(core);

    H.drag(core, function (ev) {
      var p = H.local(stage, ev);
      core.style.top = Math.max(6, Math.min(300, p.y - 26)) + 'px';
      var mid = parseFloat(core.style.top) + 26;
      if (mid >= 166 && mid <= 194) {
        core.style.top = '154px';
        core.style.background = '#46e07a';
        status.textContent = 'Output aligned'; status.className = 'yap-sub yap-ok';
        done();
      }
    });
  };
})();
