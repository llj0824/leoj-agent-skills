# Beautiful Image Templates

## Table of Contents

```text
.
├── SKILL.md
├── AGENTS.md
├── index.json
├── agents/
│   └── openai.yaml
├── references/
│   └── midjourney-style-types.md
└── templates/
    ├── architectural-section.md
    ├── decision-atlas.md
    ├── forensic-evidence-board.md
    ├── ink-constellation.md
    ├── museum-wall-chart.md
    ├── philosophical-field-map.md
    ├── photographic-archive.md
    ├── risograph-knowledge-poster.md
    ├── scientific-handout.md
    └── systems-biology-diagram.md
```

## Operating Principle

An image template is a visual argument, not a bag of style words. Choose the template whose structure makes the subject easier to inspect.

For each request, separate four decisions:

1. `subject`: what the image is about
2. `information structure`: map, field, timeline, mechanism, evidence board, anatomy, feedback loop, etc.
3. `visual system`: drawing, photograph, print, blueprint, ink, risograph, archive, etc.
4. `production constraints`: aspect ratio, text accuracy, label density, palette, mood, and what to avoid

## Template Selection

Use `index.json` first. Shortlist three templates unless the user has already named one.

Choose by fit:

- Mechanisms, causal chains, stepwise explanations -> `scientific-handout`
- Tensions, assumptions, opposing forces -> `philosophical-field-map`
- Reader navigation, territory, decision points -> `decision-atlas`
- Layered concepts, foundations, hierarchy -> `architectural-section`
- Lineage, history, branching ideas -> `museum-wall-chart`
- Feedback loops, inputs, mediators, outputs -> `systems-biology-diagram`
- Associative idea density, quiet relationship maps -> `ink-constellation`
- Editorial energy with legible structure -> `risograph-knowledge-poster`
- Claims tested against examples -> `forensic-evidence-board`
- Concrete subject with archival authority -> `photographic-archive`

## Prompt Assembly

Build prompts in this order:

```text
Subject + information structure + composition + visual system + lighting + material/surface + palette + label/text policy + negative constraints
```

Use `references/midjourney-style-types.md` as vocabulary, especially:

- diagrammatic drawing, analytic drawing, infographic drawing, blueprint
- Japanese ink, etching, charcoal style, pastel drawing, one-line drawing
- risograph, old photograph, paper, engraving, matte, brushed
- ambient light, natural lighting, high key lighting, low key lighting, edge light
- wide view, top view, side view, profile
- monotone, red and black, gold and black, dramatic contrast

## Text And Labels

Image models are unreliable at exact spelling. If the artifact needs exact words, timestamps, names, or small labels:

- keep the image prompt label-light
- generate the visual background or structure first
- add the exact text with HTML/CSS, SVG, Canvas, or another deterministic overlay
- verify the rendered artifact visually

If the user only needs conceptual labels, keep them short and redundant: use region names, axes, arrows, and legends rather than sentence-length copy.

## Output Modes

Return the smallest useful artifact:

- `prompt only`: when the user is comparing visual directions or wants to use another generator
- `3 candidate prompts`: when selecting a direction
- `3x3 board`: when exploring broad style variety
- `generated image`: when an image tool is available and the user asked for the actual image
- `image + overlay`: when exact labels/timestamps matter

## Quality Bar

Good image-template output should make a viewer say: “I can tell what kind of information this is before I read the caption.”

Avoid:

- ornamental style terms with no information-design job
- generic cyberpunk, neon, fantasy, or cinematic styling for serious expert material
- illegible small text inside the generated image
- one-note palettes unless the template calls for it
- fake dashboards, fake UI cards, or decorative node graphs that do not encode real relationships
