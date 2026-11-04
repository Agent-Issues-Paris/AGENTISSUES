// Agent Issues: Google Analytics 4 custom pixel.
//
// Paste this whole file into Shopify admin → Settings → Customer events →
// Add custom pixel ("Agent Issues GA4"), replace G-XXXXXXXXXX with the
// Measurement ID from GA4 (Admin → Data streams → Web), set
// Permission: "Required" + "Analytics", then Save and Connect.
//
// It sends the shop's standard events (page views, product views, cart,
// checkout, purchase) and the theme's own agent_* events (ticker, LOOK
// INSIDE, clicks, strip depth, quick add, newsletter...) to one GA4 property.
// Don't also connect GA4 through the Google & YouTube app, or every page
// view and purchase is counted twice.

const GA4_ID = 'G-XXXXXXXXXX';

const script = document.createElement('script');
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
script.async = true;
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag('js', new Date());
// the pixel runs in its own frame: page views are sent by hand below,
// with the shop page's address and title
gtag('config', GA4_ID, { send_page_view: false });

function pageParams(event) {
  const doc = event.context && event.context.document;
  return doc ? {
    page_location: doc.location.href,
    page_referrer: doc.referrer,
    page_title: doc.title
  } : {};
}

function item(variant, quantity) {
  if (!variant) return {};
  return {
    item_id: variant.sku || String(variant.id),
    item_name: variant.product ? variant.product.title : variant.title,
    item_variant: variant.title,
    item_category: variant.product ? variant.product.type : undefined,
    price: variant.price ? variant.price.amount : undefined,
    quantity: quantity || 1
  };
}

function checkoutItems(checkout) {
  return (checkout.lineItems || []).map((line) => item(line.variant, line.quantity));
}

// ---------- standard shop events ----------

analytics.subscribe('page_viewed', (event) => {
  gtag('event', 'page_view', pageParams(event));
});

analytics.subscribe('product_viewed', (event) => {
  const variant = event.data.productVariant;
  gtag('event', 'view_item', {
    ...pageParams(event),
    currency: variant.price.currencyCode,
    value: variant.price.amount,
    items: [item(variant)]
  });
});

analytics.subscribe('collection_viewed', (event) => {
  gtag('event', 'view_item_list', {
    ...pageParams(event),
    item_list_name: event.data.collection.title
  });
});

analytics.subscribe('search_submitted', (event) => {
  gtag('event', 'search', { ...pageParams(event), search_term: event.data.searchResult.query });
});

analytics.subscribe('product_added_to_cart', (event) => {
  const line = event.data.cartLine;
  gtag('event', 'add_to_cart', {
    ...pageParams(event),
    currency: line.cost.totalAmount.currencyCode,
    value: line.cost.totalAmount.amount,
    items: [item(line.merchandise, line.quantity)]
  });
});

analytics.subscribe('cart_viewed', (event) => {
  gtag('event', 'view_cart', pageParams(event));
});

analytics.subscribe('checkout_started', (event) => {
  const checkout = event.data.checkout;
  gtag('event', 'begin_checkout', {
    ...pageParams(event),
    currency: checkout.currencyCode,
    value: checkout.totalPrice.amount,
    items: checkoutItems(checkout)
  });
});

analytics.subscribe('payment_info_submitted', (event) => {
  gtag('event', 'add_payment_info', pageParams(event));
});

analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data.checkout;
  gtag('event', 'purchase', {
    ...pageParams(event),
    transaction_id: checkout.order ? checkout.order.id : checkout.token,
    currency: checkout.currencyCode,
    value: checkout.totalPrice.amount,
    shipping: checkout.shippingLine ? checkout.shippingLine.price.amount : undefined,
    tax: checkout.totalTax ? checkout.totalTax.amount : undefined,
    items: checkoutItems(checkout)
  });
});

// ---------- the theme's own events (assets/theme.js → agentTrack) ----------
// agent_click, agent_ticker_click, agent_look_inside_click, agent_add_to_cart,
// agent_checkout_click, agent_issue_strip_depth, agent_scroll_depth,
// agent_details_open, agent_newsletter_submit, agent_newsletter_subscribed,
// agent_contact_submit, agent_contact_sent, agent_logo_draw_open,
// agent_logo_drawn, agent_cart_pick_click

analytics.subscribe('all_custom_events', (event) => {
  if (!event.name || event.name.indexOf('agent_') !== 0) return;
  gtag('event', event.name, { ...pageParams(event), ...(event.customData || {}) });
});
