/* =============================================================================
 * meeting.js - emergency meeting / voting / chat, drawn as HTML over the canvas.
 *
 * Unity drives it through YapMeeting.jslib; this replies with SendMessage to the
 * GameObject named "TaskSystem" (same bridge object the tasks use):
 *     OnMeetingVote  -> "<targetPlayerId>"   (-1 means Skip)
 *     OnMeetingChat  -> "<text>"
 *
 * All state shown here is what the SERVER sent. Nothing is decided locally: the
 * tally, the ejection and who is allowed to vote are all server-side.
 * ===========================================================================*/
(function () {
  'use strict';

  var YapMeeting = window.YapMeeting = { open: false, _root: null, _timer: 0, _voted: false };

  var toUnity = window.YapUI.sender('TaskSystem', 'YapMeeting');

  var el = window.YapUI.el;

  /* A little CSS crewmate in the player's colour. */
  function bean(color, dead) {
    var wrap = el('div', 'au-bean');
    wrap.style.background = dead ? '#5b6470' : color;
    if (dead) { wrap.classList.add('dead'); }
    wrap.appendChild(el('i', 'au-pack'));
    wrap.appendChild(el('u', 'au-visor'));
    return wrap;
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

  followFullscreen(function () { return [YapMeeting._root, YapMeeting._intro]; });

  var state = { me: 0, players: [], canVote: false, votedFor: null };

  YapMeeting._build = function (json) {
    var data = typeof json === 'string' ? JSON.parse(json) : json;
    YapMeeting.closeNow();

    state.me = data.me;
    state.players = data.players || [];
    state.canVote = !!data.canVote;
    state.votedFor = null;
    YapMeeting._voted = false;

    var overlay = el('div');
    overlay.id = 'yap-meet-overlay';
    var panel = el('div');
    panel.id = 'yap-meet-panel';
    overlay.appendChild(panel);

    var head = el('div', 'meet-head');
    var title = el('div', 'yap-title');
    title.textContent = data.title || 'EMERGENCY MEETING';
    head.appendChild(title);
    var sub = el('div', 'yap-sub');
    sub.id = 'meet-sub';
    sub.textContent = data.subtitle || 'Discuss!';
    head.appendChild(sub);
    panel.appendChild(head);

    var timer = el('div', 'meet-timer');
    timer.id = 'meet-timer';
    panel.appendChild(timer);

    var columns = el('div', 'meet-cols');
    panel.appendChild(columns);

    /* ---- left: the player grid ---- */
    var grid = el('div', 'meet-grid');
    columns.appendChild(grid);

    state.players.forEach(function (player) {
      var card = el('div', 'meet-card');
      card.dataset.pid = player.id;
      if (player.dead) { card.classList.add('is-dead'); }

      card.appendChild(bean(player.color, player.dead));

      var name = el('div', 'meet-name');
      name.textContent = player.name + (player.id === state.me ? ' (you)' : '');
      card.appendChild(name);

      if (player.dead) {
        var tag = el('div', 'meet-tag');
        tag.textContent = 'DEAD';
        card.appendChild(tag);
      }

      var votes = el('div', 'meet-votes');
      votes.dataset.votesFor = player.id;
      card.appendChild(votes);

      if (YapMeeting.canVoteFor(player)) {
        var button = el('button', 'yap-btn meet-vote');
        button.textContent = 'VOTE';
        button.onclick = function () { YapMeeting.castVote(player.id, card); };
        card.appendChild(button);
      }

      grid.appendChild(card);
    });

    /* Skip vote sits with the players, like the real game. */
    if (state.canVote) {
      var skip = el('div', 'meet-card meet-skip');
      var skipLabel = el('div', 'meet-name');
      skipLabel.textContent = 'SKIP VOTE';
      skip.appendChild(skipLabel);
      var skipVotes = el('div', 'meet-votes');
      skipVotes.dataset.votesFor = '-1';
      skip.appendChild(skipVotes);
      var skipButton = el('button', 'yap-btn meet-vote');
      skipButton.textContent = 'SKIP';
      skipButton.onclick = function () { YapMeeting.castVote(-1, skip); };
      skip.appendChild(skipButton);
      grid.appendChild(skip);
    }

    /* ---- right: chat ---- */
    var chat = el('div', 'meet-chat');
    var log = el('div', 'meet-log');
    log.id = 'meet-log';
    chat.appendChild(log);

    var row = el('div', 'meet-row');
    var input = el('input', 'meet-input');
    input.id = 'meet-input';
    input.maxLength = 120;
    input.placeholder = data.canChat === false ? 'Dead players cannot chat' : 'Type a message...';
    input.disabled = data.canChat === false;
    /* Unity grabs keystrokes from the canvas; release them while typing here. */
    input.addEventListener('focus', function () { toUnity('OnChatFocus', '1'); });
    input.addEventListener('blur', function () { toUnity('OnChatFocus', '0'); });
    input.addEventListener('keydown', function (ev) {
      ev.stopPropagation();
      if (ev.key === 'Enter') { send(); }
    });
    row.appendChild(input);

    var sendButton = el('button', 'yap-btn meet-send');
    sendButton.textContent = 'SEND';
    sendButton.disabled = data.canChat === false;
    sendButton.onclick = send;
    row.appendChild(sendButton);
    chat.appendChild(row);
    columns.appendChild(chat);

    function send() {
      var text = input.value.trim();
      if (!text) { return; }
      input.value = '';
      toUnity('OnMeetingChat', text);
    }

    overlayHost().appendChild(overlay);
    YapMeeting._root = overlay;
    YapMeeting.open = true;

    YapMeeting.setTimer(data.seconds || 45, data.phase || 'discuss');
  };

  /**
   * The Among Us cutscene before the meeting: a slam-in title, a colour flash and a shake.
   * Report = red and violent, emergency meeting = cyan and urgent. Then the meeting panel appears.
   */
  YapMeeting.start = function (json) {
    var data = typeof json === 'string' ? JSON.parse(json) : json;
    var isReport = (data.title || '').toUpperCase().indexOf('BODY') !== -1;

    YapMeeting.closeNow();

    var intro = el('div');
    intro.id = 'yap-meet-intro';
    intro.className = isReport ? 'is-report' : 'is-emergency';

    intro.appendChild(el('div', 'meet-intro-flash'));

    var burst = el('div', 'meet-intro-burst');
    intro.appendChild(burst);

    var title = el('div', 'meet-intro-title');
    title.textContent = data.title || 'EMERGENCY MEETING';
    intro.appendChild(title);

    var sub = el('div', 'meet-intro-sub');
    sub.textContent = data.subtitle || '';
    intro.appendChild(sub);

    // A crewmate silhouette slides across, like the little animation in the real game.
    var runner = el('div', 'meet-intro-runner');
    runner.appendChild(el('u', 'au-visor'));
    intro.appendChild(runner);

    overlayHost().appendChild(intro);
    YapMeeting._intro = intro;

    YapMeeting._introTimer = setTimeout(function () {
      if (intro.parentNode) { intro.parentNode.removeChild(intro); }
      YapMeeting._intro = null;
      YapMeeting._build(data);
    }, 2600);
  };

  YapMeeting.canVoteFor = function (player) {
    return state.canVote && !player.dead;
  };

  YapMeeting.castVote = function (targetId, card) {
    if (!state.canVote || YapMeeting._voted) { return; }
    YapMeeting._voted = true;
    state.votedFor = targetId;

    /* Grey out every vote button; the server confirms the tally later. */
    Array.prototype.forEach.call(document.querySelectorAll('.meet-vote'), function (b) { b.disabled = true; });
    if (card) { card.classList.add('picked'); }

    var sub = document.getElementById('meet-sub');
    if (sub) { sub.textContent = 'Vote cast. Waiting for the others...'; }

    toUnity('OnMeetingVote', String(targetId));
  };

  /* Server says this player has voted (not who for - that stays secret until the reveal). */
  YapMeeting.voted = function (json) {
    var data = typeof json === 'string' ? JSON.parse(json) : json;
    var card = document.querySelector('.meet-card[data-pid="' + data.voterId + '"]');
    if (card) { card.classList.add('has-voted'); }
  };

  YapMeeting.chat = function (json) {
    var data = typeof json === 'string' ? JSON.parse(json) : json;
    var log = document.getElementById('meet-log');
    if (!log) { return; }

    var line = el('div', 'meet-msg');
    var who = el('b');
    who.textContent = data.name + ': ';
    who.style.color = data.color || '#9db4cd';
    line.appendChild(who);
    line.appendChild(document.createTextNode(data.text));
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  };

  /* Reveal who voted for whom, then the ejection. */
  YapMeeting.result = function (json) {
    var data = typeof json === 'string' ? JSON.parse(json) : json;

    (data.votes || []).forEach(function (vote) {
      var slot = document.querySelector('.meet-votes[data-votes-for="' + vote.targetId + '"]');
      if (!slot) { return; }
      var voter = (state.players.filter(function (p) { return p.id === vote.voterId; })[0]) || {};
      var pip = bean(voter.color || '#888', false);
      pip.classList.add('pip');
      slot.appendChild(pip);
    });

    var panel = document.getElementById('yap-meet-panel');
    if (!panel) { return; }

    setTimeout(function () {
      var screen = el('div', 'meet-eject');
      var text = el('div', 'meet-eject-text');
      text.textContent = data.message || 'No one was ejected.';
      screen.appendChild(text);
      if (data.remainingText) {
        var rem = el('div', 'meet-eject-sub');
        rem.textContent = data.remainingText;
        screen.appendChild(rem);
      }
      panel.appendChild(screen);
      setTimeout(function () { YapMeeting.closeNow(); }, 4200);
    }, 2200);
  };

  YapMeeting.setTimer = function (seconds, phase) {
    clearInterval(YapMeeting._timer);
    var left = seconds;
    var node = document.getElementById('meet-timer');
    var label = phase === 'vote' ? 'Voting ends in' : 'Discussion ends in';

    function paint() {
      if (!node) { return; }
      node.textContent = label + ' ' + Math.max(0, left) + 's';
      node.classList.toggle('urgent', left <= 10);
    }
    paint();
    YapMeeting._timer = setInterval(function () {
      left--;
      paint();
      if (left <= 0) { clearInterval(YapMeeting._timer); }
    }, 1000);
  };

  /* Server moved us from discussion into voting. */
  YapMeeting.phase = function (json) {
    var data = typeof json === 'string' ? JSON.parse(json) : json;
    state.canVote = !!data.canVote;
    var sub = document.getElementById('meet-sub');
    if (sub) { sub.textContent = data.subtitle || 'Vote now!'; }
    YapMeeting.setTimer(data.seconds || 30, 'vote');
  };

  YapMeeting.closeNow = function () {
    clearInterval(YapMeeting._timer);
    clearTimeout(YapMeeting._introTimer);
    if (YapMeeting._intro && YapMeeting._intro.parentNode) {
      YapMeeting._intro.parentNode.removeChild(YapMeeting._intro);
    }
    YapMeeting._intro = null;
    if (YapMeeting._root && YapMeeting._root.parentNode) {
      YapMeeting._root.parentNode.removeChild(YapMeeting._root);
    }
    YapMeeting._root = null;
    YapMeeting.open = false;
    toUnity('OnChatFocus', '0');
  };
})();
