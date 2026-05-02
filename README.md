# Kafeneon Menu — Η ΓΩΝΙΑ

Free-forever QR menu for **Καφενείον Η ΓΩΝΙΑ**. Plain HTML/CSS/JS, no build, no
backend, no monthly fees. Customers scan a QR → see the menu. Update prices by
editing `menu.json` and pushing. That's it.

## Cost: €0 forever

| Thing | Where | Cost |
| --- | --- | --- |
| Hosting | Cloudflare Pages (free tier) | €0 |
| Subdomain | `gonia-menu.pages.dev` (free) | €0 |
| QR code | qr-code-generator.com (free) | €0 |
| Custom domain *(optional)* | e.g. `gonia-menu.gr` | ~€10/year (skip it) |

The free Cloudflare subdomain is good enough — customers don't read URLs after
scanning a QR, they just see the menu.

## Local preview

Open `index.html` in a browser. For accurate `fetch()` of `menu.json`, serve it
via a tiny local server (file:// blocks fetch):

```bash
cd ~/Desktop/stelios/projects/kafeneon-menu
python3 -m http.server 8000
# visit http://localhost:8000
```

## Edit the menu

Open `menu.json`, change items / prices / categories, save. Push to git → site
updates in seconds. Each category has Greek + English names; each item has
`name`, `name_en`, `price`.

```json
{ "name": "Ελληνικός μονός", "name_en": "Greek coffee, single", "price": 1.80 }
```

## Deploy to Cloudflare Pages (free, recommended)

1. Push this folder to a GitHub repo (public or private — both free).
2. Go to <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repo. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
4. Deploy. You'll get `https://kafeneon-menu.pages.dev` (or similar).

Updates: every `git push` redeploys automatically.

### Backup deploy: GitHub Pages (also free)

GitHub repo → **Settings** → **Pages** → Source: `main` / root → Save.
You'll get `https://<username>.github.io/<repo>/`.

## Generate the QR code (free)

1. Go to <https://www.qr-code-generator.com> (or any free generator — no signup).
2. Type: **URL**, paste your Cloudflare Pages URL.
3. Download as **PNG** (high res, for print) or **SVG**.
4. Print on a card. Done.

> Tip: if you ever switch hosts or add a custom domain, **don't** regenerate the
> QR — instead, set your Pages URL to redirect, or buy a domain you control. The
> printed QRs are forever; the destination should be too.

## Files

```
kafeneon-menu/
├── index.html      # markup
├── style.css       # earthy/green kafeneion aesthetic
├── script.js       # loads menu.json, renders, EL/EN toggle, search
├── menu.json       # menu data (edit me)
└── README.md
```

## Why no framework

A menu page is the most boring web page in the world. Plain HTML works in every
browser, requires no build, has no dependencies that can rot, and will still
work in 10 years. Next.js / React would be churn for nothing.
