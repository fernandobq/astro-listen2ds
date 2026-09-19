# Listen2ds

Astro frontend for a music blog. Posts are stored in [Sanity](https://www.sanity.io/) and the site is statically generated, then deployed to Netlify.

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

1. Publish or update a post in Sanity Studio (studio is not in this repo).
2. Redeploy on Netlify so `astro build` runs again.

The live site is static HTML from the last build. A new Sanity entry will not appear in production until that rebuild. Local `npm run dev` is different: it refetches Sanity as you browse, so new posts show up immediately.

There is no Sanity → Netlify webhook yet (`netlify.toml` is empty).

## Sanity config

Project and dataset are hardcoded in `astro.config.mjs` (no `.env` yet):

- projectId: `4fqkkmt0`
- dataset: `production`

## Routes

| Path | What it is |
|---|---|
| `/` | Starter home page |
| `/posts` | Post list from Sanity |
| `/posts/[slug]` | Individual post |
| `/markdown-page` | Starter markdown page |
