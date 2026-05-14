---
name: beautiful-image-templates
description: Use when choosing, adapting, or generating polished image prompts from a reusable visual-template library. Helps select a visual system by purpose and mood, build prompt previews, use the bundled Midjourney-derived style vocabulary, and produce image-generation prompts or final images with consistent composition, lighting, material, and anti-gimmick constraints.
---

# Beautiful Image Templates

## Overview

Use this skill when the user wants a beautiful image, editorial visual, concept map, knowledge map, article illustration, podcast/interview visual, poster, hero image, research visual, or image-generation prompt built from a coherent visual system.

The library includes reusable image prompt templates, a template index, and a style vocabulary compiled from `midjourney辞典.pdf`. The goal is to pick the right visual grammar, adapt it faithfully to the user’s subject, and return either a ready-to-use image prompt or generated image artifacts.

## Source Files

- Operating manual: `AGENTS.md`
- Template index: `index.json`
- Prompt templates: `templates/`
- Style vocabulary: `references/midjourney-style-types.md`

## Workflow

Follow `AGENTS.md` as the source of truth for image-template tasks.

At a high level:

1. Ask for the image purpose, subject, audience, and desired mood when those are missing.
2. Read `index.json` and shortlist three templates by purpose, conceptual structure, mood, density, and text/label needs.
3. Build prompt previews for the three candidates using the user’s actual subject.
4. Ask the user to choose unless they already asked for a specific template or a full batch.
5. Generate the final prompt or image using the chosen template, preserving its composition grammar, style vocabulary, lighting, material, and constraints.
6. Return the final prompt and, when images are generated, show the produced image paths or rendered images.

## Important Constraints

- Do not mix templates casually. Each template is a closed visual system.
- Do not use a style only because it sounds impressive; choose it because it clarifies the subject.
- If exact text, timestamps, labels, or diagrams matter, prefer deterministic layout or post-processing for the text layer instead of trusting the image model to spell it correctly.
- For expert interviews and educational visuals, prioritize conceptual structure over decorative mood.
- Avoid gimmicky “dive / skim / skip” labels unless the user explicitly wants an itinerary. Prefer maps that let the reader make that decision.
- Preserve the selected template’s palette, lighting, surface, camera/composition, and negative constraints unless the user explicitly asks to change them.
