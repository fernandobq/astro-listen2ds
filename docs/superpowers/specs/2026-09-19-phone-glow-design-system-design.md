# Phone Glow design system — adoption design

Date: 2026-09-19
Status: approved, pending implementation plan

## Goal

Adopt the "Phone Glow" design system from the Claude Design project
`f32a7878-13b3-4a79-8264-afa0c25ba33e` into `astro-listen2ds`:

1. Encode the system as tokens and a presentational component library.
2. Restyle every existing screen onto it (full migration, not new-only).
3. Leave behind enough documentation that "build me a new page in the
   design system" is an unambiguous request.

## Source

Three files in the design project:

| File | Role |
|---|---|
| `Listen2ds Design System.dc.html` | Source of truth: principles, color, type, layout, components, voice, motion |
| `Listen2ds Screens.dc.html` | Six screens assembled from the kit; adds two components |
| `support.js` | Generated `dc-runtime` renderer. No design content. Ignored. |

Where the two design files disagree, the system file wins. Two known
disagreements, resolved:

- **Page background.** System file: `#13161D`. Screens file canvas:
  `#0E1116`. `#0E1116` is the backdrop *behind* the screen frames in the
  presentation, not a page color. Use `#13161D`.
- **Expanded tracklist row.** System file: `#1D232E`. Screens file:
  `#1A1F29`. Use `#1D232E`, the same value as row hover, so there is one
  "raised row" color rather than two.

## Principles that constrain implementation

Seven principles from the system file. The four with direct
implementation consequences:

- **The glow is the text.** Brightness comes from text against a dim
  room, never an accent color. There is no accent token. Do not add one.
- **One bold move per view.** `Glow` (`#F8FBFF`) appears once per screen.
  In practice: the page title, or the lyric, not both competing.
- **Genre does not restyle the page.** No genre-conditional styling, no
  per-genre palette, no font swap. Genre only ever names a page.
- **The page is a note, not a spread.** Single column, 600px measure,
  left aligned, at every breakpoint. There is no second column to reflow
  into at any width.

The system also explicitly refuses: rounded cards with shadows, tracked
all-caps eyebrows, arrows on links, player chrome or fake embeds,
language flags or an EN|ES switcher, genre-themed palettes.

Interface copy is sentence case. Banned words: discover, explore,
curated, for you, dive in, vibes.

## Token layer

`src/styles/global.css`, Tailwind 4 `@theme`. No config file, no new
build dependencies.

### Color

| Token | Value | Use |
|---|---|---|
| `--color-room` | `#13161D` | Page background. Never pure black. |
| `--color-note` | `#191E27` | Surface a note or row sits on. No shadow. |
| `--color-screen` | `#E6EBF3` | Body text. Cool off-white, not cream. |
| `--color-dim` | `#98A2B1` | Dates, durations, genre, secondary lines. |
| `--color-glow` | `#F8FBFF` | The one brightest thing per view. |
| `--color-link` | `#BFD2EC` | Underlined words in running text. |
| `--color-hairline` | `#242A36` | 1px edges and row separators. |
| `--color-raised` | `#1D232E` | Row hover and expanded tracklist row. |
| `--color-rule` | `#39424F` | The Moment block's left rule. |
| `--color-faint` | `#6C7686` | Track numbers, caption text. |

`#F3F7FF` appears in the design for row titles and nav wordmark — one
step below `Glow`. Add as `--color-bright`.

### Type

Two families, no third:

- `--font-sans`: Fira Sans, weights 300 (body), 400 (meta, row titles),
  500 (titles, wordmark). System fallback `system-ui, sans-serif`.
- `--font-lyric`: Newsreader, italic 300 only. Fallback `Georgia, serif`.
  **Used exclusively for pasted lyrics.** It is not a heading font.

| Role | Spec |
|---|---|
| Title | Fira Sans 500, 30px / 1.25, `-0.01em`, Glow. Drops to 26px below 700px. |
| Body | Fira Sans 300, 17px / 1.65, max 66ch. Same 17px on mobile. |
| Lyric | Newsreader italic 300, 21px / 1.5, 20px indent + left rule. Drops to 20px on mobile. |
| Meta | Fira Sans 400, 15px, Dim. |
| Row title | Fira Sans 400, 20px / 1.3, `#F3F7FF`. |

Measure never exceeds 68ch; body paragraphs cap at 66ch, "why" lines and
Dim prose at 56ch. Body line-height 1.65, titles 1.25. No tracked
capitals anywhere.

Durations use `font-variant-numeric: tabular-nums`.

Diacritics (`á é í ó ú ñ ü ¿ ¡`) are first-class — Fira Sans was chosen
for them. Do not substitute a font that handles them poorly.

### Layout and rhythm

- Content measure 600px, centered as a block; its contents never center.
- Page margin 28px on phones, 40px above 700px.
- Vertical rhythm in multiples of 8: 8, 16, 24, 40, 64, 96.
- Cover art 120–200px square, never a full-width banner.
- Tap targets sit on 44px minimum lines even when they read as plain text.

### Motion

- Response to tap/hover only. **No reveal-on-scroll.**
- Row hover: background to `--color-raised` over 120ms.
- Link hover: underline brightens, no movement.
- Tracklist expand: height and background only, 160ms ease-out.
- At most one load moment: note text settling at 200ms. Nothing else.
- `prefers-reduced-motion: reduce` disables all of it, including load.

## Fonts: delivery

Self-hosted via Fontsource (`@fontsource/fira-sans`,
`@fontsource/newsreader`), imported in `global.css`. Chosen over the
Google Fonts CDN link the design file uses: no third-party
render-blocking request, no layout shift, no external connection for
visitors. Import only the weights listed above.

## Component library

`src/components/ui/` — presentational only. **No Sanity imports, no data
fetching, no `astro-portabletext`.** If a component needs CMS shape, it
belongs one level up.

| Component | Notes |
|---|---|
| `PageShell` | The 600px measure, page margins, vertical rhythm. |
| `Nav` | Wordmark + 3–4 words. Current page: `--color-screen`, no underline. Others: Link, underlined on hover only. |
| `SectionLabel` | One Dim 15px word above a stack ("Lately", "Tracks", "Discos", "Gente"). Sentence case, in the page's language. **Not a heading level.** |
| `CountLine` | "Showing 6 of 12 · Older notes". Dim, at the foot of a stack. Pagination is a sentence, not controls. |
| `Row` | Variants: post (optional 150px 16:9 image), album (52px square), artist (52px circle). Rows share one hairline; they are not individual cards. |
| `Cover` | Square (album/post) and circle (artist — the only circle in the system). Sizes 52/120/140/160/200. Missing state: flat `#1B2029` fill, bottom-left "No cover yet" label, **no icon**. |
| `Moment` | Left rule + 20px indent; timestamp (Dim 15px), lyric, optional "why" (Dim 15px, 56ch). Lyric never centered, never gets quote marks on top of the guillemets. |
| `Lyric` | Newsreader italic. Used inside `Moment` and standalone. |
| `ListenLinks` | Dim "Listen" label + text links. **Text only — no logos, no embeds, no play buttons.** A missing link means the word is simply absent, not disabled. |
| `GenreChips` | Lowercase, Dim, 1px hairline underneath. No fill, no radius, no per-genre color. |
| `Tracklist` | `28px | 1fr | auto` grid: number, title, duration. Rows with a review expand in place. |
| `EmptyState` | A Screen-colored line + a Dim line that offers somewhere else to go. |
| `Prose` | Portable Text container styled to body spec (17px/1.65, 66ch). |

### Tracklist expansion

Native `<details>`/`<summary>`, no JavaScript. Rationale: the site is
static (build-time Sanity only), `<details>` is keyboard-accessible and
screen-reader-correct for free, and the design forbids chevrons anyway,
so the default marker is removed rather than restyled. Expanded row takes
`--color-raised`; the transition is height and background only.

Rows without a review render as a plain grid row, not a collapsed
`<details>`.

## Migrating existing components

`src/components/` stays Sanity-aware and composes `ui/`.

| File | Change |
|---|---|
| `main.astro` | Fonts, `<body>` background/color, `Nav`, `PageShell`. Nav needs current-page awareness (pass `Astro.url.pathname`). |
| `PostCard.astro` | Becomes `Row` variant=post. **Collapses the duplicated linked/unlinked branches** — it currently renders its entire body twice. |
| `ArtistCard.astro` | Becomes `Row` variant=artist, circular cover. Same duplication to collapse. |
| `AlbumCard.astro` | Becomes `Row` variant=album. |
| `GenreChips.astro` | Restyle to the chip spec. |
| `PortableBody.astro` | Swap Tailwind `prose` for `Prose`; the typography plugin's defaults fight the system's measure and color. |
| `SanityImage.astro` | Drop `rounded-xl` at call sites — the system has no radius. |
| `CmsLink.astro` | Link color + underline-offset treatment. |
| `page-builder/Hero.astro` | Becomes the home hero: 26–30px title at 22ch, 17px lede at 56ch, one text link. |

### Hero image

The design's home hero is text only; the current `Hero.astro` renders a
full-measure 16:9 image, which the system forbids ("Cover art ... never
spans the measure as a banner").

Resolution: **the home hero stops rendering `block.image`.** The Sanity
field stays — removing it is a schema change, and out of scope — it is
simply not read by the hero. If a visual is wanted there later, the
system's answer is a 120–200px square beside the text, not a banner.

| `page-builder/Featured*.astro` | `SectionLabel` + a `Row` stack, replacing grid/card layout. |

## Routes

| Route | Screen | Status |
|---|---|---|
| `/` | Home | Exists; restyle |
| `/posts` | Posts index (+ empty state) | Exists; restyle, add empty state |
| `/posts/[slug]` | Recommendation | Exists; restyle; partly blocked — see Content gap |
| `/albums/[slug]` | Album | Exists; restyle + tracklist |
| `/artists/[slug]` | Artist | Exists; restyle |
| `/genres/[slug]` | Genre | Exists; restyle |
| `/albums` | — | **New.** Album row stack. |
| `/artists` | — | **New.** Artist row stack. |

The two new indexes exist because the design's nav is
`notes · albums · artists · about` and those routes would otherwise 404.
They list albums/artists with `generatePage == true`, matching how the
detail routes already filter.

`about` is a CMS `page` document; no new route needed (`[slug].astro`
covers it).

## Content gap

Verified against the deployed schema (`4fqkkmt0`/`production`, workspace
`default`), not the hand-written types.

**Already backed** — build and wire these now:

- `song.trackNumber`, `duration`, `review`, `links` → full tracklist with
  expandable per-track notes and listen links.
- `album.description`, `artist`, `genres`, `tracklist` → album screen.
- `artist.bio`, `genres`, `albums` → artist screen.
- `genre.description`, and albums/artists referencing it → genre screen.

**Not backed.** `post` has only `title, slug, publishedAt, image, body`.
The Recommendation screen additionally wants:

| Design element | Needs |
|---|---|
| Song line — `"Kitchen Light" — Valle & the Night Shift, de <album>` | `post.song` reference → `song` |
| Genre in the meta line | reachable via `post.song->genres` |
| Listen links on a note | reachable via `post.song->links` |
| Moment block (timestamp / lyric / why) | a `moment` block type inside `post.body` Portable Text |
| Artist screen "Notas" section | reverse lookup on `post.song->artist` |

### Approach

Studio schemas are **not in this repo** (`AGENTS.md`), so this change is
not made here and is not deployed from here. Instead:

1. Build `Moment`, `ListenLinks` and the song line as real components.
2. Render them conditionally — absent data renders nothing, never an
   empty shell or a placeholder.
3. Write the queries to request the fields already, guarded so a missing
   `song` reference is a null rather than an error.
4. Document the exact schema patch in `docs/design-system.md` for the
   Studio repo.

The day `post.song` and the `moment` block are added in the Studio, the
song line, genre, listen links and the artist "Notas" section light up
with no frontend change. Until then the post page is title, date, cover,
body and Back to notes — which is a complete, finished-looking screen in
this system, because nothing here depends on a grid being full.

`moment` renders through `astro-portabletext`'s custom block
registration, so it appears inline in the body exactly where the writer
put it.

## Queries

Additive; no existing query changes shape.

- `ALBUM_QUERY` — extend `tracklist[]->` to project `trackNumber`,
  `duration`, `review`, `links`, ordered by `trackNumber`.
- `ARTIST_QUERY` — add albums ordered by `releaseDate desc`; add the
  notes section (returns empty until `post.song` exists).
- `GENRE_QUERY` — add albums and artists stacks.
- New `ALBUMS_QUERY`, `ARTISTS_QUERY` for the index routes.
- `POST_QUERY` — add a guarded `song->` projection.

`types.ts` is updated in step with each query — it is hand-written, with
no TypeGen, so it drifts silently otherwise.

## Voice

Interface strings are rewritten to the system's voice table:

| Use | Not |
|---|---|
| Back to notes | All articles |
| What I've been playing | Curated for you |
| The song moved. Try YouTube for now. | Oops! Something went wrong |
| Put it on and come back | No results found |
| Older notes | Explore the archive |

Section labels and empty states are written in the language of the page
they sit on — the design mixes "Lately"/"Tracks" with "Discos"/"Gente"
deliberately. Bilingual is normal; no flags, no switcher.

## Documentation

- `docs/design-system.md` — token table, component inventory with props,
  the refuses-list, the voice table, and the pending Sanity schema patch.
  This is the file a future "add a new page" request resolves against.
- `AGENTS.md` — a Design system section pointing at it, per that file's
  own convention that rendering changes update it.

## Testing

The repo has no test framework, and adding one is out of scope for this
change. Verification is:

1. `npm run build` succeeds — catches broken queries and types, since
   Sanity is queried at build time.
2. `npm run dev` and visually check each of the six screens against its
   design counterpart, at 390px and desktop.
3. Empty-state checks: a post with no image, an album with no cover, an
   album track with no review, a post with no song reference.
4. Keyboard: tab through nav, rows and tracklist `<details>`.
5. `prefers-reduced-motion` on — confirm nothing animates.

## Out of scope

- Sanity schema changes and Studio work (different repo).
- A test framework.
- The Netlify rebuild webhook (`netlify.toml` is still empty).
- Any `/songs/[slug]` route — the design is explicit that songs live on
  the album page and have no URLs of their own.
