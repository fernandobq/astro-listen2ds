# Agent context: astro-listen2ds

Music blog frontend. Content lives in Sanity; this repo builds static HTML and deploys it to Netlify.

## Stack

- Astro 7 + Tailwind 4
- `@sanity/astro` + GROQ (`src/lib/sanity/queries.ts`)
- `@astrojs/netlify` adapter (static deploy, not SSR)
- Node `>=22.12.0` (see `.nvmrc` for the local pin)

## Rendering model: SSG, not SSR

Astro default `output` is `static`. `astro.config.mjs` does **not** set `output: 'server'` or per-page `prerender = false`.

- Production pages are HTML generated during `astro build`.
- Sanity is queried **only at build time**.
- Publishing in Sanity does not update the live site until Netlify rebuilds.

`useCdn: false` means the **build** talks to the Sanity API directly. It does not make the **site** live.

### Content fetch

Queries live in `src/lib/sanity/queries.ts` and are imported by pages (including inside `getStaticPaths`). Types are hand-written in `src/lib/sanity/types.ts` (no TypeGen).

- `src/layouts/main.astro` — navbar singleton `_id == "navbar"` baked into every page
- `src/pages/index.astro` — home `page` document `_id == "home"`; renders `pageBuilder`
- `src/pages/[slug].astro` — other `page` documents; excludes home and reserved slugs (`posts`, `artists`, `albums`, `genres`)
- `src/pages/posts/index.astro` — latest 12 posts with `publishedAt <= now()`
- `src/pages/posts/[slug].astro` — published posts only
- `src/pages/artists/[slug].astro` — artists with `generatePage == true`
- `src/pages/albums/[slug].astro` — albums with `generatePage == true`
- `src/pages/genres/[slug].astro` — genres with `generatePage == true`

There are no `/songs/[slug]` routes and no artist/album/genre listing indexes. Artist/album cards link to a detail page only when `generatePage` is true.

A new slug (or a newly enabled `generatePage` flag) has no URL until the next build.

### Dev vs production

- `astro dev` fetches Sanity on each page load, so new entries appear locally without a rebuild.
- Production serves the last build’s files. New documents (especially new slugs) stay invisible until redeploy.

`netlify.toml` is empty: no Sanity → Netlify rebuild webhook.

## Sanity

| | |
|---|---|
| projectId | `4fqkkmt0` |
| dataset | `production` |
| apiVersion | `2026-09-19` |

IDs and apiVersion are hardcoded in `astro.config.mjs` (no `.env` yet). Studio/schemas are **not** in this repo.

## Key files

| Path | Role |
|---|---|
| `astro.config.mjs` | Tailwind, Sanity client, Netlify adapter |
| `src/lib/sanity/queries.ts` | GROQ queries |
| `src/lib/sanity/types.ts` | Hand-written CMS types |
| `src/layouts/main.astro` | Site shell + navbar |
| `src/components/page-builder/` | Home/extra-page blocks |
| `src/pages/index.astro` | Sanity home |
| `src/pages/[slug].astro` | Extra CMS pages |
| `src/pages/posts/` | Post list + post pages |
| `src/pages/artists/[slug].astro` | Artist pages (`generatePage`) |
| `src/pages/albums/[slug].astro` | Album pages (`generatePage`) |
| `src/pages/genres/[slug].astro` | Genre pages (`generatePage`) |
| `netlify.toml` | Empty |
| `src/components/ui/` | Presentational design-system components; no Sanity imports |
| `docs/design-system.md` | Token and component reference |

## Design system

The site is built on the "Phone Glow" design system. Tokens live in
`src/styles/global.css` (`@theme`); presentational components live in
`src/components/ui/` and must not import Sanity.

**Read `docs/design-system.md` before building a new page or component.**
It carries the tokens, the component inventory (with real prop
signatures and known traps), the voice rules, and the list of things the
system refuses.

Short version: dark single column, 600px measure, left aligned at every
width. Two fonts — Fira Sans, and Newsreader Variable italic for lyrics
only. No accent color, no radius, no shadow, no reveal-on-scroll.
Sentence case everywhere.

## Convention

If you change how content is fetched, deployed, or rendered, update `AGENTS.md` and `README.md` in the same change.
