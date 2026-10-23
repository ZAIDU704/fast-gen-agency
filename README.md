# FAST GEN — Digital Growth Agency website

A static, mobile-first website: plain HTML, CSS and JavaScript. **No build step, no dependencies, no backend.**
Works on GitHub Pages at a project URL such as `https://YOUR-USERNAME.github.io/fast-gen-agency/` because every path is relative.

## 1. Before you publish (important)
Open `js/config.js` and replace the placeholders:
```js
whatsapp: "91XXXXXXXXXX",   // country code + number, digits only
email: "hello@example.com",
```
Until you do, a yellow setup bar shows on the page and the WhatsApp/Email buttons explain that setup is needed instead of opening a fake destination. Once both are real, the bar disappears and the buttons work.
Prices and copy are plain text in `index.html`; edit them freely.

## 2. Try it on your computer
```bash
cd fast-gen-agency
python3 -m http.server 8000      # then open http://localhost:8000
```
(Opening `index.html` directly also works, but use a server to test like the real site.)

## 3. Publish on GitHub Pages
1. Create a **new, separate** repository named `fast-gen-agency` (not your portfolio repository).
2. Upload/push all files in this folder to the `main` branch (include the hidden `.github` and `.nojekyll`).
3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab; the "Deploy FAST GEN to GitHub Pages" workflow runs on each push. When it finishes, your URL appears there.
   *(Alternative without Actions: Source = "Deploy from a branch", branch `main`, folder `/ (root)`.)*

The base path is not hard-coded, so renaming the repository will not break assets.

## 4. How the character works
See `ASSETS.md`. In short: images give instant look-left/right reactions; videos play only for the welcome wave and the two pointing moments; each state returns to idle; hover (mouse) and tap (touch) both work; reduced-motion users get still poses only.
Pointing: the character points at **Explore Services** first (after a short pause or after the greeting), and at **Contact Here** when the visitor reaches the end of the services section.

## 5. Contact form limits
GitHub Pages is static. The buttons open WhatsApp or the visitor's email app with a prefilled message; nothing is stored or processed on the site.

## 6. Files
`index.html` · `css/styles.css` · `js/config.js` (your details) · `js/assets-manifest.js` · `js/character.js` (character state engine) · `js/main.js` (page logic) · `fonts/` (self-hosted Bricolage Grotesque + Figtree, SIL OFL) · `assets/character/` (your files) · `tests/check.mjs` · `.github/workflows/pages.yml`

## 7. Checks
`npm test` (needs Node 18+) validates file references and exact filename case, the asset manifest, in-page anchors, WhatsApp/mailto URL formats and basic hygiene.
