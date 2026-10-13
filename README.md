# Textout:) website

Static site (plain HTML + CSS). No build step.

## Files
- `index.html`: home / about page
- `support.html`: Support URL for App Store Connect
- `style.css`: shared styles
- `CNAME`: custom domain for GitHub Pages
- `assets/`: phone screenshots (home, dailies, theme-*, customize, post-cyan, event-*, create-host, chat-hangout, discover-orange), `logo.png` (nav) and `icon.png` (browser tab)

Phones are drawn with CSS as iPhones, so the screenshots must be plain app screens without a device frame. To swap a screenshot, replace the file in `assets/` keeping the same name and a 720x1487 size.

The Privacy Policy and Terms live on their own page, so the site links to them:
https://sreeharinambiar.github.io/textout-privacy-policy/

## Before publishing
Replace the `#` in the "Download on the App Store" buttons in `index.html` with your App Store link once the app is live.

## Deploy on GitHub Pages
1. Create a new GitHub repo, e.g. `textout-site`, and upload everything in this folder (including `assets/`).
2. Repo > Settings > Pages > Source: "Deploy from a branch" > Branch: `main`, folder `/ (root)` > Save.
3. Settings > Pages > Custom domain: `www.textout.in`, then tick "Enforce HTTPS" once available.
4. At your domain registrar, add DNS records:
   - `CNAME` record: host `www` pointing to `<your-github-username>.github.io`
   - Optional apex (`textout.in`) `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
5. Wait for DNS (minutes to a few hours), then open:
   - https://www.textout.in
   - https://www.textout.in/support.html

## App Store Connect
- Support URL: `https://www.textout.in/support.html`
- Privacy Policy URL: `https://sreeharinambiar.github.io/textout-privacy-policy/`
- Marketing URL (optional): `https://www.textout.in`
