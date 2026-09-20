# Phone Glow Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt the "Phone Glow" design system across `astro-listen2ds` — a token layer, a presentational component library, every existing screen migrated onto it, and two new index routes.

**Architecture:** Tailwind 4 `@theme` holds the tokens in `src/styles/global.css`. `src/components/ui/` holds presentational Astro components with no Sanity imports. The existing `src/components/` stays Sanity-aware and composes `ui/`. Pages compose both. Nothing is client-side rendered; the tracklist expander is a native `<details>`.

**Tech Stack:** Astro 7 (static output), Tailwind 4, `@sanity/astro` + GROQ, `astro-portabletext`, Fontsource (self-hosted fonts), `@astrojs/check` (typecheck gate).

**Spec:** `docs/superpowers/specs/2026-09-19-phone-glow-design-system-design.md`

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- **No accent color exists.** Brightness comes from text against a dim room. Do not add an accent token.
- **`Glow` (`#F8FBFF`) appears once per screen** — the page title, or the lyric, not both.
- **Genre never restyles the page.** No genre-conditional styling, palette, or font swap.
- **Single column, 600px measure, left aligned, at every breakpoint.** There is no second column at any width.
- **No radius, no shadow anywhere.** Rows share one hairline; they are not individual cards.
- **`Newsreader Variable` is used exclusively for pasted lyrics.** It is never a heading font.
- Measure caps: body paragraphs 66ch, Dim prose and "why" lines 56ch, hero title 22ch. Never exceed 68ch.
- Body line-height 1.65, titles 1.25. Body stays 17px on mobile. No tracked capitals anywhere.
- Vertical rhythm in multiples of 8 → Tailwind `gap-2 gap-4 gap-6 gap-10 gap-16 gap-24` (8/16/24/40/64/96px).
- Page margin 28px phones, 40px above 700px. Tap targets on 44px minimum lines.
- Motion only on hover/tap. **No reveal-on-scroll.** Row hover 120ms, tracklist expand 160ms ease-out. `prefers-reduced-motion: reduce` disables all of it.
- Interface copy is sentence case. **Banned words: discover, explore, curated, for you, dive in, vibes.**
- Refused outright: rounded cards with shadows, tracked all-caps eyebrows, arrows on links, player chrome or fake embeds, language flags or an EN|ES switcher.
- Exact font family names: **`'Fira Sans'`** and **`'Newsreader Variable'`** (the variable package suffixes the family name — getting this wrong silently falls back to Georgia).

## Verification model

This repo has no test framework and adding one is out of scope per the spec, so tasks do not follow a red-green cycle. Task 1 installs `@astrojs/check` (a typechecker, not a test framework) to give every later task a real automated gate. Each task ends with:

1. `npm run check` — types and `.astro` template errors. Must report 0 errors.
2. `npm run build` — Sanity is queried at build time, so this is what catches a broken GROQ projection.
3. A named visual check where the task produces something visible.

Steps that say "expected: 0 errors" mean exactly that — if `check` reports errors, fix them before committing.

## File structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/components/ui/PageShell.astro` | The 600px measure, page margins, rhythm |
| `src/components/ui/Nav.astro` | Wordmark + nav words, current-page state |
| `src/components/ui/Cover.astro` | Square/circle cover, sizes, missing state |
| `src/components/ui/SectionLabel.astro` | Dim label above a stack |
| `src/components/ui/CountLine.astro` | "Showing 6 of 12 · Older notes" |
| `src/components/ui/EmptyState.astro` | Screen line + Dim line with somewhere to go |
| `src/components/ui/Stack.astro` | Hairline-shared row container |
| `src/components/ui/Row.astro` | post / album / artist row variants |
| `src/components/ui/Lyric.astro` | Newsreader italic lyric |
| `src/components/ui/Moment.astro` | Rule + timestamp + lyric + why |
| `src/components/ui/ListenLinks.astro` | Dim label + text links |
| `src/components/ui/Chips.astro` | Lowercase Dim chips with hairline |
| `src/components/ui/Prose.astro` | Body-spec text container |
| `src/components/ui/Tracklist.astro` | Number / title / duration grid, expandable |
| `src/components/MomentBlock.astro` | Portable Text `moment` block → `ui/Moment` |
| `src/pages/albums/index.astro` | Album index (new route) |
| `src/pages/artists/index.astro` | Artist index (new route) |
| `docs/design-system.md` | The reference future work resolves against |

**Modified:** `package.json`, `src/styles/global.css`, `src/layouts/main.astro`, `src/components/{PostCard,ArtistCard,AlbumCard,GenreChips,PortableBody,SanityImage,CmsLink}.astro`, `src/components/page-builder/*.astro`, `src/lib/sanity/{queries.ts,types.ts}`, `src/pages/index.astro`, `src/pages/posts/{index,[slug]}.astro`, `src/pages/{albums,artists,genres}/[slug].astro`, `AGENTS.md`.

---

### Task 1: Foundation — fonts, tokens, base styles

**Files:**
- Modify: `package.json`
- Modify: `src/styles/global.css` (currently 2 lines)

**Interfaces:**
- Consumes: nothing.
- Produces: the full token set below, available as Tailwind utilities (`bg-room`, `text-dim`, `text-glow`, `border-hairline`, `font-lyric`, `text-title`, `text-body`, `text-meta`, `max-w-measure`). Every later task depends on these exact names.

- [ ] **Step 1: Install dependencies**

```bash
npm install @fontsource/fira-sans@^5.3.0 @fontsource-variable/newsreader@^5.3.0
npm install -D @astrojs/check
```

- [ ] **Step 2: Add the check script**

In `package.json`, add to `"scripts"`:

```json
"check": "astro check"
```

- [ ] **Step 3: Replace `src/styles/global.css` entirely**

All `@import` rules must come first — CSS requires it.

All `@import` rules come first (CSS requires it), then `@plugin`, then `@theme`. The typography plugin keeps its `@plugin` directive — it is **not** an `@import`, and writing it as one breaks the build.

```css
@import "tailwindcss";

/* Self-hosted fonts. The variable package registers the family as
   'Newsreader Variable', not 'Newsreader'. */
@import "@fontsource/fira-sans/300.css";
@import "@fontsource/fira-sans/400.css";
@import "@fontsource/fira-sans/500.css";
@import "@fontsource-variable/newsreader/opsz-italic.css";

@plugin "@tailwindcss/typography";

@theme {
  /* Color — six values plus support tones. There is no accent. */
  --color-room: #13161d;
  /* Defined because it is one of the system's six named colors, but no
     screen uses it yet: rows sit directly on Room and share hairlines
     rather than sitting on a raised surface. Reach for it only if a
     future component genuinely needs a surface one step up. */
  --color-note: #191e27;
  --color-screen: #e6ebf3;
  --color-dim: #98a2b1;
  --color-glow: #f8fbff;
  --color-link: #bfd2ec;
  --color-link-hover: #eaf1fb;
  --color-bright: #f3f7ff;
  --color-hairline: #242a36;
  --color-raised: #1d232e;
  --color-rule: #39424f;
  --color-faint: #6c7686;
  /* Named -fallback because `bg-cover` is already a Tailwind
     background-size utility. */
  --color-cover-fallback: #1b2029;

  /* Type — two families, no third. */
  --font-sans: "Fira Sans", system-ui, sans-serif;
  --font-lyric: "Newsreader Variable", Georgia, serif;

  --text-title: 30px;
  --text-title--line-height: 1.25;
  --text-title--letter-spacing: -0.01em;

  --text-title-sm: 26px;
  --text-title-sm--line-height: 1.28;
  --text-title-sm--letter-spacing: -0.01em;

  --text-row: 20px;
  --text-row--line-height: 1.3;

  --text-body: 17px;
  --text-body--line-height: 1.65;

  --text-lyric: 21px;
  --text-lyric--line-height: 1.5;

  --text-lyric-sm: 20px;
  --text-lyric-sm--line-height: 1.5;

  --text-meta: 15px;
  --text-meta--line-height: 1.5;

  --text-caption: 14px;
  --text-caption--line-height: 1.5;

  /* The one measure. */
  --container-measure: 600px;
}

@layer base {
  html {
    background-color: var(--color-room);
  }

  body {
    background-color: var(--color-room);
    color: var(--color-screen);
    font-family: var(--font-sans);
    font-weight: 300;
    font-size: 17px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: var(--color-link);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
    text-decoration-color: color-mix(in srgb, var(--color-link) 45%, transparent);
  }

  a:hover {
    color: var(--color-link-hover);
    text-decoration-color: var(--color-link-hover);
  }

  ::selection {
    background-color: #2b3444;
    color: var(--color-bright);
  }

  /* The system allows exactly one load moment and nothing else. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition: none !important;
      animation: none !important;
    }
  }
}
```

- [ ] **Step 4: Verify types and build**

Run: `npm run check && npm run build`
Expected: 0 errors, build succeeds. The site will look unstyled-but-dark at this point — that is correct, no component uses the tokens yet.

- [ ] **Step 5: Verify the fonts actually resolve**

Run: `npm run dev`, open the site, and in devtools inspect `<body>`.
Expected: computed `font-family` resolves to Fira Sans, and the Network tab shows `.woff2` files served from your own origin (not `fonts.gstatic.com`).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/styles/global.css
git commit -m "feat: add Phone Glow token layer and self-hosted fonts"
```

---

### Task 2: Page shell and nav

**Files:**
- Create: `src/components/ui/PageShell.astro`
- Create: `src/components/ui/Nav.astro`
- Modify: `src/layouts/main.astro`

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces:
  - `PageShell` props: `{ class?: string }`, renders a `<main>` with the measure. Default slot.
  - `Nav` props: `{ items: Array<{ label: string; href: string }>; pathname: string }`.
  - `main.astro` props unchanged: `{ title: string }`.

- [ ] **Step 1: Create `src/components/ui/PageShell.astro`**

```astro
---
interface Props {
  class?: string;
}

const { class: className } = Astro.props;
---

<main
  class:list={[
    "mx-auto flex w-full max-w-measure flex-col px-7 py-10 sm:px-10",
    className,
  ]}
>
  <slot />
</main>
```

The 600px measure centers as a block; nothing inside it centers its text. `px-7` is 28px (phones), `sm:px-10` is 40px above Tailwind's 640px `sm` breakpoint — the closest built-in to the spec's 700px, and using it avoids a custom breakpoint for a 60px difference.

**`PageShell` deliberately sets no `gap`.** Every caller passes its own (`gap-8`, `gap-16`). If the component also set a default, the two would be an unresolvable Tailwind conflict — competing utilities are settled by CSS source order, not by the order they appear in `class:list`, so the override would win or lose unpredictably. Callers own the rhythm.

- [ ] **Step 2: Create `src/components/ui/Nav.astro`**

Current page renders as plain `Screen`-colored text with no underline; every other item is a link underlined on hover only. The 44px tap target is enforced with `py-*` on the items.

```astro
---
interface NavItem {
  label: string;
  href: string;
}

interface Props {
  items: NavItem[];
  pathname: string;
}

const { items, pathname } = Astro.props;

// "/posts/foo" should mark "/posts" as current; "/" only matches exactly.
const isCurrent = (href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
---

<nav class="flex flex-wrap items-baseline gap-x-6 gap-y-2">
  <a
    href="/"
    class="py-2 text-[18px] font-medium text-bright no-underline hover:text-bright"
    >Listen2ds</a
  >
  {
    items.length > 0 && (
      <div class="flex flex-wrap gap-x-5 text-meta">
        {items.map((item) =>
          isCurrent(item.href) ? (
            <span class="py-2 text-screen">{item.label}</span>
          ) : (
            <a href={item.href} class="py-2 no-underline hover:underline">
              {item.label}
            </a>
          ),
        )}
      </div>
    )
  }
</nav>
```

- [ ] **Step 3: Rewrite `src/layouts/main.astro`**

The navbar singleton still drives the items, but they are normalised to `{label, href}` here so `Nav` stays presentational. `CmsLink` is no longer used in the layout.

```astro
---
import "../styles/global.css";
import { sanityClient } from "sanity:client";
import Nav from "../components/ui/Nav.astro";
import { NAVBAR_QUERY } from "../lib/sanity/queries";
import type { Navbar } from "../lib/sanity/types";

interface Props {
  title: string;
}

const { title } = Astro.props;
const navbar = await sanityClient.fetch<Navbar | null>(NAVBAR_QUERY);

const items = (navbar?.items ?? [])
  .map((item) => {
    const href = item.linkType === "url" ? item.url : item.path;
    return item.label && href ? { label: item.label, href } : null;
  })
  .filter((item): item is { label: string; href: string } => item !== null);
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
  </head>
  <body class="min-h-screen bg-room text-screen">
    <div class="mx-auto flex w-full max-w-measure flex-col px-7 pt-10 sm:px-10">
      <Nav items={items} pathname={Astro.url.pathname} />
    </div>
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors, build succeeds.

- [ ] **Step 5: Visual check**

Run `npm run dev`. On any page: dark `#13161D` background, "Listen2ds" wordmark in Fira Sans 500, nav words at 15px. Navigate to `/posts` — "notes" (or whatever your CMS nav calls it) should lose its underline and turn `Screen` while the others stay `Link` blue.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/PageShell.astro src/components/ui/Nav.astro src/layouts/main.astro
git commit -m "feat: add page shell and nav in the design system"
```

---

### Task 3: Cover, section label, count line, empty state

**Files:**
- Create: `src/components/ui/Cover.astro`
- Create: `src/components/ui/SectionLabel.astro`
- Create: `src/components/ui/CountLine.astro`
- Create: `src/components/ui/EmptyState.astro`

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces:
  - `Cover` props: `{ shape?: "square" | "circle"; size: 52 | 120 | 140 | 160 | 200; class?: string }`. Default slot receives the image; when the slot is empty it renders the missing state.
  - `SectionLabel` props: `{}`, default slot is the label text.
  - `CountLine` props: `{ shown: number; total: number; href?: string; label?: string }`.
  - `EmptyState` props: `{ line: string }`, default slot is the Dim second line (so it can contain links).

- [ ] **Step 1: Create `src/components/ui/Cover.astro`**

`Astro.slots.has("default")` decides between a real image and the missing state, so callers never branch. No radius on squares; the circle is the only circle in the system.

```astro
---
interface Props {
  shape?: "square" | "circle";
  size: 52 | 120 | 140 | 160 | 200;
  class?: string;
}

const { shape = "square", size, class: className } = Astro.props;
const hasImage = Astro.slots.has("default");
---

<div
  class:list={[
    "flex-none overflow-hidden border border-hairline bg-cover-fallback",
    shape === "circle" && "rounded-full",
    !hasImage && "flex items-end p-3.5",
    className,
  ]}
  style={`width:${size}px;height:${size}px;`}
>
  {
    hasImage ? (
      <slot />
    ) : (
      <span class="text-caption leading-snug text-faint">No cover yet</span>
    )
  }
</div>
```

- [ ] **Step 2: Create `src/components/ui/SectionLabel.astro`**

One Dim word above a stack. Deliberately not a heading level — it must not enter the type scale or the document outline.

```astro
---
---

<div class="text-meta text-dim"><slot /></div>
```

- [ ] **Step 3: Create `src/components/ui/CountLine.astro`**

Pagination is a sentence, not controls.

```astro
---
interface Props {
  shown: number;
  total: number;
  href?: string;
  label?: string;
}

const { shown, total, href, label = "Older notes" } = Astro.props;
---

<div class="text-meta text-dim">
  Showing {shown} of {total}{href && <> · <a href={href}>{label}</a></>}
</div>
```

- [ ] **Step 4: Create `src/components/ui/EmptyState.astro`**

```astro
---
interface Props {
  line: string;
}

const { line } = Astro.props;
---

<div class="flex flex-col gap-2 border-t border-hairline pt-6">
  <div class="text-screen">{line}</div>
  {
    Astro.slots.has("default") && (
      <div class="max-w-[52ch] text-meta text-dim">
        <slot />
      </div>
    )
  }
</div>
```

- [ ] **Step 5: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors. Nothing renders these yet.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ src/styles/global.css
git commit -m "feat: add cover, section label, count line, empty state"
```

---

### Task 4: Rows and stacks

**Files:**
- Create: `src/components/ui/Stack.astro`
- Create: `src/components/ui/Row.astro`

**Interfaces:**
- Consumes: `Cover` from Task 3.
- Produces:
  - `Stack` props: `{}`, default slot holds rows. Draws the top hairline; each row draws its own bottom hairline.
  - `Row` props: `{ variant: "post" | "album" | "artist"; href?: string | null; title: string; meta?: string | null }`. Named slot `cover` receives a `Cover`.

- [ ] **Step 1: Create `src/components/ui/Stack.astro`**

Rows share one hairline rather than each becoming a card — this component is what enforces that.

```astro
---
---

<div class="flex flex-col border-t border-hairline">
  <slot />
</div>
```

- [ ] **Step 2: Create `src/components/ui/Row.astro`**

One component, three variants. A row with no `href` renders as a `<div>` — this is what removes the duplicated linked/unlinked branches from the current card components. Hover lifts the background 120ms; no arrow, no radius, no shadow.

```astro
---
import type { HTMLTag } from "astro/types";

interface Props {
  variant: "post" | "album" | "artist";
  href?: string | null;
  title: string;
  meta?: string | null;
}

const { variant, href, title, meta } = Astro.props;

const Tag: HTMLTag = href ? "a" : "div";
const hasCover = Astro.slots.has("cover");

// The post variant puts its 16:9 image on the right; album and artist
// put a 52px cover on the left.
const isPost = variant === "post";
---

<Tag
  href={href ?? undefined}
  class:list={[
    "-mx-3 border-b border-hairline px-3 no-underline transition-colors duration-[120ms]",
    href && "hover:bg-raised",
    isPost
      ? "grid items-start gap-6 py-4"
      : "flex items-center gap-[18px] py-3",
    isPost && hasCover && "grid-cols-[minmax(0,1fr)_150px]",
  ]}
>
  {!isPost && <slot name="cover" />}
  <div class="flex min-w-0 flex-col gap-1.5">
    <div
      class:list={[
        "text-bright",
        isPost ? "text-row" : "leading-snug",
      ]}
    >
      {title}
    </div>
    {meta && <div class="text-meta text-dim">{meta}</div>}
  </div>
  {isPost && hasCover && <slot name="cover" />}
</Tag>
```

- [ ] **Step 3: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Stack.astro src/components/ui/Row.astro
git commit -m "feat: add row and stack components"
```

---

### Task 5: Lyric, moment, listen links, chips

**Files:**
- Create: `src/components/ui/Lyric.astro`
- Create: `src/components/ui/Moment.astro`
- Create: `src/components/ui/ListenLinks.astro`
- Create: `src/components/ui/Chips.astro`

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces:
  - `Lyric` props: `{ size?: "default" | "small" }`. Default slot is the lyric text.
  - `Moment` props: `{ timestamp?: string | null; lyric?: string | null; why?: string | null }`. Renders nothing when all three are absent.
  - `ListenLinks` props: `{ links?: { spotify?: string | null; youtube?: string | null; appleMusic?: string | null } | null; label?: string; size?: "default" | "small" }`. Renders nothing when no link is present.
  - `Chips` props: `{ items: Array<{ name: string; href?: string | null }> }`.

- [ ] **Step 1: Create `src/components/ui/Lyric.astro`**

The only place `font-lyric` is allowed.

```astro
---
interface Props {
  size?: "default" | "small";
}

const { size = "default" } = Astro.props;
---

<div
  class:list={[
    "font-lyric font-light italic text-glow",
    size === "small" ? "text-lyric-sm" : "text-lyric",
  ]}
>
  <slot />
</div>
```

- [ ] **Step 2: Create `src/components/ui/Moment.astro`**

Left rule plus indent. The lyric is never centered and never gains quotation marks on top of its guillemets — pass the text through exactly as written.

```astro
---
import Lyric from "./Lyric.astro";

interface Props {
  timestamp?: string | null;
  lyric?: string | null;
  why?: string | null;
}

const { timestamp, lyric, why } = Astro.props;
const isEmpty = !timestamp && !lyric && !why;
---

{
  !isEmpty && (
    <div class="flex flex-col gap-2.5 border-l border-rule pl-5">
      {timestamp && <div class="text-meta text-dim">{timestamp}</div>}
      {lyric && <Lyric>{lyric}</Lyric>}
      {why && <div class="max-w-[56ch] text-meta text-dim">{why}</div>}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/ListenLinks.astro`**

Text only — no logos, no embeds, no play buttons. A missing link means the word is absent, never disabled or greyed.

```astro
---
interface Props {
  links?: {
    spotify?: string | null;
    youtube?: string | null;
    appleMusic?: string | null;
  } | null;
  label?: string;
  size?: "default" | "small";
}

const { links, label = "Listen", size = "default" } = Astro.props;

const entries = [
  { name: "Spotify", href: links?.spotify },
  { name: "YouTube", href: links?.youtube },
  { name: "Apple Music", href: links?.appleMusic },
].filter((entry): entry is { name: string; href: string } => Boolean(entry.href));
---

{
  entries.length > 0 && (
    <div class="flex flex-col gap-2">
      {label && <div class="text-meta text-dim">{label}</div>}
      <div
        class:list={[
          "flex flex-wrap gap-x-[18px] gap-y-2",
          size === "small" ? "text-meta" : "text-body",
        ]}
      >
        {entries.map((entry) => (
          <a href={entry.href} class="py-1">
            {entry.name}
          </a>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ui/Chips.astro`**

Lowercase, Dim, a hairline underneath. No fill, no radius, no per-genre color.

```astro
---
interface Props {
  items: Array<{ name: string; href?: string | null }>;
}

const { items } = Astro.props;
---

{
  items.length > 0 && (
    <div class="flex flex-wrap items-center gap-x-[18px] gap-y-2 text-meta text-dim">
      {items.map((item) =>
        item.href ? (
          <a
            href={item.href}
            class="border-b border-hairline pb-0.5 text-dim no-underline hover:text-screen"
          >
            {item.name.toLowerCase()}
          </a>
        ) : (
          <span class="border-b border-hairline pb-0.5">
            {item.name.toLowerCase()}
          </span>
        ),
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add lyric, moment, listen links, chips"
```

---

### Task 6: Prose and Portable Text

**Files:**
- Create: `src/components/ui/Prose.astro`
- Create: `src/components/MomentBlock.astro`
- Modify: `src/components/PortableBody.astro`

**Interfaces:**
- Consumes: `Moment` from Task 5.
- Produces:
  - `Prose` props: `{ class?: string }`, default slot.
  - `MomentBlock` props: `{ node: { timestamp?: string | null; lyric?: string | null; why?: string | null } }` — `astro-portabletext` passes the RAW Portable Text block as `node`, flat and unwrapped (verified against `PortableText.astro`'s `asComponentProps`, which builds `{node, index, isInline}`). There is no `.value` key.
  - `PortableBody` props unchanged: `{ value?: PortableTextValue | null }`.

- [ ] **Step 1: Create `src/components/ui/Prose.astro`**

Tailwind's `prose` class is dropped here: its defaults fight the system's measure, color and line-height. `@tailwindcss/typography` stays installed but is no longer used for body text.

```astro
---
interface Props {
  class?: string;
}

const { class: className } = Astro.props;
---

<div
  class:list={[
    "flex flex-col gap-4 text-body text-screen [&_p]:max-w-[66ch] [&_a]:underline [&_h2]:text-title-sm [&_h2]:text-glow [&_h3]:text-row [&_h3]:text-bright [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
    className,
  ]}
>
  <slot />
</div>
```

- [ ] **Step 2: Create `src/components/MomentBlock.astro`**

This is the bridge that makes the Moment first-class content rather than blog formatting. It renders nothing until the `moment` block type exists in the Studio (see Task 13's schema patch), which is why it is written defensively.

`astro-portabletext` hands a custom `type` component the raw Portable Text block as `node` — flat, with no `.value` wrapper. A `moment` block arrives as `{_type: "moment", _key, timestamp, lyric, why}`. Reading `node.value` would be `undefined` forever, and `ui/Moment.astro`'s all-absent guard would silently render nothing.

```astro
---
import Moment from "./ui/Moment.astro";

interface Props {
  node: {
    timestamp?: string | null;
    lyric?: string | null;
    why?: string | null;
  };
}

const { node } = Astro.props;
---

<Moment timestamp={node.timestamp} lyric={node.lyric} why={node.why} />
```

No extra null-guarding is needed here: `ui/Moment.astro` already renders nothing when all three fields are absent.

- [ ] **Step 3: Rewrite `src/components/PortableBody.astro`**

```astro
---
import { PortableText } from "astro-portabletext";
import Prose from "./ui/Prose.astro";
import MomentBlock from "./MomentBlock.astro";
import type { PortableTextValue } from "../lib/sanity/types";

interface Props {
  value?: PortableTextValue | null;
}

const { value } = Astro.props;

const components = {
  type: {
    moment: MomentBlock,
  },
};
---

{
  Array.isArray(value) && value.length > 0 && (
    <Prose>
      <PortableText value={value} components={components} />
    </Prose>
  )
}
```

- [ ] **Step 4: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors. Existing post bodies should still render — the `moment` type simply never appears in current content.

- [ ] **Step 5: Visual check**

Open any post with a body at `npm run dev`. Text should be 17px Fira Sans 300 in `Screen`, paragraphs capped around 66 characters, no serif anywhere.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Prose.astro src/components/MomentBlock.astro src/components/PortableBody.astro
git commit -m "feat: render portable text in the design system, add moment block"
```

---

### Task 7: Tracklist

**Files:**
- Create: `src/components/ui/Tracklist.astro`

**Interfaces:**
- Consumes: `Moment`, `ListenLinks` from Task 5.
- Produces: `Tracklist` props:
  ```ts
  {
    tracks: Array<{
      _id: string;
      title: string;
      trackNumber?: number | null;
      duration?: string | null;
      hasReview: boolean;
      links?: { spotify?: string | null; youtube?: string | null; appleMusic?: string | null } | null;
      noteHref?: string | null;
    }>;
  }
  ```
  plus `ReviewRenderer?` — a component the page passes in (the album page passes `PortableBody`), rendered
  internally as `<ReviewRenderer value={track.review} />`, with `review` carried on each track.

> **Do not use a per-track named slot for the review.** `<Fragment slot={`review-${track._id}`}>` inside a
> `.map()` throws `ReferenceError: <var> is not defined` at render time — Astro hoists the slot-name
> expression into a scope where the map callback variable does not exist. This was verified empirically:
> it fails even when the slot's children are a static string, so it is the dynamic slot name itself, not
> the children, that breaks. Passing a renderer component as a prop is the working pattern, and it keeps
> `Tracklist` presentational (data plus a component, no Sanity imports).

- [ ] **Step 1: Create `src/components/ui/Tracklist.astro`**

Rows with a review become a native `<details>`; rows without stay a plain grid row. `list-none` plus the `::-webkit-details-marker` rule removes the default triangle, since the design forbids chevrons.

```astro
---
import ListenLinks from "./ListenLinks.astro";

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
}

interface Props {
  tracks: Track[];
}

const { tracks } = Astro.props;

const rowClass =
  "grid grid-cols-[28px_minmax(0,1fr)_auto] items-baseline gap-4 py-3";
---

<div class="flex flex-col border-t border-hairline">
  {
    tracks.map((track, index) =>
      track.hasReview ? (
        <details class="group border-b border-hairline open:bg-raised">
          <summary
            class:list={[
              rowClass,
              "-mx-3.5 cursor-pointer list-none px-3.5 transition-colors duration-[160ms] hover:bg-raised",
            ]}
          >
            <span class="text-meta text-faint">
              {track.trackNumber ?? index + 1}
            </span>
            <span class="text-glow">{track.title}</span>
            <span class="text-meta tabular-nums text-dim">
              {track.duration}
            </span>
          </summary>
          <div class="flex flex-col gap-3 px-3.5 pb-5 pl-11">
            <slot name={`review-${track._id}`} />
            <ListenLinks links={track.links} label="" size="small" />
            {track.noteHref && (
              <div class="text-meta">
                <a href={track.noteHref}>The note about this one</a>
              </div>
            )}
          </div>
        </details>
      ) : (
        <div class:list={[rowClass, "border-b border-hairline"]}>
          <span class="text-meta text-faint">
            {track.trackNumber ?? index + 1}
          </span>
          <span class="text-screen">{track.title}</span>
          <span class="text-meta tabular-nums text-dim">{track.duration}</span>
        </div>
      ),
    )
  }
</div>

<style>
  summary::-webkit-details-marker {
    display: none;
  }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors. Not wired to a page until Task 10.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Tracklist.astro
git commit -m "feat: add tracklist with in-place expansion"
```

---

### Task 8: Types and queries

**Files:**
- Modify: `src/lib/sanity/types.ts`
- Modify: `src/lib/sanity/queries.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `PostSong` type; `Post` gains `song`; new `ALBUMS_QUERY`, `ARTISTS_QUERY`; `ALBUM_QUERY`, `ARTIST_QUERY`, `GENRE_QUERY`, `POST_QUERY`, `POSTS_QUERY` extended. Tasks 10–12 consume these.

`types.ts` is hand-written with no TypeGen, so it drifts silently unless updated in the same commit as the query.

- [ ] **Step 1: Add the post-song type to `src/lib/sanity/types.ts`**

Append near the existing `Post` type:

```ts
export type PostSong = {
  title: string;
  duration?: string | null;
  links?: SongLinks | null;
  artist?: { name?: string | null; slug?: string | null; generatePage?: boolean | null } | null;
  album?: { title?: string | null; slug?: string | null; generatePage?: boolean | null } | null;
  genres?: GenreRef[] | null;
};
```

Then change `Post` to:

```ts
export type Post = PostCardData & {
  body?: PortableTextValue | null;
  song?: PostSong | null;
};
```

- [ ] **Step 2: Add the total-count field to the posts list type**

`CountLine` needs a total. Append:

```ts
export type PostsIndexData = {
  posts: PostCardData[];
  total: number;
};
```

- [ ] **Step 3: Extend `POST_QUERY` in `src/lib/sanity/queries.ts`**

`song` does not exist on `post` yet. GROQ returns `null` for an undefined field rather than erroring, so this is safe to ship today and lights up the moment the reference is added in the Studio.

```ts
export const POST_QUERY = defineQuery(/* groq */ `
  *[_type == "post" && slug.current == $slug && publishedAt <= now()][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    image,
    body,
    song->{
      title,
      duration,
      links,
      artist->{ name, "slug": slug.current, generatePage },
      album->{ title, "slug": slug.current, generatePage },
      genres[]->{ _id, name, "slug": slug.current, generatePage }
    }
  }
`);
```

- [ ] **Step 4: Add a total to `POSTS_QUERY`**

Replace `POSTS_QUERY` with:

```ts
export const POSTS_QUERY = defineQuery(/* groq */ `
  {
    "posts": *[_type == "post" && defined(slug.current) && publishedAt <= now()]
      | order(publishedAt desc)[0...12]{
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        image
      },
    "total": count(*[_type == "post" && defined(slug.current) && publishedAt <= now()])
  }
`);
```

- [ ] **Step 5: Extend `ALBUM_QUERY`'s tracklist**

Find `ALBUM_QUERY` and make its `tracklist` projection:

```groq
    tracklist[]->{
      _id,
      title,
      "slug": slug.current,
      trackNumber,
      duration,
      review,
      links
    } | order(trackNumber asc),
```

- [ ] **Step 6: Add the two index queries**

```ts
export const ALBUMS_QUERY = defineQuery(/* groq */ `
  *[_type == "album" && generatePage == true && defined(slug.current)]
    | order(releaseDate desc){
      _id,
      title,
      "slug": slug.current,
      coverImage,
      releaseDate,
      generatePage,
      artist->{ name }
    }
`);

export const ARTISTS_QUERY = defineQuery(/* groq */ `
  *[_type == "artist" && generatePage == true && defined(slug.current)]
    | order(name asc){
      _id,
      name,
      "slug": slug.current,
      image,
      generatePage
    }
`);
```

- [ ] **Step 7: Adjust the one caller `POSTS_QUERY` breaks**

`POSTS_QUERY` changed from returning an array to returning `{ posts, total }`, so its only consumer must change in the same commit or this task leaves the typecheck red. Task 11 rewrites this file fully; this is the minimal change that keeps the gate green now.

In `src/pages/posts/index.astro`, change the fetch line from:

```ts
const posts = await sanityClient.fetch<PostCardData[]>(POSTS_QUERY);
```

to:

```ts
const { posts } = await sanityClient.fetch<PostsIndexData>(POSTS_QUERY);
```

and update the type import to `PostsIndexData`. Leave the template alone.

- [ ] **Step 8: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add src/lib/sanity/types.ts src/lib/sanity/queries.ts src/pages/posts/index.astro
git commit -m "feat: extend queries for tracklists, post songs, and indexes"
```

---

### Task 9: Migrate the Sanity-aware components

**Files:**
- Modify: `src/components/PostCard.astro`
- Modify: `src/components/ArtistCard.astro`
- Modify: `src/components/AlbumCard.astro`
- Modify: `src/components/GenreChips.astro`
- Modify: `src/components/SanityImage.astro`
- Modify: `src/components/CmsLink.astro`

**Interfaces:**
- Consumes: `Row`, `Cover`, `Chips` from Tasks 3–5.
- Produces: same props as today — `PostCard{post}`, `ArtistCard{artist}`, `AlbumCard{album}`, `GenreChips{genres}`. Callers do not change.

Each card loses its duplicated linked/unlinked branches: `Row` handles the `href`-or-not decision in one place.

- [ ] **Step 1: Rewrite `src/components/PostCard.astro`**

Dates are Dim and Spanish-month, matching how the notes are written.

```astro
---
import Row from "./ui/Row.astro";
import SanityImage from "./SanityImage.astro";
import type { PostCardData } from "../lib/sanity/types";

interface Props {
  post: PostCardData;
}

const { post } = Astro.props;
const href = post.slug ? `/posts/${post.slug}` : null;
const published = post.publishedAt
  ? new Date(post.publishedAt).toLocaleDateString("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  : null;
---

<Row variant="post" href={href} title={post.title} meta={published}>
  {
    post.image && (
      <div slot="cover" class="aspect-video w-full border border-hairline">
        <SanityImage
          image={post.image}
          alt={post.title}
          width={300}
          height={169}
          class="h-full w-full object-cover"
        />
      </div>
    )
  }
</Row>
```

- [ ] **Step 2: Rewrite `src/components/ArtistCard.astro`**

Artists are the only circle in the system.

`Cover` decides between a real image and the missing state with `Astro.slots.has("default")`, which returns **true** for a slot whose content is a falsy expression. So the branch has to happen at the call site — `<Cover>{artist.image && <img/>}</Cover>` would report a filled slot and render an empty box. Two explicit branches, the same shape every card in this task uses:

```astro
---
import Row from "./ui/Row.astro";
import Cover from "./ui/Cover.astro";
import SanityImage from "./SanityImage.astro";
import type { ArtistCardData } from "../lib/sanity/types";

interface Props {
  artist: ArtistCardData;
}

const { artist } = Astro.props;
const href =
  artist.generatePage && artist.slug ? `/artists/${artist.slug}` : null;
---

<Row variant="artist" href={href} title={artist.name}>
  {
    artist.image ? (
      <Cover slot="cover" shape="circle" size={52}>
        <SanityImage
          image={artist.image}
          alt={artist.name}
          width={104}
          height={104}
          class="h-full w-full object-cover"
        />
      </Cover>
    ) : (
      <Cover slot="cover" shape="circle" size={52} />
    )
  }
</Row>
```

- [ ] **Step 3: Rewrite `src/components/AlbumCard.astro`**

Albums keep their square.

```astro
---
import Row from "./ui/Row.astro";
import Cover from "./ui/Cover.astro";
import SanityImage from "./SanityImage.astro";
import type { AlbumCardData } from "../lib/sanity/types";

interface Props {
  album: AlbumCardData;
}

const { album } = Astro.props;
const href = album.generatePage && album.slug ? `/albums/${album.slug}` : null;
---

<Row
  variant="album"
  href={href}
  title={album.title}
  meta={album.artist?.name ?? null}
>
  {
    album.coverImage ? (
      <Cover slot="cover" size={52}>
        <SanityImage
          image={album.coverImage}
          alt={album.title}
          width={104}
          height={104}
          class="h-full w-full object-cover"
        />
      </Cover>
    ) : (
      <Cover slot="cover" size={52} />
    )
  }
</Row>
```

- [ ] **Step 4: Rewrite `src/components/GenreChips.astro` to delegate**

```astro
---
import Chips from "./ui/Chips.astro";
import type { GenreRef } from "../lib/sanity/types";

interface Props {
  genres?: GenreRef[] | null;
}

const { genres } = Astro.props;

const items = (genres ?? [])
  .filter((genre) => genre?.name)
  .map((genre) => ({
    name: genre.name,
    href: genre.generatePage && genre.slug ? `/genres/${genre.slug}` : null,
  }));
---

<Chips items={items} />
```

- [ ] **Step 5: Strip radius at the `SanityImage` call sites**

Search for `rounded-xl` across `src/` and remove every occurrence — the system has no radius.

Run: `grep -rn "rounded-xl" src/`
Expected after edits: no matches.

- [ ] **Step 6: Restyle `src/components/CmsLink.astro`**

Remove any `hover:underline` / `underline` class passed at call sites and let the base `a` rule from Task 1 carry the link treatment. Keep the component's props and link-type logic exactly as they are.

- [ ] **Step 7: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/
git commit -m "refactor: migrate cards to design system rows"
```

---

### Task 10: Page-builder blocks

**Files:**
- Modify: `src/components/page-builder/Hero.astro`
- Modify: `src/components/page-builder/FeaturedPosts.astro`
- Modify: `src/components/page-builder/FeaturedAlbums.astro`
- Modify: `src/components/page-builder/FeaturedArtists.astro`
- Modify: `src/components/page-builder/PageBuilder.astro`
- Modify: `src/components/page-builder/RichText.astro`

**Interfaces:**
- Consumes: `SectionLabel`, `Stack`, `Row` (via the card components), `Prose`.
- Produces: unchanged block props.

- [ ] **Step 1: Rewrite `src/components/page-builder/Hero.astro`**

The hero stops rendering `block.image`. The design's hero is text only, and the system forbids art spanning the measure as a banner. The Sanity field stays — removing it is a schema change — it is simply not read.

```astro
---
import CmsLink from "../CmsLink.astro";
import type { HeroBlock } from "../../lib/sanity/types";

interface Props {
  block: HeroBlock;
}

const { block } = Astro.props;
---

<section class="flex flex-col gap-3.5">
  <h1 class="max-w-[22ch] text-title text-glow">{block.heading}</h1>
  {block.text && <p class="max-w-[56ch] text-body text-screen">{block.text}</p>}
  {block.button && <div class="text-body"><CmsLink link={block.button} /></div>}
</section>
```

- [ ] **Step 2: Rewrite `src/components/page-builder/FeaturedPosts.astro`**

A Dim label plus a stack of rows — not a grid of cards. A visit with only a hero still looks finished because nothing depends on a grid being full.

```astro
---
import SectionLabel from "../ui/SectionLabel.astro";
import Stack from "../ui/Stack.astro";
import PostCard from "../PostCard.astro";
import type { FeaturedPostsBlock } from "../../lib/sanity/types";

interface Props {
  block: FeaturedPostsBlock;
}

const { block } = Astro.props;
const posts = block.posts ?? [];
---

{
  posts.length > 0 && (
    <section class="flex flex-col gap-4">
      <SectionLabel>{block.heading ?? "Lately"}</SectionLabel>
      <Stack>
        {posts.map((post) => (
          <PostCard post={post} />
        ))}
      </Stack>
    </section>
  )
}
```

- [ ] **Step 3: Rewrite `FeaturedAlbums.astro` and `FeaturedArtists.astro` the same way**

Identical structure; swap the component and the default label. Repeated in full so this task can be read on its own.

`FeaturedAlbums.astro`:

```astro
---
import SectionLabel from "../ui/SectionLabel.astro";
import Stack from "../ui/Stack.astro";
import AlbumCard from "../AlbumCard.astro";
import type { FeaturedAlbumsBlock } from "../../lib/sanity/types";

interface Props {
  block: FeaturedAlbumsBlock;
}

const { block } = Astro.props;
const albums = block.albums ?? [];
---

{
  albums.length > 0 && (
    <section class="flex flex-col gap-4">
      <SectionLabel>{block.heading ?? "Discos que tengo puestos"}</SectionLabel>
      <Stack>
        {albums.map((album) => (
          <AlbumCard album={album} />
        ))}
      </Stack>
    </section>
  )
}
```

`FeaturedArtists.astro`:

```astro
---
import SectionLabel from "../ui/SectionLabel.astro";
import Stack from "../ui/Stack.astro";
import ArtistCard from "../ArtistCard.astro";
import type { FeaturedArtistsBlock } from "../../lib/sanity/types";

interface Props {
  block: FeaturedArtistsBlock;
}

const { block } = Astro.props;
const artists = block.artists ?? [];
---

{
  artists.length > 0 && (
    <section class="flex flex-col gap-4">
      <SectionLabel>{block.heading ?? "Gente"}</SectionLabel>
      <Stack>
        {artists.map((artist) => (
          <ArtistCard artist={artist} />
        ))}
      </Stack>
    </section>
  )
}
```

- [ ] **Step 4: Set block spacing in `PageBuilder.astro`**

Ensure the wrapper separates blocks by 52px-ish rhythm — use `flex flex-col gap-16` (64px) on the container. Leave the block-type switch untouched.

- [ ] **Step 5: Check `RichText.astro` routes through `PortableBody`**

If it renders `PortableText` directly, change it to use `PortableBody` so the `moment` block and `Prose` styling apply everywhere body copy appears.

- [ ] **Step 6: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/page-builder/
git commit -m "refactor: migrate page-builder blocks to design system"
```

---

### Task 11: Home, posts index, post detail

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/posts/index.astro`
- Modify: `src/pages/posts/[slug].astro`

**Interfaces:**
- Consumes: `PageShell`, `Stack`, `SectionLabel`, `CountLine`, `EmptyState`, `Cover`, `Moment`, `ListenLinks`, `GenreChips`, `PortableBody`; `POSTS_QUERY` (new shape) and `POST_QUERY` from Task 8.
- Produces: screens 1, 3, 3b and 2.

- [ ] **Step 1: Update `src/pages/index.astro` to use `PageShell`**

```astro
---
import Layout from "../layouts/main.astro";
import PageShell from "../components/ui/PageShell.astro";
import PageBuilder from "../components/page-builder/PageBuilder.astro";
import { sanityClient } from "sanity:client";
import { HOME_QUERY } from "../lib/sanity/queries";
import type { Page } from "../lib/sanity/types";

const home = await sanityClient.fetch<Page | null>(HOME_QUERY);

if (!home) {
  return new Response("Not found", { status: 404, statusText: "Not Found" });
}
---

<Layout title={home.title}>
  <PageShell class="gap-16 pb-24">
    <PageBuilder blocks={home.pageBuilder} />
  </PageShell>
</Layout>
```

- [ ] **Step 2: Rewrite `src/pages/posts/index.astro`**

`POSTS_QUERY` now returns `{ posts, total }`. Includes the empty state (screen 3b).

```astro
---
import Layout from "../../layouts/main.astro";
import PageShell from "../../components/ui/PageShell.astro";
import SectionLabel from "../../components/ui/SectionLabel.astro";
import Stack from "../../components/ui/Stack.astro";
import CountLine from "../../components/ui/CountLine.astro";
import EmptyState from "../../components/ui/EmptyState.astro";
import PostCard from "../../components/PostCard.astro";
import { sanityClient } from "sanity:client";
import { POSTS_QUERY } from "../../lib/sanity/queries";
import type { PostsIndexData } from "../../lib/sanity/types";

const { posts, total } = await sanityClient.fetch<PostsIndexData>(POSTS_QUERY);
---

<Layout title="Notes">
  <PageShell class="gap-8 pb-24">
    <div class="flex flex-col gap-2">
      <h1 class="text-title-sm text-glow">Notes</h1>
      {posts.length > 0 && (
        <div class="text-meta text-dim">Lo último. Twelve at a time.</div>
      )}
    </div>

    {
      posts.length > 0 ? (
        <>
          <Stack>
            {posts.map((post) => (
              <PostCard post={post} />
            ))}
          </Stack>
          {total > posts.length && (
            <CountLine shown={posts.length} total={total} />
          )}
        </>
      ) : (
        <EmptyState line="No hay notas todavía.">
          Estoy escuchando algo ahora mismo. Meanwhile there are <a href="/albums">some albums</a> in here with tracklists already written.
        </EmptyState>
      )
    }
  </PageShell>
</Layout>
```

- [ ] **Step 3: Rewrite `src/pages/posts/[slug].astro`**

This is the Recommendation screen. The song line, genre meta and listen links render only when `post.song` exists — today that is never, and the page is still complete without them.

Keep the existing `getStaticPaths` exactly as it is; only the template changes.

```astro
---
// ... keep the existing getStaticPaths and POST_QUERY fetch ...
import PageShell from "../../components/ui/PageShell.astro";
import Cover from "../../components/ui/Cover.astro";
import ListenLinks from "../../components/ui/ListenLinks.astro";
import GenreChips from "../../components/GenreChips.astro";
import PortableBody from "../../components/PortableBody.astro";
import SanityImage from "../../components/SanityImage.astro";

const published = post.publishedAt
  ? new Date(post.publishedAt).toLocaleDateString("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  : null;

const song = post.song ?? null;
const albumHref =
  song?.album?.generatePage && song.album.slug
    ? `/albums/${song.album.slug}`
    : null;
---

<Layout title={post.title}>
  <PageShell class="gap-8 pb-24">
    <div class="flex flex-wrap items-start gap-[22px]">
      {post.image ? (
        <Cover size={140}>
          <SanityImage
            image={post.image}
            alt={post.title}
            width={280}
            height={280}
            class="h-full w-full object-cover"
          />
        </Cover>
      ) : (
        <Cover size={140} />
      )}
      <div class="flex min-w-[250px] flex-1 flex-col gap-2">
        <h1 class="text-title-sm text-glow sm:text-title">{post.title}</h1>
        {song && (
          <div class="text-body text-screen">
            "{song.title}"{song.artist?.name && <> — {song.artist.name}</>}
            {albumHref && song.album?.title && (
              <>, de <a href={albumHref}>{song.album.title}</a></>
            )}
          </div>
        )}
        <div class="flex flex-wrap items-center gap-x-2 text-meta text-dim">
          {published}
          {song?.genres && song.genres.length > 0 && (
            <>· <GenreChips genres={song.genres} /></>
          )}
        </div>
      </div>
    </div>

    <PortableBody value={post.body} />

    <ListenLinks links={song?.links} />

    <div class="border-t border-hairline pt-4 text-meta">
      <a href="/posts">Back to notes</a>
    </div>
  </PageShell>
</Layout>
```

- [ ] **Step 4: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 5: Visual check against screens 1, 2, 2b, 3**

Run `npm run dev`. Check at desktop width **and at 390px** (devtools device toolbar):
- Home: hero title at 22ch, then Dim-labelled stacks. No hero image.
- `/posts`: "Notes" title, rows sharing hairlines, rows with and without an image sitting on the same line rhythm.
- A post: 140px square cover beside a 30px title (26px at 390px), body at 17px both, "Back to notes" under a hairline.
- Hover a row — background lifts to `#1D232E`, nothing moves.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/pages/posts/
git commit -m "feat: migrate home, posts index, and post detail screens"
```

---

### Task 12: Album, artist, genre, and the two new indexes

**Files:**
- Modify: `src/pages/albums/[slug].astro`
- Modify: `src/pages/artists/[slug].astro`
- Modify: `src/pages/genres/[slug].astro`
- Create: `src/pages/albums/index.astro`
- Create: `src/pages/artists/index.astro`

**Interfaces:**
- Consumes: `Tracklist` (Task 7), `ALBUMS_QUERY`, `ARTISTS_QUERY` (Task 8), all `ui/` components.
- Produces: screens 4, 5, 6 plus two index routes.

- [ ] **Step 1: Add the tracklist to `src/pages/albums/[slug].astro`**

The album header mirrors the post header at 160px. The tracklist passes each review through the per-track named slot.

```astro
---
// ... keep existing getStaticPaths and ALBUM_QUERY fetch ...
import PageShell from "../../components/ui/PageShell.astro";
import Cover from "../../components/ui/Cover.astro";
import SectionLabel from "../../components/ui/SectionLabel.astro";
import Tracklist from "../../components/ui/Tracklist.astro";
import ListenLinks from "../../components/ui/ListenLinks.astro";
import GenreChips from "../../components/GenreChips.astro";
import PortableBody from "../../components/PortableBody.astro";
import SanityImage from "../../components/SanityImage.astro";

const tracks = (album.tracklist ?? []).map((track) => ({
  _id: track._id,
  title: track.title,
  trackNumber: track.trackNumber,
  duration: track.duration,
  hasReview: Array.isArray(track.review) && track.review.length > 0,
  review: track.review,
  links: track.links,
  noteHref: null,
}));
---

<Layout title={album.title}>
  <PageShell class="gap-8 pb-24">
    <div class="flex flex-wrap items-start gap-[22px]">
      {album.coverImage ? (
        <Cover size={160}>
          <SanityImage
            image={album.coverImage}
            alt={album.title}
            width={320}
            height={320}
            class="h-full w-full object-cover"
          />
        </Cover>
      ) : (
        <Cover size={160} />
      )}
      <div class="flex min-w-[250px] flex-1 flex-col gap-2">
        <h1 class="text-title-sm text-glow sm:text-title">{album.title}</h1>
        {album.artist?.name && (
          <div class="text-body text-screen">
            {album.artist.generatePage && album.artist.slug ? (
              <a href={`/artists/${album.artist.slug}`}>{album.artist.name}</a>
            ) : (
              album.artist.name
            )}
          </div>
        )}
        <GenreChips genres={album.genres} />
      </div>
    </div>

    <PortableBody value={album.description} />

    {tracks.length > 0 && (
      <section class="flex flex-col gap-3.5">
        <SectionLabel>Tracks</SectionLabel>
        <Tracklist tracks={tracks} ReviewRenderer={PortableBody} />
      </section>
    )}
  </PageShell>
</Layout>
```

- [ ] **Step 2: Rewrite `src/pages/artists/[slug].astro`**

120px circle, bio, then a Discos stack. The Notas stack stays out until `post.song` exists — adding an always-empty section now would render a bare label.

```astro
---
// ... keep existing getStaticPaths and ARTIST_QUERY fetch ...
import PageShell from "../../components/ui/PageShell.astro";
import Cover from "../../components/ui/Cover.astro";
import SectionLabel from "../../components/ui/SectionLabel.astro";
import Stack from "../../components/ui/Stack.astro";
import AlbumCard from "../../components/AlbumCard.astro";
import GenreChips from "../../components/GenreChips.astro";
import PortableBody from "../../components/PortableBody.astro";
import SanityImage from "../../components/SanityImage.astro";
---

<Layout title={artist.name}>
  <PageShell class="gap-8 pb-24">
    <div class="flex flex-wrap items-start gap-[22px]">
      {artist.image ? (
        <Cover shape="circle" size={120}>
          <SanityImage
            image={artist.image}
            alt={artist.name}
            width={240}
            height={240}
            class="h-full w-full object-cover"
          />
        </Cover>
      ) : (
        <Cover shape="circle" size={120} />
      )}
      <div class="flex min-w-[250px] flex-1 flex-col gap-2">
        <h1 class="text-title-sm text-glow sm:text-title">{artist.name}</h1>
        <GenreChips genres={artist.genres} />
      </div>
    </div>

    <PortableBody value={artist.bio} />

    {artist.albums && artist.albums.length > 0 && (
      <section class="flex flex-col gap-3.5">
        <SectionLabel>Discos</SectionLabel>
        <Stack>
          {artist.albums.map((album) => (
            <AlbumCard album={album} />
          ))}
        </Stack>
      </section>
    )}
  </PageShell>
</Layout>
```

- [ ] **Step 3: Rewrite `src/pages/genres/[slug].astro`**

The only thing a genre does to the page is name it. No color, no illustration, no type change.

```astro
---
// ... keep existing getStaticPaths and GENRE_QUERY fetch ...
import PageShell from "../../components/ui/PageShell.astro";
import SectionLabel from "../../components/ui/SectionLabel.astro";
import Stack from "../../components/ui/Stack.astro";
import AlbumCard from "../../components/AlbumCard.astro";
import ArtistCard from "../../components/ArtistCard.astro";
---

<Layout title={genre.name}>
  <PageShell class="gap-8 pb-24">
    <div class="flex flex-col gap-3">
      <h1 class="text-title-sm text-glow sm:text-title">{genre.name}</h1>
      {genre.description && (
        <p class="max-w-[62ch] text-body text-screen">{genre.description}</p>
      )}
    </div>

    {genre.albums && genre.albums.length > 0 && (
      <section class="flex flex-col gap-3.5">
        <SectionLabel>Discos</SectionLabel>
        <Stack>
          {genre.albums.map((album) => <AlbumCard album={album} />)}
        </Stack>
      </section>
    )}

    {genre.artists && genre.artists.length > 0 && (
      <section class="flex flex-col gap-3.5">
        <SectionLabel>Gente</SectionLabel>
        <Stack>
          {genre.artists.map((artist) => <ArtistCard artist={artist} />)}
        </Stack>
      </section>
    )}
  </PageShell>
</Layout>
```

- [ ] **Step 4: Create `src/pages/albums/index.astro`**

```astro
---
import Layout from "../../layouts/main.astro";
import PageShell from "../../components/ui/PageShell.astro";
import Stack from "../../components/ui/Stack.astro";
import EmptyState from "../../components/ui/EmptyState.astro";
import AlbumCard from "../../components/AlbumCard.astro";
import { sanityClient } from "sanity:client";
import { ALBUMS_QUERY } from "../../lib/sanity/queries";
import type { AlbumCardData } from "../../lib/sanity/types";

const albums = await sanityClient.fetch<AlbumCardData[]>(ALBUMS_QUERY);
---

<Layout title="Albums">
  <PageShell class="gap-8 pb-24">
    <h1 class="text-title-sm text-glow">Discos</h1>
    {
      albums.length > 0 ? (
        <Stack>
          {albums.map((album) => (
            <AlbumCard album={album} />
          ))}
        </Stack>
      ) : (
        <EmptyState line="Todavía no hay discos acá.">
          Put something on and come back — <a href="/posts">the notes</a> are
          still here.
        </EmptyState>
      )
    }
  </PageShell>
</Layout>
```

- [ ] **Step 5: Create `src/pages/artists/index.astro`**

```astro
---
import Layout from "../../layouts/main.astro";
import PageShell from "../../components/ui/PageShell.astro";
import Stack from "../../components/ui/Stack.astro";
import EmptyState from "../../components/ui/EmptyState.astro";
import ArtistCard from "../../components/ArtistCard.astro";
import { sanityClient } from "sanity:client";
import { ARTISTS_QUERY } from "../../lib/sanity/queries";
import type { ArtistCardData } from "../../lib/sanity/types";

const artists = await sanityClient.fetch<ArtistCardData[]>(ARTISTS_QUERY);
---

<Layout title="Artists">
  <PageShell class="gap-8 pb-24">
    <h1 class="text-title-sm text-glow">Gente</h1>
    {
      artists.length > 0 ? (
        <Stack>
          {artists.map((artist) => (
            <ArtistCard artist={artist} />
          ))}
        </Stack>
      ) : (
        <EmptyState line="No hay artistas acá todavía.">
          Hay discos <a href="/albums">acá</a>.
        </EmptyState>
      )
    }
  </PageShell>
</Layout>
```

- [ ] **Step 6: Confirm the new routes do not collide with CMS pages**

`PAGE_SLUGS_QUERY` already excludes `posts`, `artists`, `albums`, `genres`, so a CMS page with one of those slugs cannot shadow these routes. Verify no change is needed:

Run: `grep -n "slug.current in" src/lib/sanity/queries.ts`
Expected: the exclusion list contains `"posts", "artists", "albums", "genres"`.

- [ ] **Step 7: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors. Confirm `dist/albums/index.html` and `dist/artists/index.html` were generated.

- [ ] **Step 8: Visual and keyboard check**

Run `npm run dev`:
- An album with a track that has a review: the row expands in place, background goes `#1D232E`, no chevron appears.
- Tab to that row and press Enter — it should open. This is the `<details>` working.
- Turn on `prefers-reduced-motion` (devtools → Rendering → Emulate CSS prefers-reduced-motion) and confirm the expand is instant.
- An album with no cover shows the flat "No cover yet" box, not a broken image.

- [ ] **Step 9: Commit**

```bash
git add src/pages/
git commit -m "feat: migrate album, artist, genre screens and add indexes"
```

---

### Task 13: Documentation

**Files:**
- Create: `docs/design-system.md`
- Modify: `AGENTS.md`

`AGENTS.md`'s own convention requires updating it when rendering changes, so this task is not optional.

- [ ] **Step 1: Write `docs/design-system.md`**

It must contain, in this order:

1. **Tokens** — the color table and type table from the spec, with the Tailwind utility name beside each (`--color-dim` → `text-dim`).
2. **Rhythm mapping** — 8/16/24/40/64/96px → `gap-2 gap-4 gap-6 gap-10 gap-16 gap-24`.
3. **Component inventory** — every file in `src/components/ui/` with its props signature, copied from the Interfaces block of the task that created it.
4. **The refuses list** — verbatim from the Global Constraints section of this plan.
5. **The voice table** — the five use/not pairs and the banned-words list.
6. **Pending Sanity schema patch** — the section below, written out in full.

The pending-patch section:

```markdown
## Pending Sanity schema patch

These fields do not exist yet. The frontend already requests them and
renders them conditionally, so applying this patch in the Studio repo
lights up the Recommendation screen with no frontend change.

### 1. `post.song` — reference to a song

Add to the `post` schema:

    defineField({
      name: "song",
      title: "Song",
      type: "reference",
      to: [{ type: "song" }],
    })

Unlocks: the song line, the genre in the meta line, and the listen
links on a note.

### 2. `moment` — a block type inside `post.body`

Add to the `body` array's `of: [...]`:

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

Unlocks: the Moment block inline in a note, rendered by
`src/components/MomentBlock.astro`.

Write the lyric with guillemets and a slash for the line break —
`«No enciendas la sala / déjala a oscuras»`. The renderer never adds
quotation marks on top of them.

### 3. Artist "Notas" section

Once `post.song` exists, add to `ARTIST_QUERY`:

    "notes": *[_type == "post" && song->artist._ref == ^._id
               && publishedAt <= now()] | order(publishedAt desc){
      _id, title, "slug": slug.current, publishedAt
    }

Then render it on the artist page as a `SectionLabel` + `Stack` of
`PostCard`s, matching the Discos section directly above it.
```

- [ ] **Step 2: Add a Design system section to `AGENTS.md`**

Insert after the "Key files" table:

```markdown
## Design system

The site is built on the "Phone Glow" design system. Tokens live in
`src/styles/global.css` (`@theme`); presentational components live in
`src/components/ui/` and must not import Sanity.

**Read `docs/design-system.md` before building a new page or component.**
It carries the tokens, the component inventory, the voice rules, and the
list of things the system refuses.

Short version: dark single column, 600px measure, left aligned at every
width. Two fonts — Fira Sans, and Newsreader italic for lyrics only. No
accent color, no radius, no shadow, no reveal-on-scroll. Sentence case
everywhere.
```

Also add to the Key files table:

| `src/components/ui/` | Presentational design-system components |
| `docs/design-system.md` | Token and component reference |

- [ ] **Step 3: Verify**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add docs/design-system.md AGENTS.md
git commit -m "docs: add design system reference and pending schema patch"
```

---

## Final verification

After Task 13, run the full pass from the spec:

- [ ] `npm run check` — 0 errors
- [ ] `npm run build` — succeeds
- [ ] All six screens checked at 390px and desktop against the design file
- [ ] Empty states: post with no image, album with no cover, track with no review, post with no song reference
- [ ] Keyboard: tab through nav, rows, tracklist `<details>`
- [ ] `prefers-reduced-motion: reduce` — nothing animates
- [ ] `grep -rn "rounded" src/` — no radius utilities survive
- [ ] `grep -rniE "discover|explore|curated|for you|dive in|vibes" src/` — no banned words in interface copy
