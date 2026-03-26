---
name: eval-skills
description: Design and run lightweight evals for Codex skills using small prompt sets, deterministic trace checks, and rubric-based grading. Use when you want to make a skill more reliable, catch regressions, or choose which skills to evaluate first.
license: MIT
metadata:
  author: leojiang
  version: "1.0.0"
---

# Eval Skills

Evaluate skills the same way you would evaluate any other agent behavior: define what the skill should reliably do, run it against a small prompt set, score what actually happened, and grow the dataset from real failures.

This skill is especially useful when a skill feels valuable but brittle, or when changes to `SKILL.md`, supporting scripts, or trigger descriptions keep causing regressions.

Reference:
- OpenAI, [Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills)

## Use This Skill When

- You want to make an existing skill more reliable before wider use.
- You want to compare two versions of a skill after prompt or workflow changes.
- You need a lightweight eval harness instead of vibe-checking whether a skill "seems fine."
- You need to decide which of several existing skills are worth evaluating first.

## Core Principles

Start with the smallest loop that gives you trustworthy signal:

1. Make the skill behavior concrete enough to evaluate.
2. Manually trigger it first to expose hidden assumptions.
3. Build a small prompt set with positive and negative controls.
4. Use `codex exec --json` to score what actually happened from the trace.
5. Layer in rubric-based grading with `--output-schema` only after the deterministic checks are useful.
6. Add real failure cases back into the eval set over time.

Do not start with a giant benchmark or abstract scorecard. Small, explainable evals beat broad, noisy ones.

## Prioritize Skills By Leverage x Evalability

If you have real usage telemetry, use it. If you do not, rank candidates by:

- how often the skill is likely to be reused
- how costly a bad run is
- how easy it is to define a stable definition of done
- how easy it is to observe success from files, commands, or structured output

In practice, the best first eval targets usually look like this:

1. Artifact-producing skills
   - Strong first targets because they often have a crisp contract such as "write one HTML file," "produce one report," or "generate one config artifact."
   - Easy deterministic checks: output exists, expected sections exist, artifact is self-contained, required formats are present.

2. Structured review or analysis skills
   - Good eval targets when the output shape is tightly constrained, such as verdicts, required sections, or cited findings.
   - Good mix of deterministic checks for structure and rubric checks for severity calibration or signal-to-noise.

3. Narrow workflow skills with observable side effects
   - Useful when success can be observed from created files, changed PR text, uploaded media, or specific commands.
   - More setup-heavy than the first two categories, but still practical if the environment is reproducible.

4. Broad end-to-end implementation skills
   - Usually not the best first target because they hide many sub-problems behind one large score.
   - Evaluate them by slices: investigation quality, option quality, verification quality, and handoff quality.

5. High-variance introspection or retrospective skills
   - Often poor first eval targets because the input data is personal, noisy, and hard to fixture cleanly.
   - Save these until you have a stable eval pattern on simpler, more observable skills.

If you need one rule of thumb: start with the skill whose success is easiest to observe from artifacts or structure, not the skill that feels most important in the abstract.

## Workflow

### 1. Lock the skill contract before you score it

Write down:

- what prompts should trigger the skill
- what prompts should not trigger it
- the observable definition of done
- the few qualitative requirements that matter most

If the skill contract is vague, the eval will stay vague.

### 2. Manually trigger the skill first

Before automating, run the skill in a scratch directory or realistic repo and watch for:

- the skill not triggering when it should
- the skill triggering when it should not
- the agent skipping required steps
- hidden environment assumptions

Every manual fix you make here is a candidate future eval case.

### 3. Create a small prompt set

Use 10 to 20 prompts at first. Include:

- explicit invocation cases
- implicit invocation cases
- slightly noisy real-world cases
- negative controls that should not trigger the skill

Store the prompt set next to the skill under test, for example:

```text
skills/<skill-name>/evals/
├── prompts.csv
├── rubric.schema.json
├── run-evals.mjs
└── artifacts/
```

Keep eval assets close to the skill so updates stay coupled to the behavior they protect.

### 4. Add lightweight deterministic checks first

Use `codex exec --json` so you can inspect the structured trace instead of guessing from the final prose alone.

Deterministic checks should answer basic questions like:

- Did the expected command run?
- Did the expected file get created?
- Did the output include the required section headings?
- Did the skill avoid taking the wrong adjacent action?

These checks should be boring, fast, and easy to debug.

### 5. Add rubric-based grading for the qualitative layer

Once the basics are covered, add a second pass with `--output-schema` so the grader returns stable JSON you can compare over time.

Keep the rubric small. Prefer 3 to 6 checks that map directly to the skill contract over a large essay rubric.

Examples:

- artifact-producing skill: thesis clarity, narrative arc, visual usefulness, scanability
- structured review skill: blocker detection, severity calibration, missing-test quality, signal-to-noise
- broad implementation skill: investigation depth, option quality, recommendation clarity, verification quality

### 6. Grow the dataset from real misses

Whenever a run surprises you:

- add the prompt that exposed the miss
- add or tighten the deterministic check if possible
- only add rubric complexity when deterministic checks cannot express the requirement

The prompt set should become a living record of what the skill must continue to get right.

## Example Eval Design: Artifact-Producing Skill

Definition of done:

- writes one self-contained `.html` file
- includes a title, thesis, and clear section hierarchy
- follows the State → Intent → Direction arc unless the prompt clearly calls for another pattern
- contains at least one useful visual structure such as inline SVG or a table

Prompt set ideas:

- explicit: "Use this HTML report skill to turn this architecture audit into a standalone HTML deep dive"
- implicit: "Create a polished single-file HTML explainer for this migration plan"
- noisy: "Turn this repo investigation into something I can send to the CTO"
- negative: "Summarize this diff in markdown for a PR comment"

Deterministic checks:

- output HTML file exists
- contains `<title>` and a single `<html` root
- contains at least three section headings
- contains either `<svg` or `<table`
- contains inline `<style>`

Rubric checks:

- `thesis`
- `state_intent_direction`
- `visuals_help`
- `easy_to_scan`

## Example Eval Design: Structured Review Skill

Definition of done:

- returns one of the allowed verdicts
- includes blockers, concerns, nits, missing tests, what's good, and CI status sections
- prioritizes real risk over style chatter

Prompt set ideas:

- explicit: "Use this PR review skill to review PR #123"
- implicit: "Should this PR merge? Focus on blockers and missing tests"
- negative: "Summarize what changed in this PR"

Deterministic checks:

- verdict header exists
- all required sections exist
- at least one file reference appears when issues are reported
- CI status line exists

Rubric checks:

- `finds_real_risk`
- `severity_calibration`
- `test_gap_quality`
- `avoids_low_value_nits`

## Example Eval Design: Broad Implementation Skill

Do not start with a single giant end-to-end score.

Instead, evaluate slices:

- `investigation`: did it actually inspect the current state before editing?
- `options`: when tradeoffs existed, did it surface real options?
- `verification`: did it run meaningful checks?
- `pr_surface`: if it opened or updated a PR, was the review surface clear?

This skill is best evaluated after the repo has one or two simpler skill evals in place.

## Output

When using this skill, produce:

1. the target skill and why it was chosen first
2. a small prompt-set plan
3. deterministic checks to implement first
4. rubric checks only where needed
5. the next concrete change to make in the repo

If the user wants implementation, go ahead and scaffold the eval assets for the chosen skill instead of stopping at advice.
