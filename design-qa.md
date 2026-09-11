# Homepage visual QA — template 1 correction

Reference visual: Product Design option 1 (`exec-7219cea8-ca98-4c49-8974-7d4aa90b8f54.png`).

## Summary

- Overall status: **Passed**
- Primary conversion path: headline → Build Your Fleet / Watch Riding Video → category or partnership detail.
- Browser review: local `/en` in the Codex in-app browser at desktop and 390 × 844 mobile widths.

## Visual fidelity checks

| Area | Result | Notes |
| --- | --- | --- |
| Header | Pass | Thin white navigation, dark wordmark, lime quote CTA and compact mobile header retain the template's visual hierarchy. |
| Hero | Pass | The desktop version now uses the selected template-one rider composition, white nav hierarchy, right-side campaign note and three-item lower proof strip. Mobile uses a dedicated 9:16 rider image so headline, rider and CTA remain visible without destructive cropping. |
| Product range | Pass | Navy three-column grid, upper-right product overview, dividers, product descriptions, three-value specification rows and category links match the source layout. The real product photos remain transparent display assets, removing their white canvas and the prior dark-blend visibility failure. |
| Partnership | Pass | White editorial block now follows the selected source: a top horizontal statistics strip, title and program CTA to the left, and export image with caption to the right. |
| Mobile stacking | Pass | Product cards stack with a visible, uncropped product per card; proof text and CTAs are no longer obscured by floating controls. |

## Functional and accessibility checks

- Header, hero, product and partnership links use existing routes; the mobile header retains both WhatsApp and quote actions.
- Product photos have meaningful alt text and the transparent treatments use the actual catalog images, not invented products.
- The previously verified H.264/AAC video modal remains unchanged and functional.
- Homepage-only floating controls are hidden because their redundant actions were obscuring the source-matched mobile layout; equivalent header and hero actions remain available.

## Build checks

- `pnpm run lint`: passed (`tsc --noEmit`).
- `pnpm run build`: passed (Next.js production build).
- `git diff --check`: passed.

## Final result: passed
