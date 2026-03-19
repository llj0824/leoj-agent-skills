---
name: review-pr
description: "Review a GitHub PR for mergeability, risk, missing tests, and code smells. Produces a structured reviewer-facing summary with severity-ranked blockers. Use when asked to review a PR, check if something is mergeable, or assess PR quality."
---

# Review PR

## Arguments

- `$ARGUMENTS` — PR number, URL, or branch name. If omitted, use the current branch's open PR.

## Goal

Act as a skeptical but constructive reviewer. Answer: **"Should this merge? What's the risk? What's missing?"** Output a structured review the PR author can act on immediately.

## Workflow

### 1) Find the PR

```bash
# If PR number/URL given, use it directly
# If branch name given or no argument:
gh pr view --json number,title,body,state,url,baseRefName,headRefName,mergeable,mergeStateStatus,statusCheckRollup,additions,deletions,changedFiles,reviews,labels
```

- If no open PR exists for the current branch, say so and stop.
- If the PR is already merged or closed, say so and stop.

### 2) Gather the diff

```bash
# Full diff for analysis
gh pr diff <number>

# File list with change counts
gh pr diff <number> --stat
```

- For large PRs (1000+ lines), focus on the files with the most changes and any files touching: auth, payments, migrations, API contracts, security, or config.
- Read specific files with the Read tool if you need more context than the diff provides.

### 3) Check CI and merge status

From the PR JSON in step 1, extract:
- `mergeable` — can it merge cleanly?
- `mergeStateStatus` — is it blocked, behind, or clean?
- `statusCheckRollup` — which checks passed/failed/pending?

If CI is failing, identify which checks and why before continuing.

### 4) Review the code

Evaluate across these dimensions (skip any that don't apply):

**Correctness**
- Does the code do what the PR title/description claims?
- Are there logic errors, off-by-one, race conditions, or missed edge cases?
- Do the types/schemas match the runtime behavior?

**Risk**
- What breaks if this code fails at runtime? (error paths, fallbacks, user impact)
- Does it touch shared state, database schema, API contracts, or auth?
- Is there a migration? Is it reversible?
- Could it cause data loss or corruption?

**Missing coverage**
- Are there tests for the new behavior?
- Are error paths tested?
- Are there obvious test cases that should exist but don't?

**Code quality**
- Is the code readable without the PR description?
- Are there naming issues, dead code, or unnecessary complexity?
- Does it follow the existing patterns in the codebase?

**Security**
- Input validation on user-facing surfaces?
- SQL injection, XSS, command injection, or IDOR risks?
- Secrets, tokens, or credentials in the diff?

### 5) Produce the review

Use this structure exactly:

```
## Verdict: [MERGE | MERGE WITH NITS | NEEDS CHANGES | BLOCK]

**One-sentence summary** of the PR and its risk level.

## Blockers (must fix before merge)
<!-- Severity: HIGH. Empty section if none. -->
1. **[File:line]** Description of the blocking issue.

## Concerns (should fix, not blocking)
<!-- Severity: MEDIUM. -->
1. **[File:line]** Description of the concern.

## Nits (take or leave)
<!-- Severity: LOW. -->
1. **[File:line]** Suggestion.

## Missing tests
<!-- List specific test cases that should exist. -->
- Test case description → expected file/location

## What's good
<!-- Acknowledge things done well. Be specific, not generic. -->
- Specific positive observation.

## CI Status
- Checks: [passing/failing/pending]
- Merge status: [clean/blocked/behind]
```

### Verdict criteria

| Verdict | When to use |
|---------|-------------|
| **MERGE** | No blockers, no concerns, CI green. Ship it. |
| **MERGE WITH NITS** | No blockers, minor nits only, CI green. Author can address nits post-merge or ignore. |
| **NEEDS CHANGES** | Has concerns that should be fixed but nothing dangerous. One more round. |
| **BLOCK** | Has blockers: security issue, data loss risk, broken CI, logic error in critical path, or missing migration. Do not merge. |

## What NOT to do

- Do not rubber-stamp. If the PR is risky, say so clearly.
- Do not nitpick style if the codebase has no linter enforcing it.
- Do not review files outside the PR diff unless the diff reveals a dependency issue.
- Do not suggest rewrites or refactors that aren't related to the PR's purpose.
- Do not produce a wall of text. Rank by severity, be concise.

## Useful commands

```bash
# View PR details
gh pr view <number> --json number,title,body,state,url,mergeable,mergeStateStatus,statusCheckRollup,additions,deletions,changedFiles

# Get diff
gh pr diff <number>
gh pr diff <number> --stat

# Check existing reviews
gh pr view <number> --json reviews

# View specific review comments
gh api repos/{owner}/{repo}/pulls/<number>/comments

# Check CI details
gh pr checks <number>
```
