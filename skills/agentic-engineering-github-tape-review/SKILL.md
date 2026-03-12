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
gh pr list --author @me --state all --limit 200 --json number,title,state,createdAt,mergedAt,closedAt,additions,deletions,reviews

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

### Approach

- Be exploratory rather than forcing everything into a predefined framework.
- Let patterns emerge from the evidence.
- Use exact examples and citations when making claims — link to specific PRs, commits, or issues.
- State tentative hypotheses, not fake certainty.

## Output

Structure the output as:

1. **Window analyzed** — exact date range and repos covered.
2. **Main patterns** — the 3-5 most prominent patterns you see.
3. **Strongest examples** — concrete PRs, commits, or issues that support each pattern, with links.
4. **What seems to be helping** — things that correlate with clean throughput.
5. **What seems to be slowing things down** — things that correlate with drag, rework, or stalls.
6. **Tentative hypotheses** — your best interpretation, clearly flagged as provisional.
7. **Worth tracking next week** — anything that warrants follow-up in the next tape review.

## Failure Recovery

- If `gh` is not authenticated, prompt the user to run `gh auth login`.
- If the user works across many repos, ask which repos to focus on rather than trying to pull everything.
- If the GraphQL contributions API returns empty data, fall back to per-repo PR and commit queries.
- If the 14-day window has too little data, extend to 21 days and note the adjustment.
