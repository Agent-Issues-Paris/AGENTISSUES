# Analytics

Shopify ignores this folder: it is notes and code to paste into Shopify admin, not part of the theme.

## What goes where

| Tool | What it gives | Cost | How it is connected |
|---|---|---|---|
| Shopify Analytics | Sales, sessions, conversion, top products | Free, built in | Nothing to do |
| Google Analytics 4 | Full funnel, traffic sources, UTM campaigns, the theme's own events | Free | Custom pixel: `custom-pixel.js` |
| Meta pixel (Instagram + Facebook ads) | Ad conversions, retargeting, audiences | Free | Official **Facebook & Instagram** app (Meta pixel + Conversions API) |
| Microsoft Clarity | Heatmaps and session recordings: where people click, how far they scroll the strip | Free | Theme settings → Analytics → Clarity project ID |

All of them respect the cookie banner: Shopify holds pixels back until a visitor allows analytics (GA4, Clarity) or marketing (Meta) cookies.

## 1. Google Analytics 4

1. analytics.google.com → create a property "Agent Issues", time zone Paris, currency EUR → Web data stream for `https://agentissues.net`. Copy the Measurement ID (`G-...`).
2. In the stream settings, turn off "Enhanced measurement → Page changes based on browser history events" (the pixel sends page views itself).
3. Shopify admin → Settings → Customer events → Add custom pixel → name it "Agent Issues GA4".
4. Paste `custom-pixel.js`, replace `G-XXXXXXXXXX`, set Permission to **Required → Analytics**, Data sale: **Data collected does not qualify as data sale**. Save → Connect.
5. Check: open the shop, accept cookies, GA4 → Reports → Realtime. Page views appear within a minute; click the ticker and `agent_ticker_click` shows up.
6. GA4 → Admin → Events: mark `purchase` as a key event; `agent_newsletter_subscribed` too if subscriptions matter.
7. GA4 → Admin → Custom definitions → add event-scoped dimensions for the parameters you want to filter on: `source`, `area`, `label`, `percent`, `page_type`.

Don't also add GA4 through the Google & YouTube app: every page view and purchase would count twice.

## 2. Instagram / Facebook (Meta pixel)

1. Install the free **Facebook & Instagram** app by Meta from the Shopify App Store.
2. Connect the Meta Business account, the Instagram account @agent.issues and a pixel. Choose data sharing **Maximum** (pixel + Conversions API): the server side keeps counting when iPhones block the browser pixel.
3. The app sends page views, product views, add to cart, checkout and purchases to Meta by itself. That is what ads need to optimise.
4. The same app sets up **Instagram Shopping**: tag products in posts and stories, and a Shop tab on the profile. For a magazine that sells through Instagram, that is the most useful part.

## 3. Microsoft Clarity

1. clarity.microsoft.com → New project → `agentissues.net`. Copy the project ID from Settings → Overview (10 characters).
2. Theme editor → Theme settings → Analytics → paste the ID.
3. The theme loads Clarity only after a visitor accepts analytics cookies, and never inside the theme editor.

## The theme's own events

`assets/theme.js` publishes these through `Shopify.analytics.publish`. The pixel forwards everything that starts with `agent_`.

| Event | When | Data |
|---|---|---|
| `agent_click` | Any click on a link or button | `label`, `href`, `area` (header, section, product_box…), `page_type` |
| `agent_ticker_click` | Click on the running line | `href`, `page_type` |
| `agent_look_inside_click` | Click on the cover in the home hero | `href` |
| `agent_add_to_cart` | Added to cart | `source`: `quick_add` (grid), `home_hero`, `issue_page`, `product_page`; `variant_id`, `quantity` |
| `agent_checkout_click` | CHECKOUT pressed (adds the item, goes straight to payment) | same as above |
| `agent_issue_strip_depth` | Scrolling the strip on an issue page | `percent`: 25 / 50 / 75 / 100 of one full loop |
| `agent_scroll_depth` | Scrolling any other page | `percent`, `page_type` |
| `agent_details_open` | A row opened: product box, Q&A, contributors, size guide | `label`, `area` |
| `agent_newsletter_submit` / `agent_newsletter_subscribed` | Subscribe pressed / thank-you shown | `area` / `page_type` |
| `agent_contact_submit` / `agent_contact_sent` | Contact form sent / thank-you shown | |
| `agent_logo_draw_open` / `agent_logo_drawn` | DRAW UR OWN LOGO opened / a logo saved | |
| `agent_cart_pick_click` | Click on "You might also like" in the cart | `label`, `href` |

Quick add vs product page: in GA4 → Explore → Free form, rows `source`, values Event count, filter Event name = `agent_add_to_cart`.

## UTM links for Instagram

Every link you put out gets `utm_source`, `utm_medium` and `utm_campaign`, lower case, words joined by `_`. GA4 then shows which post or story sold.

| Where | Link |
|---|---|
| Link in bio | `https://agentissues.net/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Story with a link sticker | `https://agentissues.net/products/<handle>?utm_source=instagram&utm_medium=story&utm_campaign=issue02_preorder&utm_content=story_0612` |
| Post / reel caption or comment | `...?utm_source=instagram&utm_medium=social&utm_campaign=issue02_preorder&utm_content=reel_cover` |
| Contributor reposts | `...?utm_source=instagram&utm_medium=referral&utm_campaign=issue02_preorder&utm_content=<contributor_handle>` |
| Paid ads (Meta Ads Manager) | `utm_source=instagram&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}` |
| Newsletter (Shopify Email) | `utm_source=newsletter&utm_medium=email&utm_campaign=<letter_name>` |
| Stockists' websites | `utm_source=<shop_name>&utm_medium=referral&utm_campaign=stockist` |

`utm_campaign` names one push (`issue02_preorder`, `issue02_launch`, `tee_drop`); `utm_content` tells apart the posts and stories inside it. Keep a list of the links you made in the texts sheet, next to the posts.

Instagram shortens links in stories but keeps the parameters; links in bio work the same with Linktree or similar.
