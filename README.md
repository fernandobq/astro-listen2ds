# Listen2ds

Astro frontend for a music blog. Content is stored in [Sanity](https://www.sanity.io/) and the site is statically generated, then deployed to Netlify.

## Requirements

- Node `>=22.12.0` (this repo pins `v22.14.0` in `.nvmrc`)

```sh
nvm use
npm install
```

## Scripts

```sh
npm run dev      # local server (fetches Sanity on each page load)
npm run build    # static build (queries Sanity once)
npm run preview  # serve the last build locally
```

## Content workflow

1. Publish or update documents in Sanity Studio (studio is not in this repo).
2. Redeploy on Netlify so `astro build` runs again.

The live site is static HTML from the last build. A new Sanity entry will not appear in production until that rebuild. Local `npm run dev` is different: it refetches Sanity as you browse, so new documents show up immediately.

There is no Sanity → Netlify webhook yet (`netlify.toml` is empty).

## Sanity config

Project and dataset are hardcoded in `astro.config.mjs` (no `.env` yet):

- projectId: `4fqkkmt0`
- dataset: `production`
- apiVersion: `2026-09-19`

Queries live in `src/lib/sanity/queries.ts`. The layout fetches the navbar singleton once per page. Home and extra pages render a `pageBuilder` array (hero, rich text, featured posts/albums/artists). Artist, album, and genre detail pages are generated only when `generatePage` is true.

## Routes

| Path | What it is |
|---|---|
| `/` | Home `page` (`_id == "home"`) |
| `/[slug]` | Other CMS pages (not `posts` / `artists` / `albums` / `genres`) |
| `/posts` | Post list (`publishedAt <= now()`, latest 12) |
| `/posts/[slug]` | Individual published post |
| `/artists/[slug]` | Artist page when `generatePage` is true |
| `/albums/[slug]` | Album page when `generatePage` is true |
| `/genres/[slug]` | Genre page when `generatePage` is true |
