# Equation Audio Guide — visual thesis

## Direction: the annotated audio margin

The interface uses a tactile risograph collage, like a teacher's working copy passed between a print desk and a recording booth. Equations sit on cream paper, proposed speech is overprinted in petrol-blue ink, and unresolved choices are marked with tomato-red proofing tabs. Misregistration, clipped corners, halftone dots, and pencil-like rules make review state tangible without imitating a generic productivity dashboard. Decoration is limited to the editorial idea: notation going into a paper funnel and returning as spoken phrases.

This is deliberately a single light-paper treatment. The product is an authoring surface where a stable paper metaphor and predictable ink contrast aid long review sessions; dark OS settings retain the same explicitly painted canvas instead of recoloring mathematical meaning.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| paper | `#F3EBD8` | page background |
| sheet | `#FFF9EC` | editor and review sheets |
| ink | `#172A33` | primary type; 12.9:1 on paper |
| muted ink | `#526168` | secondary type; 5.5:1 on paper |
| petrol | `#006B68` | actions and approved marks; white text 5.9:1 |
| tomato | `#C83D2F` | ambiguity/proofing emphasis; dark ink alongside it |
| mustard | `#D5A51D` | collage and attention fields, never the only state cue |
| plum | `#65405B` | code notation and secondary ink |
| rule | `#A89D86` | large boundaries only |
| danger | `#9E241E` | destructive/error copy |

Texture uses low-opacity ink dots on painted backgrounds. State always includes wording, a symbol, or a shape in addition to color.

## Type

Two local/system families, with no network font requests:

- Editorial display: Georgia, `Times New Roman`, serif. Its looping figures make the guide feel like a marked-up textbook.
- Working copy: ui-monospace, `SFMono-Regular`, Consolas, monospace for controls, labels, source, equations, and narration edits. It distinguishes author instructions from article prose and keeps symbols stable.

Scale: 14px annotation, 16–18px body/control, 22px section heading, 34–60px display. Body leading is 1.55 and reading measure is capped near 68 characters.

## Spacing and layout

An 8px base rhythm with 4px micro-adjustments. Main gaps are 16, 24, 32, 48, and 72px. The landing header is an asymmetrical two-column paste-up; the workspace becomes a 5/7 source-to-review split at wide sizes. At 390px it becomes a single vertical working copy, removes only ornamental crop marks, and keeps every action at least 44px tall. Cards appear only for independent detected segments, with a left binding edge that encodes review state.

## Interaction grammar

- **Paste / type:** the source sheet accepts Markdown, fenced code, inline/display LaTeX, and MathML text. An example is a real starting point, never a fake placeholder.
- **Generate:** one strong petrol action turns the source into an ordered audio route. It never solves equations or sends content away.
- **Review:** each segment has editable narration, an ambiguity note when needed, and a three-state stamp: needs review, approved, revised. Editing an approved item moves it to revised.
- **Move through:** Previous/next ambiguity controls focus the relevant review card. Keyboard shortcut `Ctrl/Cmd + Enter` generates.
- **Export:** plain text and Markdown preserve source excerpts, narration, state, and checklist questions. Copy provides immediate live-region feedback.

## Motion

Only state-changing motion is used: newly generated cards lift in 12px over 220ms; stamps press down over 160ms; the hero's three paper layers drift once on load. No animation loops. With `prefers-reduced-motion: reduce`, transforms and scrolling animation are removed and content appears immediately. Offline state is static and announced.

## Original asset plan and provenance

### Hero illustration

Subject: an abstract printed textbook equation sheet passing through a handmade paper listening horn, emerging as orderly speech strips and check marks. World/materials: risograph ink, torn cream paper, halftone grain, imperfect two-color registration, rubber stamps, flat editorial collage. Light/lens: even scan-bed light, orthographic overhead composition. Palette words: warm paper, petrol blue, tomato red, mustard, charcoal. Negative list: no people, no realistic devices, no brands, no UI screenshot, no readable text, no watermark, no logo, no gradient, no glossy 3D.

Generated with the factory image model (`factory-image`) on 2026-08-28 using `/opt/fleet/lib/gen-image.sh`, 1536×1024 medium quality. The unmodified generation and exact prompt sidecar live in `assets/src/`; production WebP variants live in `public/assets/`. The image is original AI-generated artwork for this product and is disclosed in the footer. It illustrates the editorial workflow, not a synthetic voice capability.

### Hand-authored graphics

All interface marks (check, warning lozenge, waveform dividers, crop marks) are CSS or inline SVG created for this repository. No stock icons, copyrighted characters, third-party artwork, or remote assets are used.
