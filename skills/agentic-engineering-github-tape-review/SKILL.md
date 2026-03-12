---
name: agentic-engineering-github-tape-review
description: Study your recent GitHub activity as a deliberate-practice feedback loop for agentic engineering — surface throughput patterns, bottlenecks, rework, and leverage points across the last 7-14 days.
license: MIT
metadata:
  author: leojiang
  version: "1.0.0"
---

# Agentic Engineering GitHub Tape Review

Watch your own game tape. Study recent GitHub activity to find what is helping and what is slowing you down as an agentic engineer.

## Use This Skill When

- You want a structured retrospective on your GitHub throughput.
- You suspect hidden bottlenecks in review, merge, rework, or agent-attributed activity.
- You are doing deliberate practice on agentic engineering and need concrete evidence to calibrate on.
- Weekly or biweekly check-in on contribution patterns.

## What We Are Actually Trying To Learn

Do not start by asking for every possible GitHub artifact.

The job is to answer a small set of diagnostic questions:

- Is work flowing or piling up?
- Which repos are healthy vs churny?
- Are work units too large or poorly scoped?
- Is the bottleneck implementation, review, or decision-making?
- Which exact PRs best illustrate the pattern?

Treat the PR as the default unit of analysis. Commits, reviews, issues, and comments are supporting evidence, not the starting point.

## Context

- Your current KPI is >1000 contributions/day.
- This is an imperfect but concrete, easy-to-measure target — preferred over vague ones.
- Your GitHub account may reflect work done by coding agents using your credentials, so account-attributed activity is not the same as personally-written code.
- What matters is understanding throughput, bottlenecks, rework, review/merge load, and how work is being shaped.

## Default Data Contract

For the default pass, only gather data that is needed to answer the questions above:

- contribution totals by day for the selected window
- PRs created in the window for the selected repos
- for each PR:
  - repo
  - number
  - title
  - state
  - `createdAt`
  - `mergedAt`
  - `closedAt`
  - `additions`
  - `deletions`
  - `changedFiles`
  - `commits.totalCount`
  - URL

This is enough to compute:

- daily contribution chart
- authored PR volume
- merged / closed-unmerged / open split
- active repos
- median merge time
- open PR age
- PR size metrics by repo
- merged vs closed-unmerged patterns

Do not fetch per-PR commit timestamps, detailed review events, issues, or comment threads unless the user asks for a deeper diagnosis or the first pass reveals a suspicious cluster that needs explanation.

## Time Window

- Default to `7d` for queue pressure and current operating rhythm.
- Use `14d` only if `7d` is too sparse.
- Go beyond `14d` only when the user explicitly wants a broader trend or the data is too thin.

## Repo Scope

- Start with the top 1-3 repos that matter for the user.
- Prefer repo-scoped pulls over one giant cross-GitHub sweep.
- If the user works across many repos and has not said which matter, focus on the repos with visible PR pressure first.

## Call Budget

Optimize for the fewest useful `gh` calls, not maximum completeness.

Default target:

- 1 call for contribution totals and daily counts
- 1 PR metadata search call per repo, usually paginating only when a repo exceeds 100 PRs in the window

Rough default budget:

- `1 + sum(ceil(PRs_in_repo / 100))`

Avoid an N+1 pattern where the skill makes one extra API call for every PR.

## Workflow

### 1. Run the cheap first pass

Use one contributions query for the selected window, then one repo-scoped PR metadata query per repo.

Preferred default:

```bash
# 1) Contribution totals and daily counts
gh api graphql -f query='
query($login:String!, $from:DateTime!, $to:DateTime!) {
  user(login:$login) {
    contributionsCollection(from:$from, to:$to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
    }
  }
}'

# 2) Repo-scoped PR metadata
gh api graphql -f query='
query($search:String!, $first:Int!, $after:String) {
  search(query:$search, type:ISSUE, first:$first, after:$after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        number
        title
        state
        mergedAt
        closedAt
        createdAt
        additions
        deletions
        changedFiles
        commits { totalCount }
        url
      }
    }
  }
}'
```

If the repo set is already known and small, it is acceptable to compress several repo searches into one GraphQL request using aliases. Do this only when it keeps the query readable.

### 2. Build the dashboard from the first pass

Use the cheap first-pass data to produce the main dashboard. This should be the default output path.

### 3. Escalate only when the user asks or the first pass reveals ambiguity

Only go deeper when one of these is true:

- the user explicitly asks for commit cadence, review latency, or PR archaeology
- a repo has a large closed-unmerged cluster and you need to distinguish failure modes
- a small set of PRs looks anomalous and needs explanation

Deep-dive targets:

- per-PR commit timestamps
- review timeline / review requests
- issue links
- comment threads

Deep-dive rule:

- fetch supporting detail only for a flagged subset, usually 3-10 PRs
- never fetch full commit timelines for every PR in the window

## Analysis

Study the activity and report what seems to be happening. Do not give generic productivity advice. Focus on patterns in the evidence.

### What to look for

- Where work moved cleanly from open to merge.
- Where work got stuck, recut, or superseded.
- Where review/merge burden seems high.
- Where visible activity may be hiding a different real bottleneck.
- What kinds of work units seem to create leverage vs drag.
- Daily contribution counts relative to the >1000/day target.
- Ratio of agent-attributed vs manually-driven work if distinguishable.
- Commit cadence within PRs only when a deep dive is justified.

### Approach

- Be exploratory rather than forcing everything into a predefined framework.
- Let patterns emerge from the evidence.
- Use exact examples and citations when making claims — link to specific PRs, commits, or issues.
- State tentative hypotheses, not fake certainty.
- Prefer sufficiency over exhaustiveness. If one cheap pass answers the question, stop there.

## Output

The output has two parts: a **dashboard** (tables and charts — the quantitative overview) followed by **written analysis** (patterns, examples, diagnosis). The dashboard comes first so the reader has the full picture before any interpretation.

All time values should be in **minutes** (e.g., `29min`), not fractional hours.

---

### Part 1: Dashboard

Present these sections in order. After each table or chart, include a short "What this shows" block (2-3 bullets) explaining what the visualization conveys and why it matters for agentic engineering diagnosis.

#### A. Window & Topline Numbers

A summary table covering the analyzed date range, followed by a daily contribution bar chart.

```
GitHub Activity Analysis: <start date> – <end date>

<N> days analyzed · UTC+<offset> window

┌─────────────────────────────────┬───────┐
│ Metric                          │ Count │
├─────────────────────────────────┼───────┤
│ Total contributions             │       │
│ Restricted contributions        │       │
│ Visible authored PRs created    │       │
│ Visible authored PRs merged     │       │
│ Closed unmerged                 │       │
│ Still open                      │       │
│ PR reviews authored             │       │
│ Active repos                    │       │
└─────────────────────────────────┴───────┘
```

**What this shows:** The control panel for the whole window. Total contributions vs restricted tells you how much of the activity is even visible for analysis. The merged/closed/open split is the first signal of whether work is flowing or accumulating. Active repos tells you how spread out attention is.

Then a daily contribution bar chart:

```
<date>: ████████████████████     46
<date>: ████████████████████████████████████ 90  ← peak
<date>: ███████                  17  ← trough
```

**What this shows:** The shape of work over time — burst days, quiet days, weekday/weekend patterns. Annotate the peak and trough. This helps spot whether throughput is steady or spiky, which matters because spiky patterns often correlate with batch-then-stall cycles in agentic workflows.

Note any caveats (restricted contributions, partial days, etc.) directly below.

#### B. Repo Flow Summary

One row per active repo. Shows where the queue pressure is and which repos have clean flow vs churn.

```
┌──────────────────┬────┬────────┬────────┬──────┬───────────┬─────────────┐
│ Repo             │ PR │ Merged │ Closed │ Open │ Med Merge │ Med Commits │
├──────────────────┼────┼────────┼────────┼──────┼───────────┼─────────────┤
│ org/repo-a       │ 68 │ 51     │ 14     │ 3    │ 29min     │ 3.0         │
│ org/repo-b       │ 22 │ 22     │ 0      │ 0    │ 53min     │ 2.0         │
└──────────────────┴────┴────────┴────────┴──────┴───────────┴─────────────┘
```

**What this shows:** Which repos are flowing and which are churning. A repo with many closed-unmerged PRs is paying a recutting tax — work was started then abandoned. Median merge time shows queue health. Median commits per PR shows how granular the work units are. Comparing across repos reveals whether the drag is systemic or localized.

#### C. PR Size Summary

Median per-PR size metrics by repo. Shows how large the work units are and whether deletion/cutover is happening.

```
┌──────────────────┬──────────────┬─────────┬─────────┬──────────┐
│ Repo             │ Med Files/PR │ Med +LOC│ Med -LOC│ Med Churn│
├──────────────────┼──────────────┼─────────┼─────────┼──────────┤
│ org/repo-a       │ 9.0          │ 244     │ 29      │ 321      │
│ org/repo-b       │ 2.0          │ 286     │ 3       │ 333      │
└──────────────────┴──────────────┴─────────┴─────────┴──────────┘
```

**What this shows:** PR size is one of the strongest predictors of merge friction. High files/PR often means multi-concern PRs that are hard to review. A repo with high -LOC is doing active simplification or cutover, which is often leverage rather than waste. Comparing Med +LOC vs Med -LOC across repos reveals which repos are growing vs being pruned. If a repo has high churn but also high closed-unmerged PRs, the size alone isn't causing drag — the seam choice is.

#### D. Optional Commit Cadence / Agentic Loop

Include this section only when the user asked for deeper diagnosis or when the first pass flagged a small set of PRs that justify extra API calls.

Median timing metrics for the commit-to-merge pipeline, by repo. This is a high-value deep-dive table, not part of the default cheapest path.

```
┌──────────────────┬────────────────┬──────────────────────┬────────────────────────┐
│ Repo             │ Med Gap Commit │ Med 1st Commit→Open  │ Med Last Commit→Merge  │
├──────────────────┼────────────────┼──────────────────────┼────────────────────────┤
│ org/repo-a       │ 12min          │ 1min                 │ 7min                   │
│ org/repo-b       │ 10min          │ 1min                 │ 11min                  │
└──────────────────┴────────────────┴──────────────────────┴────────────────────────┘
```

**What this shows:** Three intervals that mean different things for agentic workflows:

- **Med Gap Commit** — median time between consecutive commits within a PR. Shows whether work is continuous or interrupted. Short gaps suggest an agent or human in a tight loop. Long gaps suggest context switching, stalls, or waiting on something.
- **Med 1st Commit→Open** — how quickly work enters the review queue after starting. Near-zero means PRs open immediately (typical of agentic workflows). Longer gaps mean code sits locally before becoming visible.
- **Med Last Commit→Merge** — decision/review latency after the code is done. This is the "last mile" — if this is large relative to merge time, the bottleneck is approval, not implementation. For self-merging agentic workflows this should be near-zero; if it isn't, something is gating the merge.

---

### Part 2: Written Analysis

After the dashboard, provide written analysis in these sections:

#### E. Main Patterns

The 3-5 most prominent patterns found in the data. For each pattern:

1. A short name (e.g., "Recut pattern", "Clean decomposition", "Simplification as leverage").
2. 2-3 sentences describing what happened and why it matters.
3. 2-4 concrete PR citations with links.
4. A "Best interpretation" sentence — tentative, not certain.

#### F. Annotated Examples

3-5 specific PR clusters that best illustrate the patterns. For each, state:
- Which PRs (with links)
- What happened (2-3 sentences)
- Size (files, LOC)
- Cycle time
- Read: leverage / drag / neutral — and why

#### G. Diagnosis

Two lists:
- **What seems to help** — patterns that correlate with clean throughput, with 1-sentence evidence each.
- **What seems to slow you down** — patterns that correlate with drag, rework, or stalls, with 1-sentence evidence each.

Then a **"Current best interpretation"** paragraph — the single most important insight from this window, clearly flagged as tentative.

#### H. What Could Happen Better

Describe the current failure mode and the recommended target workflow in prose. Be concrete — reference the specific repos and PR patterns where the change would apply.


#### I. Practice / Habits to Work On This Week

2-4 concrete practices derived from the patterns found. Each should be specific enough to act on immediately and tied to evidence from this window.

## Failure Recovery

- If `gh` is not authenticated, prompt the user to run `gh auth login`.
- If the user works across many repos, start with the 1-3 repos carrying the most PR pressure rather than trying to pull everything.
- If the GraphQL contributions API returns empty data, fall back to per-repo PR metadata queries.
- If the 14-day window has too little data, extend to 21 days and note the adjustment.
- If a deep-dive GraphQL path is slow or rate-limited, keep the dashboard based on the cheap pass and say which deeper metrics were skipped.
