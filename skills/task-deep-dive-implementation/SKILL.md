---
name: task-deep-dive-implementation
description: Understand a coding task's real intent, thoroughly investigate the current state, produce a ranked list of implementation options when tradeoffs exist, choose the recommended path, implement it, verify it, and open or update a PR. Start the work in a dedicated worktree and clean up that worktree after the PR is merged. Use when the user asks for a broad repo change with language like "take a look", "understand what's going on", "propose changes", "ranked list if needed", "go with your recommendation", "implement", or "open a PR when done."
---

# Task Deep Dive Implementation

Use this workflow for medium-sized coding tasks where the user wants both judgment and execution, not just code edits.

## Workspace Setup

1. Start a dedicated worktree before substantial implementation.
- Prefer a fresh linked worktree for this task instead of working directly in a shared checkout.
- Create a task-scoped branch and worktree path that make the PR purpose obvious.
- Treat that worktree as the home for investigation, implementation, verification, commits, and PR creation.
- If the user explicitly asks to stay in the current checkout, follow that instead.

## Workflow

2. Clarify the task and intent.
- Restate the user request in concrete delivery terms before doing heavy work.
- Infer the likely success condition, user-visible outcome, and review surface.
- If the request contains ambiguity, resolve what you can from local context before asking questions.

3. Investigate the current state thoroughly.
- Inspect the relevant code paths, tests, docs, recent commits, branches, and PRs as needed.
- Confirm what already exists, what is stale, what is missing, and what the current system behavior actually is.
- Prefer targeted exploration over broad repo narration.
- Summarize findings in task language, not file inventory language.

4. Produce a ranked list of options when tradeoffs are real.
- Use a ranked list only when there are multiple credible implementation paths.
- For each option, explain the tradeoff in one or two sentences.
- Recommend the option with the best value-to-complexity ratio.
- If there is one clearly correct path, skip the formal list and state the recommendation directly.

5. Implement the recommended path.
- Keep scope tight and aligned to the chosen approach.
- Prefer the simplest change that fully solves the task.
- Avoid fallback logic that hides broken primary paths unless the user explicitly wants that pattern.
- Make atomic commits when the work naturally splits into meaningful units.
- Preserve existing repo conventions, tests, and architectural boundaries unless the task requires changing them.

6. Verify before declaring success.
- Run the most relevant tests, linters, or live checks for the changed surface.
- Prefer the smallest high-signal verification set that proves the change.
- If some checks cannot be run, say so explicitly and explain the remaining risk.
- Re-read changed code and review diffs before moving to PR creation.

7. Open or update the PR.
- Treat the PR description as the primary review surface.
- Explain why the PR exists, what changed, why this implementation was chosen, and how it was verified.
- Include diagrams, schemas, and edge cases when they materially help review.
- If this work continues a prior PR chain, link the handoff clearly.

8. Clean up the task worktree after the PR is merged.
- After merge, return the primary checkout to a clean, up-to-date base branch.
- Remove the merged linked worktree when it is clean and no longer needed.
- Prefer an existing merge workflow that already handles worktree-aware cleanup when available.
- If cleanup cannot be completed safely, report exactly what remains and why.

## Recommendation Heuristics

- Prefer the option that closes the user request with the least new complexity.
- Prefer fixing root causes over cosmetic patches.
- Prefer local consistency with the repo over abstract purity.
- Prefer high-signal tests over broad but noisy verification.
- Prefer updating an existing PR narrative when the work belongs to that branch; open a fresh PR when it is a new scoped slice.
- Prefer isolated worktrees for parallel or potentially long-running tasks so cleanup is explicit and low-risk.

## Investigation Checklist

- What did the user most likely mean, beyond the literal phrasing?
- Should this begin in a fresh worktree and branch?
- What is the current behavior?
- What code or test surface already covers part of this?
- What changed recently that affects the task?
- Is the real gap implementation, verification, documentation, or PR hygiene?
- Does this belong in the current PR/branch, or should it become the next PR?
- How will the worktree be cleaned up once the PR lands?

## Output Shape

- Start with a concise understanding of the task.
- Set up the task in a dedicated worktree unless the user asked not to.
- Summarize the current state after investigation.
- Give a ranked options list only if needed.
- State the recommendation explicitly.
- Implement and verify without waiting for permission unless the decision has meaningful hidden consequences.
- Finish by opening or updating the PR, and when the PR is later merged, clean up the task worktree and summarize the outcome.
