# Deep Dive HTML Evals

This directory scaffolds a lightweight eval loop for `deep-dive-html`.

It follows the same sequence recommended in `eval-skills`:

1. run realistic prompts against the actual skill
2. check deterministic artifact requirements first
3. optionally add rubric grading for the qualitative layer
4. save failures so the prompt set can grow over time

## Files

- `prompts.csv` — small prompt set of realistic deep-dive asks
- `fixtures/` — source material the skill should turn into HTML
- `run-evals.mjs` — runner that executes Codex, checks the generated artifact, and optionally runs rubric grading
- `rubric.schema.json` — structured grader output schema
- `artifacts/` — generated HTML outputs, ignored by git
- `results/` — run logs and summaries, ignored by git

## Usage

Run the deterministic checks:

```bash
node skills/deep-dive-html/evals/run-evals.mjs
```

Run one case only:

```bash
node skills/deep-dive-html/evals/run-evals.mjs --case architecture_audit
```

Add rubric grading:

```bash
node skills/deep-dive-html/evals/run-evals.mjs --rubric
```

Use a specific model:

```bash
node skills/deep-dive-html/evals/run-evals.mjs --model gpt-5
```

Set an explicit timeout:

```bash
node skills/deep-dive-html/evals/run-evals.mjs --timeout-ms 180000
```

## What This Checks

Deterministic checks currently verify that the output:

- exists at the requested path
- is one self-contained HTML document
- has a title
- has inline CSS
- uses CSS variables
- contains at least three headings
- contains a table or inline SVG
- includes print styles
- does not rely on external stylesheet or script tags

The rubric layer is intentionally small:

- thesis clarity
- State → Intent → Direction structure
- visual usefulness
- scanability
- self-contained artifact quality

## Notes

- The runner executes the real skill through `codex exec --full-auto --json`.
- The runner uses a timeout so one hung case does not block the full eval set.
- Artifacts and run logs are written under this directory so runs are easy to inspect.
- This is a first-pass harness for positive cases. Add negative controls after the prompt set stabilizes.
