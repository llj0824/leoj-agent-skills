---
name: agentic-engineering-codex-tape-review
description: Study recent Codex session logs as a deliberate-practice feedback loop for agentic engineering — surface patterns in task framing, agent scope creep, unnecessary complexity, and high-leverage collaboration.
license: MIT
metadata:
  author: leojiang
  version: "1.0.0"
---

# Agentic Engineering Codex Tape Review

Watch your own game tape. Study recent Codex session logs to understand how you frame work, how the agent responds, where complexity gets introduced, and where unnecessary back-and-forth comes from.

## Use This Skill When

- You want to improve how you work with coding agents.
- You suspect your task framing is creating ambiguity or scope creep.
- You want to understand when complexity comes from your framing vs the agent vs the task itself.
- Weekly or biweekly check-in on your agentic collaboration patterns.

## Context

- The goal is not just "better prompts" in the abstract, but understanding how work is framed, how the agent responds, where complexity gets introduced, and where unnecessary back-and-forth comes from.
- A recurring concern is that coding agents often add too much complexity. Understanding when that is caused by framing, when it is caused by the agent, and when it is inherent to the task is the core question.

## Data Source

- Codex session logs under: `~/.codex/sessions/`
- Focus on the last 7-14 days only. Default to 14 days if that gives better signal.
- These files can be huge. Inspect them selectively and intelligently rather than reading everything wholesale.

## How To Gather Data

1. List recent session files sorted by modification time:

```bash
ls -lt ~/.codex/sessions/ | head -40
```

2. Filter to sessions from the last 14 days:

```bash
find ~/.codex/sessions/ -type f -mtime -14 | sort
```

3. For each session, read selectively. Start with the first few hundred lines to understand the task framing, then skip to key turning points. Look for:
   - The initial user prompt (how the task was framed)
   - Points where the agent expanded scope or introduced complexity
   - Points where the user redirected or corrected the agent
   - The final outcome (clean completion vs messy back-and-forth)

4. Do not read entire session files wholesale. Skim structure first, then drill into interesting sections.

## Analysis

Study the sessions and report what patterns you see in how the user works with the agent. Do not give generic prompting advice. Focus on patterns in the evidence.

### What to look for

- How tasks are framed — specificity, scope, constraints provided.
- When the agent stays focused vs expands scope unprompted.
- When the user creates ambiguity that the agent fills with unnecessary complexity.
- When the agent introduces unnecessary complexity on its own.
- When the collaboration becomes efficient and high-leverage.
- Where back-and-forth seems avoidable in retrospect.
- What kinds of asks produce the cleanest work.
- Session length and turn count as rough signals of friction vs flow.

### Approach

- Be exploratory rather than overly prescriptive.
- Do not force everything into a rigid rubric upfront.
- Let repeated patterns emerge from the logs.
- Use concrete session examples and short citations/snippets when making claims.
- State tentative hypotheses, not fake certainty.

## Output

Structure the output as:

1. **Window and sessions analyzed** — date range, number of sessions reviewed, which ones you looked at closely.
2. **Main patterns** — the 3-5 most prominent patterns in the collaboration style.
3. **Sessions that went well** — concrete examples with short citations showing what made them clean.
4. **Sessions that created drag** — concrete examples with short citations showing where complexity or back-and-forth was introduced.
5. **Why these patterns are happening** — your best current interpretation of the causes.
6. **Tentative suggestions** — what to pay attention to next, without pretending the process is fully figured out.
7. **Worth tracking next week** — anything that warrants follow-up in the next tape review.

## Failure Recovery

- If `~/.codex/sessions/` does not exist or is empty, ask the user for the correct session log path.
- If session files are too large to read meaningfully, sample the first 200 lines and last 200 lines of each, plus any sections with high back-and-forth density.
- If the 14-day window has too few sessions, extend to 21 days and note the adjustment.
- If session format is unfamiliar, read one file first to understand the structure before analyzing the rest.
