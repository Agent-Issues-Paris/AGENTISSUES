if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('introOverlay');
  var video = document.getElementById('introVideo');
  if (!overlay || !video) return;

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

  video.addEventListener('ended', dismiss);
  overlay.addEventListener('click', dismiss);
  video.play().catch(dismiss);
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

document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var THRESHOLD = 40;

  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
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

      var body = new FormData();
      body.append('id', variantInput.value);
      body.append('quantity', qty);

      cartRequest('cart/add.js', body).then(function () {
        if (goToCheckout) {
          window.location.href = agentRoot() + 'checkout';
          return;
        }
        msg.textContent = 'Added to cart.';
        refreshCartBadge();
      }).catch(function (err) {
        msg.textContent = (goToCheckout ? 'Could not start checkout: ' : 'Could not add to cart: ') + err.message;
      });
    });
  });
});

// Cart page: +/- and remove.
document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-cart-change]'), function (btn) {
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var body = new FormData();
      body.append('line', btn.getAttribute('data-cart-change'));
      body.append('quantity', btn.getAttribute('data-quantity'));
      cartRequest('cart/change.js', body).then(function () {
        window.location.reload();
      }).catch(function () {
        btn.disabled = false;
      });
    });
  });
});
