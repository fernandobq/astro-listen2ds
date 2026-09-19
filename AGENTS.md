# Agent context: astro-listen2ds

Music blog frontend. Posts live in Sanity; this repo builds static HTML and deploys it to Netlify.

## Stack

- Astro 7 + Tailwind 4
- `@sanity/astro` + GROQ for post queries
- `@astrojs/netlify` adapter (static deploy, not SSR)
- Node `>=22.12.0` (see `.nvmrc` for the local pin)

## Rendering model: SSG, not SSR

Astro default `output` is `static`. `astro.config.mjs` does **not** set `output: 'server'` or per-page `prerender = false`.

- Production pages are HTML generated during `astro build`.
- Sanity is queried **only at build time**.
- Publishing in Sanity does not update the live site until Netlify rebuilds.

`useCdn: false` means the **build** talks to the Sanity API directly. It does not make the **site** live.

### Content fetch

- `src/pages/posts/index.astro` — GROQ in frontmatter; latest 12 posts baked into `/posts`.
- `src/pages/posts/[slug].astro` — `getStaticPaths()` fetches every slug, then Astro emits one static page per slug. A new slug has no URL until the next build.

### Dev vs production

- `astro dev` fetches Sanity on each page load, so new entries appear locally without a rebuild.
- Production serves the last build’s files. New posts (especially new slugs) stay invisible until redeploy.

`netlify.toml` is empty: no Sanity → Netlify rebuild webhook.

## Sanity

| | |
|---|---|
| projectId | `4fqkkmt0` |
| dataset | `production` |

IDs are hardcoded in `astro.config.mjs` (no `.env` yet). Studio/schemas are **not** in this repo.

## Key files

| Path | Role |
|---|---|
| `astro.config.mjs` | Tailwind, Sanity client, Netlify adapter |
| `src/pages/posts/index.astro` | Post list |
| `src/pages/posts/[slug].astro` | Post page + `getStaticPaths` |
| `src/pages/index.astro` | Starter home (confetti button) |
| `src/pages/markdown-page.md` | Starter markdown page |
| `netlify.toml` | Empty |

## Convention

If you change how content is fetched, deployed, or rendered, update `AGENTS.md` and `README.md` in the same change.
