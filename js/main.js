// ── THEME INIT ──
(function() {
  document.documentElement.classList.add('js');
  var saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── CUSTOM CURSOR ──
var cursorDot  = document.getElementById('cursorDot');
var cursorRing = document.getElementById('cursorRing');

var mx = -999, my = -999;
var dotX = -999, dotY = -999;
var ringX = -999, ringY = -999;
var cursorDirty = false;

document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; cursorDirty = true; });

(function rafLoop() {
  if (!cursorDirty) { requestAnimationFrame(rafLoop); return; }
  cursorDirty = false;

  dotX = mx; dotY = my;
  ringX += (mx - ringX) * 0.18;
  ringY += (my - ringY) * 0.18;

  cursorDot.style.transform  = 'translate(' + (dotX  - 2.5) + 'px,' + (dotY  - 2.5) + 'px)';
  cursorRing.style.transform = 'translate(' + (ringX - 15)  + 'px,' + (ringY - 15)  + 'px)';
  requestAnimationFrame(rafLoop);
})();

document.addEventListener('mouseleave', function() {
  cursorDot.style.opacity = '0';
  cursorRing.style.opacity = '0';
});
document.addEventListener('mouseenter', function() {
  cursorDot.style.opacity = '1';
  cursorRing.style.opacity = '1';
});

function setCursorState(state) {
  ['on-headline','on-interactive','on-button'].forEach(function(c) {
    cursorDot.classList.remove(c);
    cursorRing.classList.remove(c);
  });
  if (state) {
    cursorDot.classList.add(state);
    cursorRing.classList.add(state);
  }
}

var heroHeadline = document.querySelector('.hero-headline');
if (heroHeadline) {
  heroHeadline.addEventListener('mouseenter', function() { setCursorState('on-headline'); });
  heroHeadline.addEventListener('mouseleave', function() { setCursorState(null); });
}

document.querySelectorAll('.nav-cta, .btn-primary, .contact-link.filled').forEach(function(el) {
  el.addEventListener('mouseenter', function() { setCursorState('on-button'); });
  el.addEventListener('mouseleave', function() { setCursorState(null); });
});

document.querySelectorAll('a:not(.nav-cta):not(.btn-primary):not(.contact-link.filled), button, .work-item, .service-card, .skill-pill, .theme-btn').forEach(function(el) {
  el.addEventListener('mouseenter', function() { setCursorState('on-interactive'); });
  el.addEventListener('mouseleave', function() { setCursorState(null); });
});

// ── SCROLL REVEAL (word-by-word blur) ──
(function() {
  document.querySelectorAll('.sr-para').forEach(function(p) {
    var words = p.innerHTML
      .split(/(<[^>]+>|\s+)/)
      .filter(function(s) { return s.length > 0; });

    var result = words.map(function(token) {
      if (token.match(/^</) || token.match(/^\s+$/)) return token;
      return '<span class="sr-word">' + token + '</span>';
    });
    p.innerHTML = result.join('');
  });

  var wordObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var para = entry.target.parentElement;
        var siblings = Array.from(para.querySelectorAll('.sr-word'));
        var idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.03) + 's';
        entry.target.classList.add('visible');
        wordObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.sr-word').forEach(function(w) { wordObs.observe(w); });
})();

// ── THEME TOGGLE ──
var root = document.documentElement;
var themeBtn = document.getElementById('themeBtn');
var transitioning = false;

themeBtn.addEventListener('click', function() {
  if (transitioning) return;
  transitioning = true;

  var isDark = root.getAttribute('data-theme') === 'dark';
  var next = isDark ? 'light' : 'dark';

  var rect = themeBtn.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var endR = Math.hypot(
    Math.max(cx, window.innerWidth - cx),
    Math.max(cy, window.innerHeight - cy)
  );

  if (document.startViewTransition) {
    var vt = document.startViewTransition(function() {
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
    vt.ready.then(function() {
      document.documentElement.animate(
        { clipPath: ['circle(0px at ' + cx + 'px ' + cy + 'px)', 'circle(' + endR + 'px at ' + cx + 'px ' + cy + 'px)'] },
        { duration: 600, easing: 'cubic-bezier(0.4,0,0.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
    vt.finished.then(function() { transitioning = false; });
    return;
  }

  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  var snap = document.createElement('div');
  snap.className = 'theme-snapshot';
  snap.style.background = isDark ? '#111110' : '#f5f4f0';
  snap.style.clipPath = 'circle(' + endR + 'px at ' + cx + 'px ' + cy + 'px)';
  document.body.appendChild(snap);
  snap.animate(
    [{ clipPath: 'circle(' + endR + 'px at ' + cx + 'px ' + cy + 'px)' }, { clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)' }],
    { duration: 600, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }
  ).onfinish = function() { snap.remove(); transitioning = false; };
});

// ── NAV CONDENSE ──
var navWrap = document.getElementById('navWrap');
var ticking = false;
function updateNav() {
  if (window.scrollY > 50) navWrap.classList.add('condensed');
  else navWrap.classList.remove('condensed');
  ticking = false;
}
window.addEventListener('scroll', function() {
  if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
}, { passive: true });

// ── REVEAL ON SCROLL ──
var obs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });

// ── TEXT PRESSURE EFFECT ──
(function() {
  var headline = document.querySelector('.hero-headline');
  if (!headline) return;

  function wrapChars(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      var text = node.textContent;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ' || ch === '\n') {
          var sp = document.createElement('span');
          sp.className = 'char-space';
          sp.innerHTML = '&nbsp;';
          frag.appendChild(sp);
        } else {
          var span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          frag.appendChild(span);
        }
      }
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      Array.from(node.childNodes).forEach(wrapChars);
    }
  }
  Array.from(headline.childNodes).forEach(wrapChars);

  var chars = Array.from(headline.querySelectorAll('.char'));
  var BASE   = 300;
  var MAX    = 900;
  var MIN    = 100;
  var RADIUS = 200;

  var current = chars.map(function() { return BASE; });
  var target  = chars.map(function() { return BASE; });

  var rects = [];
  function cacheRects() {
    rects = chars.map(function(ch) {
      var r = ch.getBoundingClientRect();
      return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
    });
  }
  setTimeout(cacheRects, 300);
  window.addEventListener('resize', cacheRects, { passive: true });
  var cacheRectsTicking = false;
  window.addEventListener('scroll', function() {
    if (!cacheRectsTicking) { requestAnimationFrame(function() { cacheRects(); cacheRectsTicking = false; }); cacheRectsTicking = true; }
  }, { passive: true });

  var idleActive = true;

  headline.addEventListener('mouseenter', function() {
    idleActive = false;
  });
  headline.addEventListener('mouseleave', function() {
    idleActive = true;
    for (var i = 0; i < target.length; i++) target[i] = BASE;
  });

  var LERP_SPEED = 0.12;

  function tick() {
    if (idleActive) {
      var t = Date.now() / 1800;
      for (var i = 0; i < chars.length; i++) {
        target[i] = BASE + Math.sin(t + i * 0.4) * 100;
      }
    } else if (rects.length) {
      for (var i = 0; i < rects.length; i++) {
        var dx = mx - rects[i].x;
        var dy = my - rects[i].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var prox = Math.max(0, 1 - dist / RADIUS);
        prox = prox * prox * (3 - 2 * prox);
        target[i] = MIN + prox * (MAX - MIN);
      }
    }

    for (var i = 0; i < chars.length; i++) {
      var next = current[i] + (target[i] - current[i]) * LERP_SPEED;
      var rounded = Math.round(next);
      if (Math.abs(rounded - Math.round(current[i])) >= 1) {
        chars[i].style.fontWeight = rounded;
      }
      current[i] = next;
    }

    requestAnimationFrame(tick);
  }
  tick();
})();
