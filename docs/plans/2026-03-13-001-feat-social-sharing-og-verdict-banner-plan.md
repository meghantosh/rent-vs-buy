---
title: "feat: Social sharing with dynamic OG image and verdict banner"
type: feat
status: active
date: 2026-03-13
---

# Social Sharing with Dynamic OG Image and Verdict Banner

## Overview

Enhance the share experience so shared calculation links show a rich preview card (OG image with a mini bar chart + verdict headline) on iMessage, Slack, Twitter, etc. — and when clicked, land the visitor on a page with a bold verdict banner at the top of the results.

Two deliverables:
1. **Verdict banner** — new component at the top of the results column (dashboard + shared view)
2. **Dynamic OG image** — server-rendered image per shared calculation using `next/og`

## Problem Statement / Motivation

Currently, shared links produce a bare URL with generic metadata ("Rent vs. Buy Calculator"). There's no preview of what the calculation shows, and no immediate payoff when a visitor lands on the shared page. This makes calculations less shareable and less compelling when received.

## Proposed Solution

### Part 1: Verdict Banner (`verdict-banner.tsx`)

A banner component placed above `<SummaryCards>` in both `calculator-page.tsx` and `shared-view.tsx`. Displays a bold one-line verdict based on year-10 wealth comparison.

**Verdict logic:**
- Compare `rentWealth10yr` against the **best buy scenario** (highest `wealth10yr` among the 6 scenarios in `results.summaries`)
- Note: `rentWealth10yr` uses the first price point's investment base (pre-existing behavior in `engine.ts:88`). This matches the existing `ScenarioComparisonChart` behavior. Fixing per-scenario rent wealth is out of scope for this feature.

**Verdict text templates:**
- Rent wins: `"Renting saves you $XXK at year 10"`
- Buy wins: `"Buying (${scenarioLabel}) builds $XXK more wealth by year 10"`
- Tie (within $5K): `"Renting and buying are roughly equal at year 10"`

**Format:** Use `fmtPrice()` from `src/lib/calculator/format.ts` for dollar amounts.

**Styling:** Muted background similar to `BreakevenBanner`, single line, responsive text wrapping on mobile.

### Part 2: Dynamic OG Image (`opengraph-image.tsx`)

A Next.js `ImageResponse` route at `src/app/share/[shareId]/opengraph-image.tsx`.

**How it works:**
1. Query DB for the saved calculation's `inputs` (same query pattern as `share/[shareId]/page.tsx`)
2. Call `computeResults(inputs)` server-side (pure function, no browser deps)
3. Render a 1200×630 image using Satori (via `ImageResponse`) containing:
   - Verdict headline text (same logic as the banner)
   - Simplified bar chart: 7 bars (1 rent + 6 buy scenarios) using CSS flexbox
   - Calculation name as subtitle
   - App branding
4. Use existing color palette: rent=`#E2EBF2`, buy scenarios=`["#f5ed68","#f6d164","#f7b460","#f7985b","#f87b57","#f95f53"]`

**OG image layout (1200×630):**
- Top: verdict headline in bold (~32px), centered
- Middle: 7 vertical bars in a row, each labeled below with scenario name (e.g., "Rent", "$1M/15yr"), bar heights proportional to max wealth value. Dollar value above each bar.
- Bottom: calculation name as subtitle, "Rent vs Buy Calculator" branding text

**Constraints:**
- Cannot use Recharts — Satori only supports CSS flexbox/absolute positioning
- Bars rendered as `<div>` elements with percentage heights relative to max wealth value
- Load Dm-sans font via fetch for consistent typography

### Part 3: Share Page Metadata (`generateMetadata`)

Add `generateMetadata()` export to `src/app/share/[shareId]/page.tsx`. Extract the shared DB query into a helper function (e.g., `getSharedCalculation(shareId)`) so `page.tsx` and `generateMetadata()` can reuse it:

- `og:title` — calculation name (fallback: "Rent vs Buy Calculation")
- `og:description` — verdict text
- `og:image` — points to the `opengraph-image.tsx` route (Next.js handles this automatically with co-located OG image files)
- `og:image:width` — 1200
- `og:image:height` — 630
- `og:image:alt` — verdict text
- `twitter:card` — `summary_large_image`

## Technical Considerations

**Architecture:**
- `computeResults()` is pure and has no browser dependencies — safe to call in OG image route
- OG image route co-located at `src/app/share/[shareId]/opengraph-image.tsx` — Next.js automatically wires this as the OG image for that route segment
- Verdict logic should be extracted to a shared utility (e.g., `src/lib/calculator/verdict.ts`) so the banner component and OG image route use identical logic

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
- [ ] New `VerdictBanner` component in `src/components/calculator/verdict-banner.tsx`
- [ ] Verdict logic extracted to `src/lib/calculator/verdict.ts` (shared between banner + OG image)
- [ ] Banner renders above `SummaryCards` in `calculator-page.tsx` (around line 63)
- [ ] Banner renders above `SummaryCards` in `shared-view.tsx` (around line 32)
- [ ] Shows correct verdict for rent-wins, buy-wins, and tie scenarios
- [ ] Updates dynamically when user changes inputs on the dashboard
- [ ] Responsive — text wraps gracefully on mobile
- [ ] Accessible — appropriate heading level or ARIA role

### Dynamic OG Image
- [ ] New file `src/app/share/[shareId]/opengraph-image.tsx` using `ImageResponse`
- [ ] Renders 1200×630 image with verdict headline + simplified bar chart
- [ ] Uses same color palette as `ScenarioComparisonChart`
- [ ] Handles missing/revoked shares (404)
- [ ] Cached with `revalidate: 3600`

### Share Page Metadata
- [ ] `generateMetadata()` added to `src/app/share/[shareId]/page.tsx`
- [ ] Sets `og:title`, `og:description`, `og:image:alt`, `og:image:width`, `og:image:height`
- [ ] Sets `twitter:card: summary_large_image`
- [ ] OG preview renders correctly when pasted into iMessage, Slack, or Twitter

## New Files

| File | Purpose |
|------|---------|
| `src/lib/calculator/verdict.ts` | Shared verdict logic (compare rent vs best buy at year 10, return verdict text) |
| `src/components/calculator/verdict-banner.tsx` | Verdict banner UI component |
| `src/app/share/[shareId]/opengraph-image.tsx` | Dynamic OG image generation |

## Modified Files

| File | Change |
|------|--------|
| `src/components/calculator/calculator-page.tsx` | Insert `<VerdictBanner>` above `<SummaryCards>` |
| `src/components/calculator/shared-view.tsx` | Insert `<VerdictBanner>` above `<SummaryCards>` |
| `src/app/share/[shareId]/page.tsx` | Add `generateMetadata()` export |

## Dependencies & Risks

- **`next/og` compatibility**: `ImageResponse` is stable in Next.js 14+. Next.js 16 should support it. Verify import path (`next/og` or `@vercel/og`).
- **Font loading in OG image**: Satori requires explicit font file. Need to fetch Inter (or similar) woff/woff2 in the image route.
- **Platform caching**: iMessage, Slack, and Twitter all cache OG images aggressively. Updated calculations may show stale previews. This is inherent to OG images and not solvable server-side.

## Success Metrics

- Shared links render a rich preview card with chart + verdict on major platforms
- Visitors landing on shared links immediately see the key takeaway via the verdict banner
- No regression in calculator page load performance (verdict computation is trivial)

## Sources & References

- Next.js OG Image docs: `next/og` ImageResponse API
- Existing bar chart colors: `src/components/calculator/scenario-comparison-chart.tsx:16-23`
- Existing breakeven banner pattern: `src/components/calculator/breakeven-banner.tsx`
- Share page DB query pattern: `src/app/share/[shareId]/page.tsx:14-24`
- Calculator engine: `src/lib/calculator/engine.ts` (pure function, server-safe)
- Format utility: `src/lib/calculator/format.ts` (`fmtPrice`)
