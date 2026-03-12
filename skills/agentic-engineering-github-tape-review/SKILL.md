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

# Repo default-branch commit history (for repo-level commit rhythm)
# Use this to compute:
#   - median gap between landed commits
#   - p90 gap between landed commits
#   - longest gap between landed commits
# This naturally includes normal commits, merge commits, squash merges,
# rebased landings, and direct pushes that landed on the default branch.
gh api graphql -f query='
query($owner:String!, $repo:String!, $since:GitTimestamp!, $until:GitTimestamp!) {
  repository(owner:$owner, name:$repo) {
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(first:100, since:$since, until:$until) {
            totalCount
            nodes {
              oid
              committedDate
              parents {
                totalCount
              }
            }
          }
        }
      }
    }
  }
}'

# If you need more than 100 landed commits in the window,
# paginate the default-branch history rather than switching
# to per-PR commit timeline queries.

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
- Repo-level rhythm of landed commits — whether repos update continuously or in bursts.

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

#### D. Repo Commit Rhythm

Median timing metrics for landed commits on each repo's default branch. This shows how continuously each repo is being updated, regardless of whether the change landed via direct push, merge commit, squash merge, or rebase.

```
┌──────────────────┬────────────────┬────────────────┬─────────────┬────────────────┐
│ Repo             │ Commits Landed │ Med Gap Commit │ P90 Gap     │ Longest Gap    │
├──────────────────┼────────────────┼────────────────┼─────────────┼────────────────┤
│ org/repo-a       │ 91             │ 11min          │ 74min       │ 310min         │
│ org/repo-b       │ 37             │ 24min          │ 143min      │ 512min         │
└──────────────────┴────────────────┴────────────────┴─────────────┴────────────────┘
```

**What this shows:** Repo rhythm reveals whether changes are landing in a smooth stream or in bursts. A short median gap with a long p90 often means "mostly continuous, occasionally stalled." A large longest gap can indicate review queues, batching, time-zone handoffs, or context-switching. Comparing repos shows where merge/landing flow is healthy versus lumpy.

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
