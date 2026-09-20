# Phone Glow design system reference

This is the file a "build me a new page in this design system" request
resolves against. It documents what actually shipped — every prop
signature here was read from the component source in `src/components/`,
not from the implementation plan. Where an earlier draft of the plan
disagreed with the code, the code is what is documented.

Presentational components live in `src/components/ui/` and must not
import Sanity, fetch data, or use `astro-portabletext`. Sanity-aware
components live one level up in `src/components/` and compose `ui/`.

## 1. Tokens

All defined in `src/styles/global.css` under `@theme`. Tailwind 4
generates the utility name from the token name automatically.

### Color

| Token | Value | Utility | Use |
|---|---|---|---|
| `--color-room` | `#13161D` | `bg-room` | Page background. Never pure black. |
| `--color-note` | `#191E27` | `bg-note` | Reserved for a raised surface; unused so far — rows sit directly on Room and share hairlines. |
| `--color-screen` | `#E6EBF3` | `text-screen` | Body text. Cool off-white, not cream. |
| `--color-dim` | `#98A2B1` | `text-dim` | Dates, durations, genre, secondary lines. |
| `--color-glow` | `#F8FBFF` | `text-glow` | The one brightest thing per view — page title, or the lyric, never both. |
| `--color-link` | `#BFD2EC` | `text-link` | Underlined words in running text. |
| `--color-link-hover` | `#EAF1FB` | `text-link-hover` | Link hover state. |
| `--color-bright` | `#F3F7FF` | `text-bright` | Row titles, nav wordmark. One step below Glow. |
| `--color-hairline` | `#242A36` | `border-hairline` | 1px edges and row separators. |
| `--color-raised` | `#1D232E` | `bg-raised` | Row hover and expanded tracklist row — one "raised row" color, not two. |
| `--color-rule` | `#39424F` | `border-rule` | The Moment block's left rule. |
| `--color-faint` | `#6C7686` | `text-faint` | Track numbers, caption text. |
| `--color-cover-fallback` | `#1B2029` | `bg-cover-fallback` | Missing-cover fill. |

**Trap:** `--color-cover-fallback` is named that way on purpose. `bg-cover`
is already a Tailwind utility (`background-size: cover`), so the cover
placeholder color could not be called `--color-cover` without colliding
with it.

There is no accent token. Do not add one — brightness comes from text
against a dim room, not from a color.

### Type

Two families only:

- `--font-sans`: `"Fira Sans", system-ui, sans-serif` — weights 300
  (body), 400 (meta, row titles), 500 (titles, wordmark).
- `--font-lyric`: `"Newsreader Variable", Georgia, serif` — italic 300
  only, used exclusively for pasted lyrics. Never a heading font.

**Trap:** the family name is `'Newsreader Variable'`, not `'Newsreader'`.
The Fontsource *variable* package (`@fontsource-variable/newsreader`)
registers the family under that suffixed name. Reference `'Newsreader'`
and the browser silently falls back to Georgia — no error, just a
slightly-off serif that's easy to miss in review.

| Scale token | Utility | Size / line-height | Use |
|---|---|---|---|
| `--text-title` | `text-title` | 30px / 1.25, `-0.01em` | Page title (desktop / ≥ sm). |
| `--text-title-sm` | `text-title-sm` | 26px / 1.28, `-0.01em` | Page title on mobile. |
| `--text-row` | `text-row` | 20px / 1.3 | Post row title. |
| `--text-body` | `text-body` | 17px / 1.65 | Body copy, same size on mobile. |
| `--text-lyric` | `text-lyric` | 21px / 1.5 | Lyric, standalone or in a Moment. |
| `--text-lyric-sm` | `text-lyric-sm` | 20px / 1.5 | Lyric on mobile. |
| `--text-meta` | `text-meta` | 15px / 1.5 | Dates, durations, dim secondary lines. |
| `--text-caption` | `text-caption` | 14px / 1.5 | Cover placeholder label, captions. |

The one measure: `--container-measure` → `max-w-measure` (600px).

Measure caps: body paragraphs 66ch, Dim prose / "why" lines 56ch (with
one deliberate exception — see `EmptyState` below), hero title 22ch.
Never exceed 68ch anywhere. No tracked capitals anywhere.

## 2. Rhythm mapping

Vertical rhythm is always a multiple of 8px, expressed as Tailwind `gap-*`:

| px | Tailwind |
|---|---|
| 8 | `gap-2` |
| 16 | `gap-4` |
| 24 | `gap-6` |
| 40 | `gap-10` |
| 64 | `gap-16` |
| 96 | `gap-24` |

Page margin is 28px on phones, 40px above 700px (`PageShell`'s
`px-7 sm:px-10`).

## 3. Component inventory

### `src/components/ui/` — presentational, no Sanity

#### `PageShell.astro`

```ts
interface Props {
  class?: string;
}
```

Renders `<main class="mx-auto flex w-full max-w-measure flex-col px-7 py-10 sm:px-10">`.

**Trap:** `PageShell` sets no `gap` on purpose. Callers own the vertical
rhythm by passing a `gap-*` class through `class`. Two competing gap
utilities on the same element resolve by CSS source order, not by
`class:list` array order, so a shell-level default gap would be a trap
for any caller trying to override it — leaving it out avoids the whole
problem.

#### `Nav.astro`

```ts
interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}
interface Props {
  items: NavItem[];
  pathname: string;
}
```

Wordmark ("Listen2ds") plus nav words. Pass `Astro.url.pathname` for
`pathname`. Current page renders as plain Screen-colored text with no
underline; other items are links, underlined on hover only. `"/posts"`
also matches `"/posts/anything"` via `startsWith`; `"/"` only matches
exactly.

#### `Cover.astro`

```ts
interface Props {
  shape?: "square" | "circle";
  size: 52 | 120 | 140 | 160 | 200;
  class?: string;
}
```

Square or circle (circle is the only circle in the system — used for the
artist row/hero only). Missing-cover state: flat `bg-cover-fallback`
fill, bottom-left "No cover yet" caption, no icon.

**TRAP — read before using any component with a content slot:**
`Astro.slots.has("default")` (or any named slot) returns `true` as soon
as a slot has *any* markup passed to it, even if that markup evaluates to
nothing at render time — for example `{condition && <SanityImage />}`
where `condition` is false. A runtime `&&` guard inside the slot's
children does **not** make `Astro.slots.has()` report `false`. `Cover`
decides whether to render its own content or its "No cover yet" fallback
based on `Astro.slots.has("default")`, so passing a conditionally-empty
child produces an empty box instead of the fallback message.

The two correct patterns, both used in this codebase:

1. **Branch outside the component**, passing either a fully-populated
   slot or no slot at all:

   ```astro
   {album.coverImage ? (
     <Cover slot="cover" size={52}>
       <SanityImage image={album.coverImage} ... />
     </Cover>
   ) : (
     <Cover slot="cover" size={52} />
   )}
   ```

   (`AlbumCard.astro`, `ArtistCard.astro`.)

2. **Make the slot name itself conditional**, so the parent's
   `Astro.slots.has("<name>")` check sees no slot at all when there's no
   content:

   ```astro
   <div slot={post.image ? "cover" : undefined} class="aspect-video ...">
     {post.image && <SanityImage image={post.image} ... />}
   </div>
   ```

   (`PostCard.astro`, feeding `Row`'s `hasCover` check.)

This was discovered twice during migration: once as an empty `Cover` box
where "No cover yet" belonged, and once as a permanent blank 150px
gutter on every image-less post row inside `Row` — fixed by pattern 2.

#### `SectionLabel.astro`

No props — just a slot. One Dim 15px word above a stack ("Lately",
"Tracks", "Discos", "Gente"). Not a heading level. Written in the
language of the page it sits on (see Voice, below).

#### `CountLine.astro`

```ts
interface Props {
  shown: number;
  total: number;
  href?: string;
  label?: string; // default "Older notes"
}
```

Renders "Showing {shown} of {total} · {label}" — pagination as a
sentence, not controls.

#### `EmptyState.astro`

```ts
interface Props {
  line: string;
}
```

A Screen-colored line, plus an optional Dim line (default slot) that
offers somewhere else to go.

**Deliberate exception, do not "fix":** the Dim line here caps at
**52ch**, not the 56ch used for Dim prose / "why" lines elsewhere
(`Moment`'s "why" line, e.g.). This matches the screens design file's
drawn width for this specific element. It is a per-element exception,
not an inconsistency.

#### `Stack.astro`

No props. `<div class="flex flex-col border-t border-hairline">` around
a slot — a hairline-shared row container. Pair with `SectionLabel` and a
list of `Row`-based cards (`PostCard`, `AlbumCard`, `ArtistCard`).

#### `Row.astro`

```ts
interface Props {
  variant: "post" | "album" | "artist";
  href?: string | null;
  title: string;
  meta?: string | null;
}
```

Named slot `cover`. Renders `<a>` when `href` is set, else `<div>`
(unlinked row). `variant="post"` puts an optional 150px 16:9 cover on
the **right**; `album`/`artist` put a 52px cover on the **left**. Rows
share one hairline (`border-b`); they are not individual cards — no
radius, no shadow, no per-row surface. Hover: background to `raised`
over 120ms (only when `href` is set).

Uses `Astro.slots.has("cover")` internally — see the `Cover` slot trap
above; `Row`'s consumers (`PostCard`, `AlbumCard`, `ArtistCard`) must use
one of the two safe patterns.

#### `Lyric.astro`

```ts
interface Props {
  size?: "default" | "small"; // default "default"
}
```

Newsreader Variable italic 300, `text-lyric` (21px) or `text-lyric-sm`
(20px). Used inside `Moment` and standalone.

#### `Moment.astro`

```ts
interface Props {
  timestamp?: string | null;
  lyric?: string | null;
  why?: string | null;
}
```

Left rule (`border-rule`) + 20px indent (`pl-5`). Renders nothing at all
if all three props are empty/falsy. `lyric` renders through `Lyric`;
`why` is Dim, capped at 56ch (the normal Dim-prose cap — `EmptyState` is
the one exception, not this component).

The lyric convention: guillemets with a slash for the line break, e.g.
`«No enciendas la sala / déjala a oscuras»`. `Moment`/`Lyric` never add
quotation marks on top of the guillemets — write them into the content
itself.

#### `ListenLinks.astro`

```ts
interface Props {
  links?: {
    spotify?: string | null;
    youtube?: string | null;
    appleMusic?: string | null;
  } | null;
  label?: string;        // default "Listen"
  size?: "default" | "small"; // default "default"
}
```

Dim "Listen" label + text-only links (Spotify / YouTube / Apple Music,
in that order) — no logos, no embeds, no play buttons. A missing link is
simply absent, never a disabled/greyed-out entry. Renders nothing if no
link is present.

#### `Chips.astro`

```ts
interface Props {
  items: Array<{ name: string; href?: string | null }>;
}
```

Lowercase (`.toLowerCase()` applied in the component), Dim, 1px hairline
underneath each chip. No fill, no radius, no per-genre color. Renders
nothing if `items` is empty. `GenreChips.astro` (one level up) is the
Sanity-aware wrapper that builds `items` from a genre reference array.

#### `Prose.astro`

```ts
interface Props {
  class?: string;
}
```

Portable Text container styled to the body spec (17px/1.65, `p` capped
at 66ch, `h2`/`h3` sized to `title-sm`/`row`, list styles). This
replaces Tailwind's `@tailwindcss/typography` `prose` class at call
sites — the plugin's own defaults fight the system's measure and colors.

#### `Tracklist.astro`

```ts
interface Track {
  _id: string;
  title: string;
  trackNumber?: number | null;
  duration?: string | null;
  hasReview: boolean;
  links?: {
    spotify?: string | null;
    youtube?: string | null;
    appleMusic?: string | null;
  } | null;
  noteHref?: string | null;
  review?: unknown;
}
interface Props {
  tracks: Track[];
  ReviewRenderer?: any;
}
```

`28px | 1fr | auto` grid: number, title, duration (`tabular-nums`). A
track with `hasReview: true` renders as a native `<details>`/`<summary>`
that expands in place to show the review body, `ListenLinks`, and an
optional "The note about this one" link (via `noteHref`); a track
without a review renders as a plain (non-expandable) grid row. No
JavaScript — `<details>` gives keyboard/screen-reader behavior for free,
and the system forbids chevrons anyway, so the default marker is simply
hidden (`summary::-webkit-details-marker { display: none }`). Expanded
row takes `bg-raised`; transition is height/background only, 160ms
ease-out.

**TRAP — the single most expensive thing found in this migration:**
Astro does **not** support a dynamically-named slot inside a `.map()`.
Something like:

```astro
{tracks.map((track) => (
  <Fragment slot={`review-${track._id}`}>{track.review}</Fragment>
))}
```

throws `ReferenceError: track is not defined` **at build**, even when
the slot's children are a static string — it is the slot-name template
expression itself that Astro hoists out of the closure's scope, not the
children. `astro check` does not catch this; it only fails at
`astro build`.

The working pattern, used here: don't route per-track content through a
slot at all. Pass a **component reference as a prop** (`ReviewRenderer`)
and call it inside the loop with the per-track value as a normal prop:

```astro
<Tracklist tracks={tracks} ReviewRenderer={PortableBody} />
```

```astro
<!-- inside Tracklist.astro -->
{ReviewRenderer && track.review ? (
  <ReviewRenderer value={track.review} />
) : null}
```

(See `src/pages/albums/[slug].astro` for the call site.) If a future
component needs to render different per-item content inside a `.map()`,
reach for this pattern, not a dynamic slot name.

### `src/components/` — Sanity-aware wrappers around `ui/`

#### `PortableBody.astro`

```ts
interface Props {
  value?: PortableTextValue | null;
}
```

Wraps `astro-portabletext`'s `<PortableText>` in `Prose`. Registers the
custom `moment` block type against `MomentBlock`. Renders nothing for an
empty/absent value.

#### `MomentBlock.astro`

```ts
interface Props {
  node: {
    timestamp?: string | null;
    lyric?: string | null;
    why?: string | null;
  };
}
```

**TRAP:** `astro-portabletext` passes a custom type component the raw
Portable Text block as `node`, **flat, with no `.value` wrapper**. A
`moment` block arrives as
`{ _type: "moment", _key, timestamp, lyric, why }`, so `MomentBlock`
reads `node.timestamp`, `node.lyric`, `node.why` directly — not
`node.value.timestamp`. An earlier draft of the implementation plan
assumed a `.value` wrapper (matching the convention for `PortableText`'s
built-in mark components); had that shipped, `moment` blocks would have
silently rendered nothing forever, with no error anywhere. Renders `ui/Moment`.

#### `PostCard.astro`

```ts
interface Props {
  post: PostCardData;
}
```

`Row variant="post"`. Cover slot is conditional via the slot-name
pattern above (`slot={post.image ? "cover" : undefined}`), not a
runtime `&&` guard. Date is formatted with `Intl`/`toLocaleDateString`
against the `"es"` locale.

#### `AlbumCard.astro`

```ts
interface Props {
  album: AlbumCardData;
}
```

`Row variant="album"`, 52px square `Cover`. Link only when
`album.generatePage && album.slug`. Cover slot uses the branch-outside
pattern (ternary rendering either a filled or empty `Cover`).

#### `ArtistCard.astro`

```ts
interface Props {
  artist: ArtistCardData;
}
```

`Row variant="artist"`, 52px **circle** `Cover` (`shape="circle"`).
Same link-gating and cover-branching pattern as `AlbumCard`.

#### `GenreChips.astro`

```ts
interface Props {
  genres?: GenreRef[] | null;
}
```

Sanity-aware wrapper around `ui/Chips`. Filters out genres with no
`name`, links to `/genres/{slug}` only when `generatePage && slug`.

#### `SanityImage.astro`

```ts
interface Props {
  image?: SanityImageSource | null;
  alt: string;
  width: number;
  height?: number;
  class?: string;
}
```

Thin wrapper over `imageUrl()`; renders nothing if there is no image.
Never applies a radius class at call sites — the system has none.

#### `CmsLink.astro`

```ts
interface Props {
  link?: CmsLinkValue | null;
  class?: string;
}
```

Resolves a Sanity link object via `resolveCmsLink`; renders nothing if
unresolved. Adds `target="_blank" rel="noopener noreferrer"` for
external links.

## 4. The refuses list

The system forbids, outright:

- No accent color. Brightness comes from text against a dim room, never
  a color.
- No radius anywhere, **except** `rounded-full` on the artist circle
  cover — the only circle in the system.
- No shadow anywhere. Rows share one hairline; they are not individual
  cards.
- No reveal-on-scroll. Motion responds to hover/tap only.
- No chevrons or arrows on links or on the tracklist expander.
- No player chrome or fake embeds — `ListenLinks` is text-only.
- No language flags, no EN|ES switcher.
- No genre-themed palettes or per-genre styling of any kind. Genre only
  ever names a page.
- No tracked all-caps / letter-spaced eyebrow text anywhere.

## 5. Voice

Interface strings follow this table:

| Use | Not |
|---|---|
| Back to notes | All articles |
| What I've been playing | Curated for you |
| The song moved. Try YouTube for now. | Oops! Something went wrong |
| Put it on and come back | No results found |
| Older notes | Explore the archive |

Banned words, anywhere in interface copy: **discover, explore, curated,
for you, dive in, vibes.**

Interface copy is sentence case everywhere. No tracked capitals.

**Bilingual mixing is intentional, not a bug.** Section labels and empty
states are written in the language of the page they sit on — the design
deliberately mixes English ("Lately", "Tracks") with Spanish ("Discos",
"Gente") within the same interface, and even within a single paragraph.
This is Principle 4 of the design. Do not "fix" it into one language;
no flags or a language switcher are used to explain the mix — it's meant
to read as one voice that happens to move between languages.

## 6. Pending Sanity schema patch

These fields do not exist yet. The frontend already requests them and
renders them conditionally, so applying this patch in the Studio repo
lights up the Recommendation screen with no frontend change.

### 1. `post.song` — reference to a song

Add to the `post` schema:

```ts
defineField({
  name: "song",
  title: "Song",
  type: "reference",
  to: [{ type: "song" }],
})
```

Unlocks: the song line, the genre in the meta line, and the listen links
on a note. `POST_QUERY` (`src/lib/sanity/queries.ts`) already has a
guarded `song->{...}` projection — with no `song` reference on a post,
the query simply returns `song: null`, so nothing errors and nothing
renders until the field exists and is populated.

### 2. `moment` — a block type inside `post.body`

Add to the `body` array's `of: [...]`:

```ts
defineArrayMember({
  name: "moment",
  title: "Moment",
  type: "object",
  fields: [
    defineField({ name: "timestamp", type: "string", title: "Timestamp" }),
    defineField({ name: "lyric", type: "text", title: "Lyric", rows: 3 }),
    defineField({ name: "why", type: "text", title: "Why it lands", rows: 2 }),
  ],
})
```

Unlocks: the Moment block inline in a note, rendered by
`src/components/MomentBlock.astro`.

**Critical — these fields sit at the TOP LEVEL of the block object, not
nested under a `value` key.** `astro-portabletext` passes a custom type
component the raw Portable Text block as `node`, flat, with no `.value`
wrapper. A `moment` block therefore arrives at render time as:

```json
{ "_type": "moment", "_key": "...", "timestamp": "...", "lyric": "...", "why": "..." }
```

and `MomentBlock.astro` reads `node.timestamp` / `node.lyric` /
`node.why` directly. Do not restructure this field group under a
`value` object — that would silently break rendering (no error; the
block would just render nothing).

Write the lyric with guillemets and a slash for the line break —
`«No enciendas la sala / déjala a oscuras»`. The renderer never adds
quotation marks on top of them.

### 3. Artist "Notas" section

Once `post.song` exists, add to `ARTIST_QUERY`
(`src/lib/sanity/queries.ts`):

```groq
"notes": *[_type == "post" && song->artist._ref == ^._id
           && publishedAt <= now()] | order(publishedAt desc){
  _id, title, "slug": slug.current, publishedAt
}
```

Then render it on the artist page as a `SectionLabel` + `Stack` of
`PostCard`s, matching the Discos section directly above it.

## 7. Live behaviour worth knowing about: `ALBUM_QUERY`'s tracklist fallback

`ALBUM_QUERY`'s `tracklist` field is a `coalesce()`:

```groq
"tracklist": coalesce(
  tracklist[]->{ _id, title, "slug": slug.current, trackNumber, duration, review, links },
  *[_type == "song" && album._ref == ^._id]{ _id, title, "slug": slug.current, trackNumber, duration, review, links }
) | order(trackNumber asc)
```

It prefers the authored `album.tracklist` reference array; if that's
empty or absent, it falls back to a reverse lookup on every `song` whose
`album` reference points back at this album. This exists because, as of
writing, **no album in the dataset has a populated `tracklist`**, while
individual songs do point at their album — without the fallback, every
album screen's Tracks section would be empty.

**Populating `album.tracklist` in the Studio is still the intended
authoring path** — it is what gives tracks an explicit order (the
fallback branch has no ordering signal of its own beyond
`song.trackNumber`, which authors may not have set consistently). Treat
the reverse-lookup branch as a safety net, not the primary path.
