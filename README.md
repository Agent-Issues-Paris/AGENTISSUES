# Agent Issues — Shopify theme

The Agent Issues shop as a native Shopify (Online Store 2.0) theme. It started as a port of the static site on the `gh-pages` branch, which is now frozen; this branch is the default branch and the source of truth. Pages are rendered by Shopify, so link previews, SEO, Shopify apps and analytics all work.

How to make changes, run previews and open PRs: see [CONTRIBUTING.md](CONTRIBUTING.md).

## Page map

| Old file | Shopify URL | Template |
|---|---|---|
| `index.html` | `/` | `templates/index.json` (collection `frontpage`) |
| `shop.html` | `/collections/shop` | `templates/collection.json` |
| `product.html?handle=…` | `/products/<handle>` | `templates/product.json` |
| `issue1.html` | `/products/aagent-issue-01-…` | `templates/product.issue.json` |
| `cart.html` | `/cart` | `templates/cart.json` |
| `about.html` | `/pages/about` | `templates/page.about.json` |

`shopify.js` (Storefront API client) is gone: product data comes from Liquid, and the cart uses Shopify's own cart (`/cart/add.js`, `/cart/change.js`). Everything else from `script.js` (intro reel, endless issue strip, header scroll) lives in `assets/theme.js`.

## One-time setup in Shopify admin

1. **Sales channels → Online Store** must be enabled.
2. **Theme is connected to GitHub:** the Shopify GitHub app is installed on the `Agent-Issues-Paris` org, and the `shopify-theme` branch is linked to the unpublished theme "AGENTISSUES/shopify-theme". Pushes to the branch update the theme; edits in the theme editor are committed back to the branch by Shopify, so pull before you push.
3. Magazine issues get the endless-strip layout automatically when listed in Theme settings → Issues (Issue 1 is preselected).
4. **Online Store → Pages → Add page** titled "About" (handle `about`), template `page.about`.
5. **Settings → Customer privacy → Cookie banner:** turn off Shopify's own banner. The theme shows its own (Theme settings → Cookie banner), wired to Shopify's Customer Privacy API.
6. **Settings → Policies:** fill in refund, privacy, terms and shipping. They are linked from the POLICIES box and render inside the site frame.
7. Preview the theme. All texts (About, Contact, Stockist, issue description, credits, strip images) are editable in the theme editor.

## Local development

```bash
npm install -g @shopify/cli
shopify theme dev --store p0pt9d-ef.myshopify.com   # live-reload preview with real products
shopify theme check                                  # lint
```

## Workflow

- `main` = the theme that is (or will be) live. Don't push to it directly; open a PR.
- With the Shopify ↔ GitHub integration, any branch can be connected to its own unpublished theme for a shareable preview link. That's the place to try things.
