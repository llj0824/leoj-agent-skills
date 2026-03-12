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

## Context

- Your current KPI is >1000 contributions/day.
- This is an imperfect but concrete, easy-to-measure target — preferred over vague ones.
- Your GitHub account may reflect work done by coding agents using your credentials, so account-attributed activity is not the same as personally-written code.
- What matters is understanding throughput, bottlenecks, rework, review/merge load, and how work is being shaped.

## Data Source

- Your GitHub activity from the last 7-14 days.
- Default to 14 days if that gives better signal. Do not go further back unless truly necessary.
- Use the GitHub CLI (`gh`) and GitHub API to pull activity: PRs opened/merged/closed, commits, reviews, issues, comments.

## How To Gather Data

Use `gh` to collect raw activity. Useful starting points:

```bash
# PRs authored in the last 14 days
gh pr list --author @me --state all --limit 200 --json number,title,state,createdAt,mergedAt,closedAt,additions,deletions,changedFiles,reviews

# Recent commits across repos
gh api graphql -f query='
{
  viewer {
    contributionsCollection(from: "<14-days-ago-ISO>", to: "<now-ISO>") {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}'

# Per-PR commit timestamps (for commit cadence analysis)
# For each PR, fetch commit timestamps to compute:
#   - median gap between commits
#   - first commit → PR open time
#   - last commit → merge time
gh api graphql -f query='
query($owner:String!, $repo:String!, $number:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$number) {
      commits(first:100) {
        nodes {
          commit {
            committedDate
          }
        }
      }
    }
  }
}'

# Review activity
gh pr list --reviewed-by @me --state all --limit 200 --json number,title,state,createdAt,mergedAt

# Issues
gh issue list --author @me --state all --limit 100 --json number,title,state,createdAt,closedAt
```

Adapt queries to the user's GitHub username and relevant repos. Pull from multiple repos if the user works across several.

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
- Commit cadence within PRs — gap between commits, how quickly PRs open after first commit, how long after last commit until merge.

### Approach

- Be exploratory rather than forcing everything into a predefined framework.
- Let patterns emerge from the evidence.
- Use exact examples and citations when making claims — link to specific PRs, commits, or issues.
- State tentative hypotheses, not fake certainty.

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

#### D. Commit Cadence / Agentic Loop

Median timing metrics for the commit-to-merge pipeline, by repo. This is the most diagnostic table for agentic engineering.

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
- If the user works across many repos, ask which repos to focus on rather than trying to pull everything.
- If the GraphQL contributions API returns empty data, fall back to per-repo PR and commit queries.
- If the 14-day window has too little data, extend to 21 days and note the adjustment.
