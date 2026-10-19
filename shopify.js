(function (global) {
  'use strict';

  var SHOPIFY_DOMAIN = 'p0pt9d-ef.myshopify.com';
  var STOREFRONT_TOKEN = 'd9485ffe0f125a404affc706bd5cbc8c';
  var API_VERSION = '2026-10';
  var ENDPOINT = 'https://' + SHOPIFY_DOMAIN + '/api/' + API_VERSION + '/graphql.json';
  var CART_ID_KEY = 'agentCartId';

  function shopifyFetch(query, variables) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query: query, variables: variables || {} })
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      if (json.errors) {
        console.error('Shopify API error', json.errors);
        throw new Error(json.errors.map(function (e) { return e.message; }).join('; '));
      }
      return json.data;
    });
  }

  var PRODUCT_FIELDS =
    'id title handle description ' +
    'priceRange { minVariantPrice { amount currencyCode } } ' +
    'images(first: 10) { edges { node { url altText } } } ' +
    'variants(first: 20) { edges { node { id title availableForSale price { amount currencyCode } selectedOptions { name value } } } }';

  function getCollectionProducts(handle) {
    var query =
      'query CollectionProducts($handle: String!) {' +
      '  collectionByHandle(handle: $handle) {' +
      '    title' +
      '    products(first: 20) { edges { node { ' + PRODUCT_FIELDS + ' } } }' +
      '  }' +
      '}';
    return shopifyFetch(query, { handle: handle }).then(function (data) {
      var collection = data.collectionByHandle;
      if (!collection) return [];
      return collection.products.edges.map(function (e) { return e.node; });
    });
  }

  // every product published to the storefront, newest first
  function getAllProducts() {
    var query =
      'query AllProducts {' +
      '  products(first: 50, sortKey: CREATED_AT, reverse: true) { edges { node { ' + PRODUCT_FIELDS + ' } } }' +
      '}';
    return shopifyFetch(query).then(function (data) {
      return data.products.edges.map(function (e) { return e.node; });
    });
  }

  function getProductByHandle(handle) {
    var query =
      'query ProductByHandle($handle: String!) {' +
      '  productByHandle(handle: $handle) { ' + PRODUCT_FIELDS + ' }' +
      '}';
    return shopifyFetch(query, { handle: handle }).then(function (data) {
      return data.productByHandle;
    });
  }

  function formatMoney(amount, currencyCode) {
    var value = parseFloat(amount);
    var symbol = currencyCode === 'EUR' ? '€' : currencyCode === 'USD' ? '$' : currencyCode === 'GBP' ? '£' : (currencyCode + ' ');
    return symbol + value.toFixed(2);
  }

  // ---------- cart ----------

  var CART_FIELDS =
    'id checkoutUrl totalQuantity ' +
    'cost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } } ' +
    'lines(first: 50) { edges { node { id quantity ' +
    '  merchandise { ... on ProductVariant { id title price { amount currencyCode } image { url altText } product { title handle } } } ' +
    '} } }';

  function getCartId() {
    try {
      return localStorage.getItem(CART_ID_KEY);
    } catch (e) {
      return null;
    }
  }

  function setCartId(id) {
    try {
      localStorage.setItem(CART_ID_KEY, id);
    } catch (e) {}
  }

  function clearCartId() {
    try {
      localStorage.removeItem(CART_ID_KEY);
    } catch (e) {}
  }

  function cartCreate(lines) {
    var query =
      'mutation CartCreate($lines: [CartLineInput!]) {' +
      '  cartCreate(input: { lines: $lines }) {' +
      '    cart { ' + CART_FIELDS + ' }' +
      '    userErrors { field message }' +
      '  }' +
      '}';
    return shopifyFetch(query, { lines: lines || [] }).then(function (data) {
      var result = data.cartCreate;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join('; '));
      }
      setCartId(result.cart.id);
      return result.cart;
    });
  }

  function fetchCart(cartId) {
    var query = 'query GetCart($cartId: ID!) { cart(id: $cartId) { ' + CART_FIELDS + ' } }';
    return shopifyFetch(query, { cartId: cartId }).then(function (data) {
      return data.cart;
    });
  }

  function getOrCreateCart() {
    var cartId = getCartId();
    if (!cartId) return cartCreate([]);
    return fetchCart(cartId).then(function (cart) {
      if (!cart) {
        clearCartId();
        return cartCreate([]);
      }
      return cart;
    });
  }

  function cartLinesAdd(variantId, quantity) {
    return getOrCreateCart().then(function (cart) {
      var query =
        'mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {' +
        '  cartLinesAdd(cartId: $cartId, lines: $lines) {' +
        '    cart { ' + CART_FIELDS + ' }' +
        '    userErrors { field message }' +
        '  }' +
        '}';
      return shopifyFetch(query, {
        cartId: cart.id,
        lines: [{ merchandiseId: variantId, quantity: quantity || 1 }]
      });
    }).then(function (data) {
      var result = data.cartLinesAdd;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join('; '));
      }
      setCartId(result.cart.id);
      updateCartBadge(result.cart);
      return result.cart;
    });
  }

  function cartLinesUpdate(lineId, quantity) {
    var cartId = getCartId();
    var query =
      'mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {' +
      '  cartLinesUpdate(cartId: $cartId, lines: $lines) {' +
      '    cart { ' + CART_FIELDS + ' }' +
      '    userErrors { field message }' +
      '  }' +
      '}';
    return shopifyFetch(query, { cartId: cartId, lines: [{ id: lineId, quantity: quantity }] }).then(function (data) {
      var result = data.cartLinesUpdate;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join('; '));
      }
      updateCartBadge(result.cart);
      return result.cart;
    });
  }

  function cartLinesRemove(lineId) {
    var cartId = getCartId();
    var query =
      'mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {' +
      '  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {' +
      '    cart { ' + CART_FIELDS + ' }' +
      '    userErrors { field message }' +
      '  }' +
      '}';
    return shopifyFetch(query, { cartId: cartId, lineIds: [lineId] }).then(function (data) {
      var result = data.cartLinesRemove;
      if (result.userErrors && result.userErrors.length) {
        throw new Error(result.userErrors.map(function (e) { return e.message; }).join('; '));
      }
      updateCartBadge(result.cart);
      return result.cart;
    });
  }

  function updateCartBadge(cart) {
    var nodes = document.querySelectorAll('[data-cart-count]');
    if (!nodes.length) return;
    var qty = cart ? cart.totalQuantity : 0;
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = 'Cart' + (qty ? ' (' + qty + ')' : '');
    }
  }

  function refreshCartBadge() {
    var cartId = getCartId();
    if (!cartId) {
      updateCartBadge(null);
      return;
    }
    fetchCart(cartId).then(updateCartBadge).catch(function () {});
  }

  global.Shopify = {
    getCollectionProducts: getCollectionProducts,
    getAllProducts: getAllProducts,
    getProductByHandle: getProductByHandle,
    formatMoney: formatMoney,
    getCartId: getCartId,
    getOrCreateCart: getOrCreateCart,
    fetchCart: fetchCart,
    cartLinesAdd: cartLinesAdd,
    cartLinesUpdate: cartLinesUpdate,
    cartLinesRemove: cartLinesRemove,
    updateCartBadge: updateCartBadge,
    refreshCartBadge: refreshCartBadge
  };

  document.addEventListener('DOMContentLoaded', refreshCartBadge);
})(window);
