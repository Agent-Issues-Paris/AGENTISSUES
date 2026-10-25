if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('introOverlay');
  var video = document.getElementById('introVideo');
  var frame = document.getElementById('introFrame');
  if (!overlay || (!video && !frame)) return;

  var STORAGE_KEY = 'agentIntroPlayed';
  var alreadyPlayed = false;
  try {
    alreadyPlayed = sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {}

  if (alreadyPlayed) {
    overlay.remove();
    return;
  }

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {}
    overlay.remove();
  }

  overlay.addEventListener('click', dismiss);

  if (video) {
    video.addEventListener('ended', dismiss);
    video.play().catch(dismiss);
    return;
  }

  // random reel: a different shuffle of Agent Issues images on every visit
  var pool = [];
  try { pool = JSON.parse(overlay.getAttribute('data-intro-images')) || []; } catch (e) {}
  var count = parseInt(overlay.getAttribute('data-intro-count'), 10) || 16;
  var speed = parseInt(overlay.getAttribute('data-intro-speed'), 10) || 140;

  for (var i = pool.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  var picks = [];
  for (var k = 0; k < count && pool.length; k++) picks.push(pool[k % pool.length]);
  if (!picks.length) return dismiss();

  // preload everything first so the cuts stay sharp; give up after 6s
  var loaded = 0;
  var started = false;
  var giveUp = setTimeout(function () { if (!started) dismiss(); }, 6000);
  picks.forEach(function (src) {
    var img = new Image();
    img.onload = img.onerror = function () {
      loaded += 1;
      if (loaded === picks.length) play();
    };
    img.src = src;
  });

  function play() {
    if (started || !overlay.isConnected) return;
    started = true;
    clearTimeout(giveUp);
    var n = 0;
    (function next() {
      if (!overlay.isConnected) return;
      if (n >= picks.length) return dismiss();
      frame.src = picks[n];
      n += 1;
      setTimeout(next, speed);
    })();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  var track = document.querySelector('.hero-strip__track');
  if (!track) return;

  var halfWidth = 0;
  function measure() {
    halfWidth = track.scrollWidth / 2;
  }
  measure();
  window.addEventListener('resize', measure);

  var SPEED = 1;
  var offset = 0;

  function render() {
    if (!halfWidth) return;
    var wrapped = offset % halfWidth;
    if (wrapped < 0) wrapped += halfWidth;
    track.style.transform = 'translateX(-' + wrapped + 'px)';
  }

  var centerImg = track.querySelector('img[data-strip-center="true"]');
  if (centerImg) {
    offset = centerImg.offsetLeft + centerImg.offsetWidth / 2 - window.innerWidth / 2;
  }

  window.addEventListener('wheel', function (e) {
    offset += e.deltaY * SPEED;
    render();
  }, { passive: true });

  var touchY = null;
  window.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) touchY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', function (e) {
    if (touchY === null || e.touches.length !== 1) return;
    var y = e.touches[0].clientY;
    offset += (touchY - y) * SPEED;
    touchY = y;
    render();
  }, { passive: true });

  window.addEventListener('touchend', function () {
    touchY = null;
  });

  render();
});

document.addEventListener('DOMContentLoaded', function () {
  var credits = document.querySelector('.credits-box');
  if (!credits) return;

  function sync() {
    credits.open = window.innerWidth > 700;
  }

  sync();
  window.addEventListener('resize', sync);
});

document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  function sync() {
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    // how far the centred logo hangs below the top of the window, so text
    // pages can start under it (see "logo clearance" in styles.css)
    var logo = header.querySelector('.logo-overlay');
    if (logo) document.documentElement.style.setProperty('--logo-bottom', (logo.offsetTop + logo.offsetHeight) + 'px');
  }

  sync();
  window.addEventListener('resize', sync);
});

document.addEventListener('DOMContentLoaded', function () {
  var track = document.querySelector('.hero-strip__track');
  if (!track) return;

  var MOBILE_BREAKPOINT = 700;
  var setHeight = 0;

  function measure() {
    setHeight = window.innerWidth <= MOBILE_BREAKPOINT ? track.scrollHeight / 2 : 0;
  }

  function loop() {
    if (!setHeight) return;
    if (window.scrollY >= setHeight) {
      window.scrollTo(0, window.scrollY - setHeight);
    }
  }

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', loop, { passive: true });
});

/* ---------- draw ur own logo ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.site-header');
  var logoImgs = document.querySelectorAll('.logo-overlay img');
  if (!header || !logoImgs.length) return;

  var STORAGE_KEY = 'agentCustomLogo';
  var RED = '#ed1c24';

  function applyLogo(src) {
    logoImgs.forEach(function (img) {
      img.src = src;
      img.classList.add('is-custom');
    });
  }

  // the drawn logo carries across pages, but a refresh resets everything
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var saved = null;
  try {
    localStorage.removeItem(STORAGE_KEY); // drop logos saved by the old localStorage version
    if (nav && nav.type === 'reload') sessionStorage.removeItem(STORAGE_KEY);
    saved = sessionStorage.getItem(STORAGE_KEY);
  } catch (e) {}
  if (saved) applyLogo(saved);

  // Before a drawing, the sticker invites to DRAW 5s after load. Once there is
  // a drawn logo, the sticker stays hidden and shows REDRAW once, the first
  // time the logo is hovered. Each prompt has its own ×, and a × keeps that
  // prompt away for the rest of the visit.
  var DISMISS_KEY = 'agentStickerDismissed';
  var REDRAW_DISMISS_KEY = 'agentRedrawDismissed';
  function flag(key) {
    try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; }
  }
  function setFlag(key) {
    try { sessionStorage.setItem(key, '1'); } catch (e) {}
  }

  var hasLogo = !!saved;
  var redrawArmed = hasLogo;

  var sticker = document.createElement('div');
  sticker.className = 'draw-sticker';
  var stickerLabel = document.createElement('button');
  stickerLabel.type = 'button';
  stickerLabel.className = 'draw-sticker__label';
  var stickerClose = document.createElement('button');
  stickerClose.type = 'button';
  stickerClose.className = 'draw-sticker__close';
  stickerClose.setAttribute('aria-label', 'Close');
  stickerClose.textContent = '×';
  sticker.appendChild(stickerLabel);
  sticker.appendChild(stickerClose);
  header.appendChild(sticker);

  function showSticker(text) {
    stickerLabel.textContent = text;
    sticker.classList.add('is-visible');
  }
  function hideSticker() {
    sticker.classList.remove('is-visible');
  }

  stickerClose.addEventListener('click', function () {
    setFlag(hasLogo ? REDRAW_DISMISS_KEY : DISMISS_KEY);
    hideSticker();
  });

  document.querySelectorAll('.logo-overlay').forEach(function (logo) {
    logo.addEventListener('mouseenter', function () {
      if (!hasLogo || !redrawArmed || flag(REDRAW_DISMISS_KEY)) return;
      redrawArmed = false;
      showSticker('REDRAW UR LOGO!');
    });
  });

  // the logo is there as soon as the intro is gone; the DRAW prompt follows 5s later
  (function waitForIntro() {
    if (document.getElementById('introOverlay')) return setTimeout(waitForIntro, 250);
    header.classList.add('show-logo');
    setTimeout(function () {
      if (!hasLogo && !flag(DISMISS_KEY)) showSticker('DRAW UR OWN LOGO!');
    }, 5000);
  })();

  var modal = null;
  function openDrawModal() {
    if (!modal) modal = buildModal();
    modal.open();
  }
  stickerLabel.addEventListener('click', openDrawModal);
  window.agentOpenDrawLogo = openDrawModal; // the star menu opens it too

  function buildModal() {
    var root = document.createElement('div');
    root.className = 'draw-modal';
    root.innerHTML =
      '<div class="draw-modal__panel" role="dialog" aria-modal="true" aria-label="Draw your own logo">' +
      '  <div class="draw-modal__title">DRAW UR OWN LOGO!</div>' +
      '  <div class="draw-modal__body">' +
      '    <div class="draw-modal__tools">' +
      '      <button type="button" class="draw-tool is-active" data-tool="pencil" aria-label="Pencil">' +
      '        <svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 21l1.2-4.8L16.5 3.9a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L7.8 19.8z"/></svg>' +
      '      </button>' +
      '      <button type="button" class="draw-tool" data-tool="eraser" aria-label="Eraser">' +
      '        <svg viewBox="0 0 24 24" width="30" height="30"><path d="M14.5 3.5l6 6-9.5 9.5-6-6zM4 14l6 6-2 1.5H5L2.5 19a1.5 1.5 0 0 1 0-2.1z"/></svg>' +
      '      </button>' +
      '    </div>' +
      '    <canvas class="draw-modal__canvas"></canvas>' +
      '  </div>' +
      '  <button type="button" class="draw-modal__done">DONE!</button>' +
      '</div>';
    document.body.appendChild(root);

    var canvas = root.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var tool = 'pencil';
    var drawing = false;
    var last = null;
    var dpr = 1;

    function sizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    root.querySelectorAll('.draw-tool').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tool = btn.dataset.tool;
        root.querySelectorAll('.draw-tool').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
      });
    });

    // crayon-ish brush: scatter little red flecks along the stroke
    function crayonDab(x, y) {
      var radius = 8;
      for (var i = 0; i < 24; i++) {
        var a = Math.random() * Math.PI * 2;
        var r = Math.random() * radius;
        ctx.globalAlpha = 0.35 + Math.random() * 0.65;
        ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
    }

    function eraseDab(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    function stroke(from, to) {
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.fillStyle = RED;
      var dab = tool === 'eraser' ? eraseDab : crayonDab;
      var dist = Math.hypot(to.x - from.x, to.y - from.y);
      var steps = Math.max(1, Math.ceil(dist));
      for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        dab(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
      }
    }

    function point(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    canvas.addEventListener('pointerdown', function (e) {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      last = point(e);
      stroke(last, last);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = point(e);
      stroke(last, p);
      last = p;
    });
    ['pointerup', 'pointercancel'].forEach(function (type) {
      canvas.addEventListener(type, function () { drawing = false; });
    });

    // crop to what was actually drawn so it fills the logo slot
    function exportDrawing() {
      var w = canvas.width, h = canvas.height;
      var data = ctx.getImageData(0, 0, w, h).data;
      var minX = w, minY = h, maxX = -1, maxY = -1;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] > 0) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < 0) return null;
      var pad = Math.round(6 * dpr);
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(w - 1, maxX + pad);
      maxY = Math.min(h - 1, maxY + pad);
      var out = document.createElement('canvas');
      out.width = maxX - minX + 1;
      out.height = maxY - minY + 1;
      out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
      return out.toDataURL('image/png');
    }

    function close() {
      root.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    root.addEventListener('click', function (e) {
      if (e.target === root) close();
    });

    root.querySelector('.draw-modal__done').addEventListener('click', function () {
      var src = exportDrawing();
      if (src) {
        applyLogo(src);
        try { sessionStorage.setItem(STORAGE_KEY, src); } catch (e) {}
        hasLogo = true;
        redrawArmed = true; // a new drawing gets one hover prompt again
        hideSticker();
      }
      close();
    });

    return {
      open: function () {
        root.classList.add('is-open');
        sizeCanvas();
        document.addEventListener('keydown', onKey);
      }
    };
  }
});

/* ---------- contributors list scrolls on its own ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var credits = document.querySelector('.credits-box');
  if (!credits) return;
  // keep the wheel/touch from also driving the hero strip behind it
  ['wheel', 'touchstart', 'touchmove'].forEach(function (type) {
    credits.addEventListener(type, function (e) { e.stopPropagation(); }, { passive: true });
  });
});

/* ---------- quick add to cart on product grids ---------- */
// data-variants on each grid column's ADD TO CART is rendered by snippets/product-card.liquid
document.addEventListener('DOMContentLoaded', function () {
  var LABEL = 'ADD TO CART';

  function reset(btn) {
    btn.classList.remove('is-picking', 'is-busy');
    btn.textContent = LABEL;
  }

  function add(btn, variantId) {
    btn.classList.remove('is-picking');
    btn.classList.add('is-busy');
    btn.textContent = 'ADDING...';
    agentCartAdd(variantId, 1).then(function () {
      btn.textContent = 'ADDED!';
      // on the cart page the new line has to show up in the list
      if (document.querySelector('.cart-page')) {
        rerenderCartSection().catch(function () { window.location.reload(); });
      }
    }).catch(function (err) {
      console.error('Quick add failed', err);
      btn.textContent = 'TRY AGAIN';
    }).then(function () {
      setTimeout(function () { reset(btn); }, 1500);
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.add-to-cart[data-variants]');
    if (!btn) return;
    e.preventDefault(); // it lives inside the product link
    e.stopPropagation();
    if (btn.classList.contains('is-busy')) return;

    var size = e.target.closest('.quick-size');
    if (size) {
      if (!size.disabled) add(btn, size.getAttribute('data-variant-id'));
      return;
    }

    var variants = JSON.parse(btn.getAttribute('data-variants'));
    var available = variants.filter(function (v) { return v.available; });
    if (!available.length) {
      btn.textContent = 'SOLD OUT';
      setTimeout(function () { reset(btn); }, 1500);
      return;
    }
    if (variants.length === 1) {
      add(btn, variants[0].id);
      return;
    }

    // several sizes: let them pick one right in the bar
    btn.classList.add('is-picking');
    btn.innerHTML = variants.map(function (v) {
      var label = document.createElement('span');
      label.textContent = v.label;
      return '<button type="button" class="quick-size" data-variant-id="' + v.id + '"' + (v.available ? '' : ' disabled') + '>' + label.innerHTML + '</button>';
    }).join('');
  });

  // collapse the size picker when the pointer leaves the product
  document.addEventListener('mouseout', function (e) {
    var column = e.target.closest && e.target.closest('.column');
    if (!column || column.contains(e.relatedTarget)) return;
    var btn = column.querySelector('.add-to-cart.is-picking');
    if (btn) reset(btn);
  });
});

// ---------- cart (Shopify Ajax API) ----------
// Note: window.Shopify belongs to Shopify itself in themes, so nothing here
// is attached to it.

function agentRoot() {
  return (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
}

function updateCartBadge(count) {
  var nodes = document.querySelectorAll('[data-cart-count]');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].textContent = 'Cart' + (count ? ' (' + count + ')' : '');
  }
}

function cartRequest(path, body) {
  return fetch(agentRoot() + path, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: body
  }).then(function (res) {
    return res.json().then(function (json) {
      if (!res.ok) throw new Error(json.description || json.message || 'Request failed');
      return json;
    });
  });
}

function refreshCartBadge() {
  return fetch(agentRoot() + 'cart.js', { headers: { 'Accept': 'application/json' } })
    .then(function (res) { return res.json(); })
    .then(function (cart) { updateCartBadge(cart.item_count); })
    .catch(function () {});
}

function agentCartAdd(variantId, quantity) {
  var body = new FormData();
  body.append('id', variantId);
  body.append('quantity', quantity);
  return cartRequest('cart/add.js', body).then(function (item) {
    refreshCartBadge();
    return item;
  });
}

// Product forms: gallery thumbs, size buttons, quantity stepper, add / checkout.
document.addEventListener('DOMContentLoaded', function () {
  var mainImage = document.querySelector('[data-main-image]');
  var thumbs = document.querySelectorAll('.product-thumb');
  Array.prototype.forEach.call(thumbs, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(thumbs, function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      if (mainImage) {
        mainImage.removeAttribute('srcset');
        mainImage.src = btn.getAttribute('data-src');
      }
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-product-form]'), function (form) {
    var variantInput = form.querySelector('[data-variant-input]');
    var qtyInput = form.querySelector('[data-qty-input]');
    var qtyValue = form.querySelector('[data-qty-value]');
    var msg = form.querySelector('[data-cart-message]');
    var priceBox = document.querySelector('[data-price-box]');
    var sizeButtons = form.querySelectorAll('.size-option');
    var qty = 1;

    function setQty(n) {
      qty = Math.max(1, n);
      qtyValue.textContent = qty;
      qtyInput.value = qty;
    }

    form.querySelector('[data-qty-minus]').addEventListener('click', function () { setQty(qty - 1); });
    form.querySelector('[data-qty-plus]').addEventListener('click', function () { setQty(qty + 1); });

    Array.prototype.forEach.call(sizeButtons, function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        Array.prototype.forEach.call(sizeButtons, function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        variantInput.value = btn.getAttribute('data-variant-id');
        if (priceBox) priceBox.textContent = btn.getAttribute('data-price');
        msg.textContent = '';
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var goToCheckout = e.submitter && e.submitter.hasAttribute('data-checkout');
      msg.textContent = goToCheckout ? 'Preparing checkout...' : 'Adding...';

      agentCartAdd(variantInput.value, qty).then(function () {
        if (goToCheckout) {
          window.location.href = agentRoot() + 'checkout';
          return;
        }
        msg.textContent = 'Added to cart.';
      }).catch(function (err) {
        msg.textContent = (goToCheckout ? 'Could not start checkout: ' : 'Could not add to cart: ') + err.message;
      });
    });
  });
});

// Cart page: re-render just the cart section (Shopify Section Rendering API)
// instead of reloading the page. Resolves false when there is no cart section.
function rerenderCartSection() {
  var section = document.querySelector('.cart-page');
  section = section && section.closest('.shopify-section');
  if (!section) return Promise.resolve(false);
  var id = section.id.replace('shopify-section-', '');
  // no Accept: application/json here, or /cart answers with the cart itself
  return fetch(agentRoot() + 'cart?sections=' + encodeURIComponent(id))
    .then(function (res) { return res.json(); })
    .then(function (json) {
      var doc = new DOMParser().parseFromString(json[id], 'text/html');
      var fresh = doc.getElementById(section.id);
      if (!fresh) throw new Error('No section in response');
      section.classList.add('is-rerendered'); // no rise-in replay
      section.innerHTML = fresh.innerHTML;
      return refreshCartBadge();
    })
    .then(function () { return true; });
}

// Cart page: +/- and remove.
document.addEventListener('click', function (e) {
  var btn = e.target.closest && e.target.closest('[data-cart-change]');
  if (!btn || btn.disabled) return;
  btn.disabled = true;
  var body = new FormData();
  body.append('line', btn.getAttribute('data-cart-change'));
  body.append('quantity', btn.getAttribute('data-quantity'));
  cartRequest('cart/change.js', body).then(rerenderCartSection).catch(function () {
    window.location.reload();
  });
});

// Cookie banner: Shopify's Customer Privacy API decides whether consent is
// needed (e.g. EU visitors) and stores the answer.
document.addEventListener('DOMContentLoaded', function () {
  var banner = document.querySelector('[data-cookie-banner]');
  if (!banner || !window.Shopify || !window.Shopify.loadFeatures) return;

  window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], function (error) {
    if (error) return;
    var privacy = window.Shopify.customerPrivacy;
    if (!privacy || !privacy.shouldShowBanner()) return;

    banner.hidden = false;
    requestAnimationFrame(function () { banner.classList.add('is-visible'); });

    // hide right away; Shopify's callback doesn't always fire (e.g. on a
    // local preview), and the visitor shouldn't wait for it
    function answer(granted) {
      banner.classList.remove('is-visible');
      setTimeout(function () { banner.hidden = true; }, 300);
      try {
        privacy.setTrackingConsent({
          analytics: granted,
          marketing: granted,
          preferences: granted,
          sale_of_data: granted
        }, function () {});
      } catch (e) {
        console.error('Could not save cookie consent', e);
      }
    }

    banner.querySelector('[data-cookie-accept]').addEventListener('click', function () { answer(true); });
    banner.querySelector('[data-cookie-decline]').addEventListener('click', function () { answer(false); });
  });
});

/* ---------- star menu ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var star = document.querySelector('.site-header .star');
  if (!star) return;

  star.removeAttribute('aria-hidden');
  star.setAttribute('role', 'button');
  star.setAttribute('tabindex', '0');
  star.setAttribute('aria-label', 'Open menu');
  star.setAttribute('aria-expanded', 'false');

  var menu = document.createElement('div');
  menu.className = 'star-menu';
  menu.innerHTML =
    '<button type="button" class="star-menu__item" data-star-draw>DRAW UR OWN LOGO!</button>' +
    '<button type="button" class="star-menu__item" data-star-calc>AGENT CALCULATOR</button>' +
    // no upload backend yet: pictures come in by email
    '<a class="star-menu__item" href="mailto:agentissuesparis@gmail.com?subject=Picture%20submission">PICTURE SUBMISSION</a>' +
    '<div class="star-menu__now">' +
    '  <p>PARIS</p>' +
    '  <p data-now-date></p>' +
    '  <p data-now-time></p>' +
    '  <p data-now-temp></p>' +
    '  <div class="star-menu__weather" data-now-icon></div>' +
    '</div>';
  document.body.appendChild(menu);

  var dateEl = menu.querySelector('[data-now-date]');
  var timeEl = menu.querySelector('[data-now-time]');
  var tempEl = menu.querySelector('[data-now-temp]');
  var iconEl = menu.querySelector('[data-now-icon]');
  var clock = null;
  var weatherFetchedAt = 0;

  // Paris time, written out like "Monday, September 14th" / "2:53:32 P.M."
  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function tick() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Paris', weekday: 'long', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    dateEl.textContent = parts.weekday + ', ' + parts.month + ' ' + ordinal(+parts.day);
    timeEl.textContent = parts.hour + ':' + parts.minute + ':' + parts.second + ' ' +
      (parts.dayPeriod === 'PM' ? 'P.M.' : 'A.M.');
  }

  var ICONS = {
    sun: '<svg viewBox="0 0 48 48" width="44" height="44"><circle cx="24" cy="24" r="9" fill="none" stroke-width="3"/>' +
      Array.apply(null, Array(16)).map(function (_, i) {
        var a = i * Math.PI / 8, r1 = i % 2 ? 14 : 13, r2 = i % 2 ? 19 : 23;
        return '<line x1="' + (24 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (24 + Math.sin(a) * r1).toFixed(1) +
          '" x2="' + (24 + Math.cos(a) * r2).toFixed(1) + '" y2="' + (24 + Math.sin(a) * r2).toFixed(1) + '" stroke-width="1.5"/>';
      }).join('') + '</svg>',
    moon: '<svg viewBox="0 0 48 48" width="44" height="44"><path d="M30 8a16 16 0 1 0 10 26A14 14 0 0 1 30 8z" fill="none" stroke-width="3"/></svg>',
    cloud: '<svg viewBox="0 0 48 48" width="44" height="44"><path d="M14 34h21a8 8 0 0 0 0-16 11 11 0 0 0-21-1 8.5 8.5 0 0 0 0 17z" fill="none" stroke-width="3"/></svg>',
    rain: '<svg viewBox="0 0 48 48" width="44" height="44"><path d="M14 28h21a8 8 0 0 0 0-16 11 11 0 0 0-21-1 8.5 8.5 0 0 0 0 17z" fill="none" stroke-width="3"/><path d="M17 33l-2 6M25 33l-2 6M33 33l-2 6" stroke-width="2.5"/></svg>',
    snow: '<svg viewBox="0 0 48 48" width="44" height="44"><path d="M24 6v36M8.4 15l31.2 18M8.4 33l31.2-18" stroke-width="3"/></svg>'
  };

  // open-meteo WMO codes -> one of the icons above
  function iconFor(code, isDay) {
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return ICONS.snow;
    if (code >= 51) return ICONS.rain;
    if (code >= 2) return ICONS.cloud;
    return isDay ? ICONS.sun : ICONS.moon;
  }

  function loadWeather() {
    if (Date.now() - weatherFetchedAt < 10 * 60 * 1000) return;
    weatherFetchedAt = Date.now();
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,weather_code,is_day')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var c = data.current;
        tempEl.textContent = Math.round(c.temperature_2m) + '°';
        iconEl.innerHTML = iconFor(c.weather_code, c.is_day);
      })
      .catch(function (err) {
        weatherFetchedAt = 0;
        console.error('Failed to load Paris weather', err);
      });
  }

  function position() {
    var rect = star.getBoundingClientRect();
    menu.style.top = rect.bottom + 12 + 'px';
    menu.style.right = window.innerWidth - rect.right + 'px';
  }

  function isOpen() { return menu.classList.contains('is-open'); }

  function open() {
    position();
    tick();
    clock = setInterval(tick, 1000);
    loadWeather();
    menu.classList.add('is-open');
    star.classList.add('is-active');
    document.body.classList.add('star-menu-open'); // the DRAW sticker steps aside
    star.setAttribute('aria-expanded', 'true');
  }

  function close() {
    clearInterval(clock);
    menu.classList.remove('is-open');
    star.classList.remove('is-active');
    document.body.classList.remove('star-menu-open');
    star.setAttribute('aria-expanded', 'false');
  }

  star.addEventListener('click', function () { isOpen() ? close() : open(); });
  star.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isOpen() ? close() : open();
    }
  });

  document.addEventListener('click', function (e) {
    if (isOpen() && !menu.contains(e.target) && !star.contains(e.target)) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close();
  });
  window.addEventListener('resize', function () { if (isOpen()) position(); });

  menu.querySelector('[data-star-draw]').addEventListener('click', function () {
    close();
    if (window.agentOpenDrawLogo) window.agentOpenDrawLogo();
  });

  // the calculator is a floating widget: drag it by the title bar, close it
  // with ×, and it follows the visitor from page to page (position, number,
  // pending operation) for the rest of the visit
  var CALC_KEY = 'agentCalc';
  var calc = null;

  function readCalcState() {
    try { return JSON.parse(sessionStorage.getItem(CALC_KEY)) || null; } catch (e) { return null; }
  }

  menu.querySelector('[data-star-calc]').addEventListener('click', function (e) {
    e.stopPropagation(); // don't let the outside-click handler close the calculator we're opening
    close();
    if (!calc) calc = buildCalculator(null);
    calc.open();
  });

  var savedCalc = readCalcState();
  if (savedCalc && savedCalc.open) {
    calc = buildCalculator(savedCalc);
    calc.open();
  }

  function buildCalculator(saved) {
    var KEYS = [
      ['back', '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M20 12H5M11 5l-7 7 7 7" fill="none" stroke-width="2.4"/></svg>'],
      ['clear', 'AC'], ['%', '%'], ['/', '÷'],
      ['7', '7'], ['8', '8'], ['9', '9'], ['*', '×'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['-', '−'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+'],
      ['/', '/'], ['0', '0'], ['.', '.'], ['=', '=']
    ];

    var root = document.createElement('div');
    root.className = 'calc-modal';
    root.innerHTML =
      '<div class="calc" role="dialog" aria-label="Agent calculator">' +
      '  <div class="calc__title">' +
      '    <span class="calc__title-text">AGENT CALCULATOR</span>' +
      '    <button type="button" class="calc__close" aria-label="Close calculator">×</button>' +
      '  </div>' +
      '  <div class="calc__body">' +
      '    <div class="calc__display" aria-live="polite">0</div>' +
      '    <div class="calc__keys">' +
      KEYS.map(function (k) {
        return '<button type="button" class="calc__key" data-key="' + k[0] + '">' + k[1] + '</button>';
      }).join('') +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(root);

    var display = root.querySelector('.calc__display');
    var title = root.querySelector('.calc__title');
    var current = '0';   // what's being typed
    var stored = null;   // left-hand side waiting for an operator
    var op = null;
    var fresh = false;   // next digit starts a new number
    var x = null;
    var y = null;
    var isShown = false;

    if (saved) {
      current = saved.current || '0';
      stored = typeof saved.stored === 'number' ? saved.stored : null;
      op = saved.op || null;
      fresh = !!saved.fresh;
      x = typeof saved.x === 'number' ? saved.x : null;
      y = typeof saved.y === 'number' ? saved.y : null;
      display.textContent = current;
    }

    function save() {
      try {
        sessionStorage.setItem(CALC_KEY, JSON.stringify({
          open: isShown, x: x, y: y, current: current, stored: stored, op: op, fresh: fresh
        }));
      } catch (e) {}
    }

    // keep the whole widget on screen
    function place() {
      var w = root.offsetWidth;
      var h = root.offsetHeight;
      if (x === null || y === null) {
        x = window.innerWidth - w - 40;
        y = Math.max(20, (window.innerHeight - h) / 2);
      }
      x = Math.min(Math.max(0, x), Math.max(0, window.innerWidth - w));
      y = Math.min(Math.max(0, y), Math.max(0, window.innerHeight - h));
      root.style.left = x + 'px';
      root.style.top = y + 'px';
    }

    function format(n) {
      if (!isFinite(n)) return 'ERROR';
      return String(parseFloat(n.toPrecision(12)));
    }

    function apply(a, b, o) {
      if (o === '+') return a + b;
      if (o === '-') return a - b;
      if (o === '*') return a * b;
      if (o === '/') return a / b;
      return b;
    }

    function press(key) {
      if (current === 'ERROR' && key !== 'clear') press('clear');
      if (/^[0-9]$/.test(key)) {
        current = fresh || current === '0' ? key : current + key;
        fresh = false;
      } else if (key === '.') {
        if (fresh) { current = '0'; fresh = false; }
        if (current.indexOf('.') < 0) current += '.';
      } else if (key === 'back') {
        if (!fresh) current = current.length > 1 ? current.slice(0, -1) : '0';
        if (current === '-') current = '0';
      } else if (key === 'clear') {
        current = '0'; stored = null; op = null; fresh = false;
      } else if (key === '%') {
        current = format(parseFloat(current) / 100);
        fresh = true;
      } else if (key === '=') {
        if (op === null) return;
        current = format(apply(stored, parseFloat(current), op));
        stored = null; op = null; fresh = true;
      } else {
        // + - * /: chain onto whatever is pending
        if (op !== null && !fresh) current = format(apply(stored, parseFloat(current), op));
        stored = parseFloat(current);
        op = key;
        fresh = true;
      }
      display.textContent = current;
      save();
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.calc__key');
      if (btn) return press(btn.dataset.key);
    });
    root.querySelector('.calc__close').addEventListener('click', function () { hide(); });

    // drag by the title bar (mouse, pen or finger)
    var drag = null;
    title.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.calc__close')) return;
      drag = { dx: e.clientX - x, dy: e.clientY - y };
      title.setPointerCapture(e.pointerId);
      root.classList.add('is-dragging');
    });
    title.addEventListener('pointermove', function (e) {
      if (!drag) return;
      x = e.clientX - drag.dx;
      y = e.clientY - drag.dy;
      place();
    });
    ['pointerup', 'pointercancel'].forEach(function (type) {
      title.addEventListener(type, function () {
        if (!drag) return;
        drag = null;
        root.classList.remove('is-dragging');
        save();
      });
    });
    window.addEventListener('resize', function () { if (isShown) place(); });

    // typing works while the widget is open, except inside the site's own fields
    function onKey(e) {
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'Escape') return hide();
      var map = { Enter: '=', Backspace: 'back', Delete: 'clear', ',': '.' };
      var key = map[e.key] || e.key;
      if (/^[0-9.%+\-*/=]$/.test(key) || key === 'back' || key === 'clear') {
        e.preventDefault();
        press(key);
      }
    }

    function hide() {
      isShown = false;
      root.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      save();
    }

    return {
      open: function () {
        if (!isShown) document.addEventListener('keydown', onKey);
        isShown = true;
        root.classList.add('is-open');
        place();
        save();
      }
    };
  }
});
