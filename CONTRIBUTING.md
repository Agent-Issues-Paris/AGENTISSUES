# Working on the Agent Issues theme

This branch (`shopify-theme`) is the source of truth for the Agent Issues shop. The static site on `gh-pages` is frozen; new features and fixes go here.

## How the branches map to Shopify

- `shopify-theme` is connected to the unpublished theme **AGENTISSUES/shopify-theme** in Shopify admin. Every push to it updates that theme within about a minute.
- `shopify-theme-test` is connected to **AGENTISSUES/shopify-theme-test**. Changes go there first; once Ilya has checked its preview, open a PR `shopify-theme-test` → `shopify-theme`.
- The live store still runs Shopify's default theme. This theme gets published only once it has been finished and tested.
- The connection is two-way: changes made in the Shopify theme editor (texts, images, settings) are committed back to the branch by Shopify. **Always pull before you push.**

## Making a change

1. Pull the latest: `git pull origin shopify-theme`.
2. Create a branch for the change: `git switch -c feature/<short-name>` (or `fix/<short-name>`).
3. Work against a local preview (below) until it looks right.
4. Push the branch and open a PR into `shopify-theme`. Describe what changed and how you checked it.
5. Someone else looks at it (a preview link helps, below), then it gets merged.
6. Don't push straight to `shopify-theme`.

## Previews

### Local, while you work

```bash
npm install -g @shopify/cli
shopify theme dev --store p0pt9d-ef.myshopify.com
```

The first run asks you to log in to Shopify in the browser (you need staff access to the store). Then open http://127.0.0.1:9292. It shows real products, cart and prices, and reloads as you save files. Stop it with Ctrl-C.

### A link to share, for review

1. Push your branch to GitHub.
2. Shopify admin → Online Store → Themes → Add theme → Connect from GitHub → pick your branch.
3. Shopify creates a separate unpublished theme for that branch. Its **Preview** link opens without a login and updates on every push.
4. When the PR is merged, remove that theme from the theme library.

### Leaving comments on a preview

Preview themes (never the published one) load the [Agentation](https://www.agentation.com) toolbar in the bottom-right corner: click any element and leave a note. Notes go to a local server, so run it on the machine where the notes should be read:

```bash
AGENTATION_CORS_ORIGINS=http://127.0.0.1:9292,https://p0pt9d-ef.myshopify.com npx -y agentation-mcp@1.3.2 server
```

## Things to keep in mind

- **Every preview talks to the real store.** An order placed in a preview is a real order unless payments are in test mode.
- Check the theme before opening a PR: `shopify theme check`.
- **Test checkout on a Shopify preview link, not on 127.0.0.1.** The local CLI server proxies checkout badly: the checkout page stays blank, and a redirect through `/cart/add` can crash it ("Theme ID mismatch").
- **The GitHub sync can skip a push.** On 2026-10-27 a CSS-only commit never reached the connected theme while later commits did. If a preview doesn't show a change after a few minutes, compare the theme's `styles.css` / `theme.js` with the branch; the next push of that file brings it up to date.
- Where things live: layout and header in `layout/` and `sections/header.liquid`, page sections in `sections/`, page setup in `templates/*.json`, behaviour in `assets/theme.js`, styles in `assets/styles.css`. See `README.md` for the page map and one-time admin setup.
