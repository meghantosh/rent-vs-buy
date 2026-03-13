---
title: "feat: Social sharing with dynamic OG image and verdict banner"
type: feat
status: active
date: 2026-03-13
---

# Social Sharing with Dynamic OG Image and Verdict Banner

## Overview

Enhance the share experience so shared calculation links show a rich preview card (OG image with a mini bar chart + verdict headline) on iMessage, Slack, Twitter, etc. — and when clicked, land the visitor on a page with a bold verdict banner at the top of the results.

Three deliverables:
1. **Verdict banner** — new component at the top of the results column (dashboard + shared view) with dynamic background color matching the winning scenario
2. **Dynamic OG image** — server-rendered image per shared calculation using `next/og`
3. **Social share dropdown** — share button opens a dropdown with LinkedIn, X/Twitter, and copy link options

## Problem Statement / Motivation

Currently, shared links produce a bare URL with generic metadata ("Rent vs. Buy Calculator"). There's no preview of what the calculation shows, and no immediate payoff when a visitor lands on the shared page. This makes calculations less shareable and less compelling when received.

## Proposed Solution

### Part 1: Verdict Banner (`verdict-banner.tsx`)

A banner component placed above `<SummaryCards>` in both `calculator-page.tsx` and `shared-view.tsx`. Displays a bold one-line verdict based on year-10 wealth comparison.

**Verdict logic** (`src/lib/calculator/verdict.ts`):
- Compare `rentWealth10yr` against the **best buy scenario** (highest `wealth10yr` among the 6 scenarios in `results.summaries`)
- Returns a `Verdict` object with `winner`, `text`, `difference`, `scenarioLabel`, and `bestBuyIndex`
- Note: `rentWealth10yr` uses the first price point's investment base (pre-existing behavior in `engine.ts:88`). This matches the existing `ScenarioComparisonChart` behavior. Fixing per-scenario rent wealth is out of scope for this feature.

**Verdict text templates:**
- Rent wins: `"Renting saves you $XXK at year 10"`
- Buy wins: `"Buying (${scenarioLabel}) builds $XXK more wealth by year 10"`
- Tie (within $5K): `"Renting and buying are roughly equal at year 10"`

**Format:** Use `fmtPrice()` from `src/lib/calculator/format.ts` for dollar amounts.

**Dynamic background color:**
- Rent wins or tie: rent color (`#E2EBF2`)
- Buy wins: the winning buy scenario's color from the chart palette (`["#f5ed68","#f6d164","#f7b460","#f7985b","#f87b57","#f95f53"]`), indexed by `bestBuyIndex`

**Actions slot:** The banner accepts an optional `actions` ReactNode prop. On the dashboard, the share button is rendered in this slot (right-aligned). On the shared view, no actions are shown.

### Part 2: Dynamic OG Image (`opengraph-image.tsx`)

A Next.js `ImageResponse` route at `src/app/share/[shareId]/opengraph-image.tsx`.

**How it works:**
1. Query DB via `getSharedCalculation(shareId)` helper (shared with `page.tsx`)
2. Call `computeResults(inputs)` server-side (pure function, no browser deps)
3. Render a 1200×630 image using Satori (via `ImageResponse`) containing:
   - Verdict headline text (same logic as the banner)
   - Simplified bar chart: 7 bars (1 rent + 6 buy scenarios) using CSS flexbox
   - Calculation name as subtitle
   - App branding
4. Use existing color palette: rent=`#E2EBF2`, buy scenarios=`["#f5ed68","#f6d164","#f7b460","#f7985b","#f87b57","#f95f53"]`

**OG image layout (1200×630):**
- Top: verdict headline in bold (~36px), centered
- Middle: 7 vertical bars in a row, each labeled below with scenario name (e.g., "Rent", "$1M/15yr"), bar heights proportional to max wealth value. Dollar value above each bar.
- Bottom: calculation name as subtitle, "Rent vs Buy Calculator" branding text

**Constraints:**
- Cannot use Recharts — Satori only supports CSS flexbox/absolute positioning
- Bars rendered as `<div>` elements with percentage heights relative to max wealth value
- Load DM Sans font via fetch for consistent typography

### Part 3: Share Page Metadata (`generateMetadata`)

Add `generateMetadata()` export to `src/app/share/[shareId]/page.tsx`. The shared DB query is extracted into `shared-data.ts` so `page.tsx`, `generateMetadata()`, and `opengraph-image.tsx` all reuse it:

- `og:title` — calculation name (fallback: "Rent vs Buy Calculation")
- `og:description` — verdict text
- `og:image` — points to the `opengraph-image.tsx` route (Next.js handles this automatically with co-located OG image files)
- `og:image:width` — 1200
- `og:image:height` — 630
- `og:image:alt` — verdict text
- `twitter:card` — `summary_large_image`

### Part 4: Social Share Dropdown (`share-button.tsx`)

The share button was enhanced from a simple copy-to-clipboard action to a dropdown menu with social sharing options:

- **LinkedIn** — opens LinkedIn's share dialog with the calculation URL pre-populated
- **X / Twitter** — opens a tweet compose with the URL and default message
- **Copy link** — copies to clipboard with checkmark feedback

The share URL is lazily generated on first use (POST to share API) and cached for subsequent clicks. Uses the existing `DropdownMenu` component from shadcn/ui.

## Technical Considerations

**Architecture:**
- `computeResults()` is pure and has no browser dependencies — safe to call in OG image route
- OG image route co-located at `src/app/share/[shareId]/opengraph-image.tsx` — Next.js automatically wires this as the OG image for that route segment
- Verdict logic extracted to `src/lib/calculator/verdict.ts` — shared between banner component and OG image route
- DB query extracted to `src/app/share/[shareId]/shared-data.ts` — shared between page, metadata, and OG image

**Performance:**
- OG image generation involves a DB query + `computeResults()` + Satori rendering. Cache with `revalidate: 3600` (1 hour) to avoid repeated computation. Shared calculations are snapshots, so staleness is acceptable.

**Edge cases:**
- Revoked/deleted share: OG image route should return 404 (platforms will show broken preview — acceptable since the share page itself also 404s)
- Negative wealth values: bars extend downward from a zero baseline
- Very long calculation names: truncate in OG image after ~40 chars

**Pre-existing limitation (out of scope):**
- `rentWealth10yr` uses only the first price point's investment base (`engine.ts:88`). This means the rent bar and rent wealth figure are only precisely accurate for comparisons against the first price point. The existing `ScenarioComparisonChart` has this same behavior. Fixing this would require changes to `computeResults()` return type and is a separate enhancement.

## Acceptance Criteria

### Verdict Banner
- [x] New `VerdictBanner` component in `src/components/calculator/verdict-banner.tsx`
- [x] Verdict logic extracted to `src/lib/calculator/verdict.ts` (shared between banner + OG image)
- [x] Banner renders above `SummaryCards` in `calculator-page.tsx`
- [x] Banner renders above `SummaryCards` in `shared-view.tsx`
- [x] Shows correct verdict for rent-wins, buy-wins, and tie scenarios
- [x] Background color matches the winning scenario's chart color
- [x] Updates dynamically when user changes inputs on the dashboard
- [ ] Responsive — text wraps gracefully on mobile
- [ ] Accessible — appropriate heading level or ARIA role

### Dynamic OG Image
- [x] New file `src/app/share/[shareId]/opengraph-image.tsx` using `ImageResponse`
- [x] Renders 1200×630 image with verdict headline + simplified bar chart
- [x] Uses same color palette as `ScenarioComparisonChart`
- [x] Handles missing/revoked shares (404)
- [x] Cached with `revalidate: 3600`

### Share Page Metadata
- [x] `generateMetadata()` added to `src/app/share/[shareId]/page.tsx`
- [x] Sets `og:title`, `og:description`, `og:image:alt`, `og:image:width`, `og:image:height`
- [x] Sets `twitter:card: summary_large_image`
- [ ] OG preview renders correctly when pasted into iMessage, Slack, or Twitter

### Social Share Dropdown
- [x] Share button opens dropdown with LinkedIn, X/Twitter, and Copy link options
- [x] LinkedIn opens share dialog with pre-populated URL
- [x] X/Twitter opens tweet compose with URL and default message
- [x] Copy link copies to clipboard with checkmark feedback
- [x] Share URL lazily generated and cached

## New Files

| File | Purpose |
|------|---------|
| `src/lib/calculator/verdict.ts` | Shared verdict logic (compare rent vs best buy at year 10, return verdict text + winning index) |
| `src/components/calculator/verdict-banner.tsx` | Verdict banner UI component with dynamic background color and actions slot |
| `src/app/share/[shareId]/opengraph-image.tsx` | Dynamic OG image generation |
| `src/app/share/[shareId]/shared-data.ts` | Shared DB query helper for fetching calculation by shareId |

## Modified Files

| File | Change |
|------|--------|
| `src/components/calculator/calculator-page.tsx` | Insert `<VerdictBanner>` with share button above `<SummaryCards>`, removed share button from sidebar |
| `src/components/calculator/shared-view.tsx` | Insert `<VerdictBanner>` above `<SummaryCards>` |
| `src/app/share/[shareId]/page.tsx` | Add `generateMetadata()` export, refactored to use `shared-data.ts` helper |
| `src/components/calculator/share-button.tsx` | Enhanced from copy-to-clipboard to dropdown with LinkedIn, X/Twitter, copy link |

## Dependencies & Risks

- **`next/og` compatibility**: `ImageResponse` is stable in Next.js 14+. Next.js 16 should support it. Verify import path (`next/og` or `@vercel/og`).
- **Font loading in OG image**: Satori requires explicit font file. DM Sans TTF fetched from Google Fonts static URL.
- **Platform caching**: iMessage, Slack, and Twitter all cache OG images aggressively. Updated calculations may show stale previews. This is inherent to OG images and not solvable server-side.

## Success Metrics

- Shared links render a rich preview card with chart + verdict on major platforms
- Visitors landing on shared links immediately see the key takeaway via the verdict banner
- Share button provides direct social sharing to LinkedIn and X/Twitter
- No regression in calculator page load performance (verdict computation is trivial)

## Sources & References

- Next.js OG Image docs: `next/og` ImageResponse API
- Existing bar chart colors: `src/components/calculator/scenario-comparison-chart.tsx:12-20`
- Existing breakeven banner pattern: `src/components/calculator/breakeven-banner.tsx`
- Share page DB query pattern: `src/app/share/[shareId]/shared-data.ts`
- Calculator engine: `src/lib/calculator/engine.ts` (pure function, server-safe)
- Format utility: `src/lib/calculator/format.ts` (`fmtPrice`)
