---
name: deep-dive-html
description: Create polished standalone HTML deep-dive explainers for research, investigations, architecture, strategy, and technical communication. Turns a task, system, plan, repo investigation, or technical explanation into a single-file HTML artifact with strong information design, inline SVG diagrams, and a technical publication aesthetic. Use when the output deserves more than markdown but less than a full app.
---

# Deep Dive HTML

## When to use this

Use this skill when:
- The output is a technical explanation, investigation, architecture overview, plan, or comparison
- The audience will read it in a browser (shared link, PR artifact, local file)
- Visuals (diagrams, tables, matrices) would genuinely help understanding
- The output should feel polished enough to send to a CTO or put in a design review

Do NOT use this when:
- A markdown file or Mermaid diagram in a PR description is sufficient
- The content is purely code (use a code review or diff instead)
- The content is ephemeral (a quick answer in chat is fine)
- The user just wants data, not a narrative

## Default page contract

Unless the user explicitly wants something more editorial or visually expressive, default to:
- A single main content column
- A lightweight top-of-page TOC for multi-section pieces
- One direct hero with thesis and lede
- A current-state, ranked-findings, or priorities block before deep architecture sections when the artifact supports a decision
- 3-5 focused sections after the opening
- 1-3 diagrams total for most pieces
- Tables for status, comparisons, or coverage when they scan better than cards
- One primary surface style and at most one secondary emphasis style

Avoid by default:
- Sticky sidebars for short documents
- Decorative side rails
- Architecture-first openings when the real task is prioritization or readiness
- Glassmorphism, ornamental gradients, or concept-page styling
- Too many card types, grid systems, or visual motifs in one page
- Diagrams that repeat headings instead of answering a reader question

When in doubt, choose the calmer, more memo-like option.

## Output format

One self-contained `.html` file:
- Inline CSS (no external stylesheets)
- Inline SVG for all diagrams (no external images unless user provides URLs)
- CSS variables for all colors (including SVG fills) so dark mode works
- Dark mode via `prefers-color-scheme: dark`
- Print styles via `@media print`
- Minimal or zero JavaScript (smooth-scroll TOC is the exception)
- Opens cleanly via `file://` protocol
- Default location: `docs/<slug>.html` in the working repo

## Workflow

### 1. Determine artifact type

| Type | When |
|------|------|
| System deep dive | Explaining how a system works end-to-end |
| Investigation summary | Reporting findings from a codebase or system audit |
| Architecture explainer | Documenting boundaries, ownership, data flow |
| Product walkthrough | Step-by-step how a feature or workflow operates |
| Plan / roadmap | Phased delivery, migration, or strategy |
| Technical comparison | Evaluating options, tradeoffs, approaches |

### 2. Gather source material

Read only the artifacts needed to explain the task accurately: repo files, notes, schema, screenshots, or relevant pages. If the user already has a draft artifact, inspect that before redesigning.

**Key rule:** Read before you write. Never fabricate system details.

### 3. Decide whether the artifact is for decision-making or reference

If decision-making, lead with:
- Thesis
- Current gap or recommendation
- Ranked findings, priorities, or status

Only move into deeper architecture after the reader understands what matters.

If reference, still open with a concise thesis and orientation block before deeper sections.

### 4. Plan the narrative structure

Good technical deep dives follow this arc:
1. **TOC** at the top (with anchor links) when 3+ sections
2. **Lede / thesis** — one paragraph that tells the reader what this is about and why it matters
3. **Current gap, ranked board, or recommendation block** when relevant
4. **High-level view** — only after the decision frame is established
5. **3-5 focused sections** — each with a clear heading, a visual if it helps, and concise prose
6. **Diagrams beside the claims they support** — never orphaned at the bottom
7. **Closing** — ranked takeaways, acceptance criteria, or next steps

### 5. Choose visualizations

Use the lightest visualization that makes the point clearer than prose alone.

| Visualization | Use when |
|--------------|----------|
| Topology / boundary diagram | Reader needs to know what lives where |
| Sequence / swimlane | Time order matters (request flows, pipelines) |
| State / loop diagram | System revisits components or branches |
| Status or comparison table | Reader needs to scan multiple items quickly |
| Ownership matrix | Many-to-many relationships (components, teams) |
| Ranked board / scorecards | Order matters more than topology |
| Timeline | Phased plans, incidents, rollouts |

Prefer a table over a card grid when the content is mostly labels, status, and short explanations.

**Anti-patterns:**
- Do not add visuals that restate a heading
- Do not use decorative charts with no underlying data
- Do not turn every paragraph into a card
- Do not repeat the same visualization type throughout
- Do not spend the opening screen on architecture if the real job is priorities or readiness
- Do not use many equal-weight card grids where a table would scan faster

### 6. Apply a visual budget

For most artifacts:
- 1 hero block
- 1 opening status or priorities block
- 1 primary figure above or near the fold
- 0-2 additional figures in the body
- 0-2 tables when they improve scan speed

If the page starts accumulating many card species, competing grids, or multiple ornamental motifs, simplify. Prefer one strong figure and one strong table over five decorative cards.

### 7. Build the HTML

**Visual direction:**
- White or near-white background
- Restrained accent colors through CSS variables
- Clean sans-serif typography
- Generous whitespace
- Strong figure captions on every diagram
- Low-noise cards and separators
- Tables for high-density status or comparison content

**Avoid:**
- Beige/paper textures (unless explicitly requested)
- Heavy ornamental gradients
- Giant walls of paragraph text
- Generic AI landing-page aesthetic
- Decorative diagrams that don't explain anything
- Hardcoded SVG colors when CSS variables will do
- Many equal-weight modules before the core thesis lands

### 8. Add metadata

Include in the artifact:
- Title and subtitle
- Date with minute precision (for active decision-making artifacts)
- Scope statement (what this covers and what it doesn't)
- Author or source attribution if relevant

### 9. Verify

At minimum:
- [ ] HTML opens cleanly in browser
- [ ] First screen explains the thesis before deep detail
- [ ] Hierarchy reads well — headings, spacing, visual weight guide the eye
- [ ] Diagrams are legible without zooming
- [ ] Tables or ranked boards scan quickly
- [ ] Page doesn't feel like blocks of text or like a design exercise
- [ ] Dark mode looks correct
- [ ] No placeholder text remains

## Structural Patterns

### Investigation / research
1. Lede and thesis
2. Current finding or proof block
3. Evidence table
4. High-level figure only if it clarifies the findings
5. Ranked findings or recommendations

### System deep dive
1. Thesis
2. Topology diagram
3. Runtime lanes or sequence view
4. Ownership or schema visuals
5. Failure-path callouts

### Plan / roadmap
1. Concise thesis
2. Current-vs-target or gap block
3. Ranked work board
4. Milestone or dependency visualization
5. Success criteria

### Technical comparison
1. Explicit winner or tradeoff thesis
2. Comparison table near the top
3. 2-4 focused dimensions
4. Supporting figures only where visual evidence helps
5. Closing recommendation

## SVG Diagram Guidelines

When building inline SVGs:
- Use `var(--ink)`, `var(--muted)`, `var(--blue)`, `var(--jade)` etc. for colors so they adapt to dark mode
- Use `role="img"` and `aria-label` for accessibility
- Keep text labels short (2-4 words per node)
- Use rounded rectangles (`rx="8"`) for nodes
- Use clear directional arrows for flows
- Size viewBox to content — don't pad excessively
- Always add a `<figcaption>` describing what the diagram shows
- Test that the diagram is legible at the rendered width without zooming

## Output Standard

Deliver a static HTML artifact that:
- Looks like a polished technical company post
- Reads like a clear internal deep dive rather than a marketing page
- Makes the main thesis understandable from the first screen
- Puts current gap, priorities, or recommendations near the top when relevant
- Uses diagrams and visualizations only when they materially clarify the explanation
- Uses tables when they improve scan speed over cards
- Is clear enough to skim in under 30 seconds
- Is self-contained enough to keep as `docs/*.html` or delete without cleanup
