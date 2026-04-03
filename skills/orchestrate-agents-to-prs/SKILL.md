---
name: orchestrate-agents-to-prs
description: Orchestrate a group of agents to complete a large task end-to-end. Decompose work into parallelizable units, delegate with full context, coordinate PRs, drive review cycles, and track progress until everything is merge-ready. Use when a task is too big for one agent or one PR and you want autonomous multi-agent execution with progress visibility.
metadata:
  author: leojiang
  version: "1.0.0"
---

# Orchestrate

You are the orchestrator for coding agents. Your job is to understand the full intent, decompose the work, delegate to agents or subagents, coordinate PRs, drive review cycles, and keep going until everything is merge-ready.

## When to Use

Use this skill when:
- The task is too large for a single agent or a single PR.
- Work can be decomposed into parallel streams.
- Multiple PRs need to be coordinated and driven through review.
- The user expects autonomous execution with progress visibility.

## Workflow

### 1. Understand the Intent

- Think through the work carefully before touching code.
- Ask clarifying questions if anything is unclear. Keep asking until you thoroughly understand the intent and the expected final outcome.
- Restate the task in concrete delivery terms so the user can confirm alignment.

### 2. Decompose the Work

- Break the task into manageable units with clear boundaries.
- Identify parts that are parallelizable and explicitly call them out so agents can be spun up concurrently.
- Divide the work into PRs. Each PR should be a reviewable, self-contained slice.
- When the decomposition is non-trivial, illustrate the plan with a Gantt chart, dependency graph, or sequenced list so progress is trackable.

### 3. Delegate with Full Context

- For each agent or subagent, provide:
  - All necessary context (relevant files, schemas, conventions, prior decisions).
  - The exact deliverable expected (branch name, PR scope, acceptance criteria).
  - Any constraints or dependencies on other units of work.
- Never assume an agent has context you haven't explicitly given it.

### 4. Track and Communicate Progress

- Maintain a living status artifact (document, HTML page, or inline summary) that shows:
  - What units exist, who owns each, and current status.
  - Which PRs are open, in review, or merged.
  - What is blocked and why.
- Update and communicate status to the user throughout the process. Don't go silent.
- Use a Gantt chart or another clear tracking method when the work has meaningful sequencing or parallelism.

### 5. Drive PRs Through Review

- Keep going until the PRs completed by an agent, subagent, or yourself have been reviewed and are ready to merge.
- Leave PR comments as a trail that can be inspected for each round of revision.
- If there are still review comments or remaining work on a PR, ask the person responsible for that PR to reply, resolve, or address the feedback.
- Re-review after each revision round. Don't assume fixes are correct without checking.

### 6. Keep Moving

- If there is work that can be started, start it. Don't wait for the user unless you are genuinely blocked.
- If one stream is blocked, pivot to unblocked work.
- Start parallel agents whenever independent units are ready.

### 7. Stop Condition

- Finish only when all PRs are reviewed to merge-ready state.
- If you are completely blocked and need help, stop and explain exactly what is blocking you and what you need from the user.

## Execution Principles

- Prefer the simplest decomposition that covers the full task.
- Prefer small, focused PRs over large monolithic ones.
- Prefer starting work over perfecting plans.
- Prefer loud failures over silent assumptions.
- Prefer concrete status artifacts over verbal assurances.
- Think step by step internally. Break, delegate, track, review, repeat.

## Status Artifact Template

When tracking multi-PR work, maintain something like:

```
## Orchestration Status

| # | PR / Unit           | Owner    | Status      | Blocked By |
|---|---------------------|----------|-------------|------------|
| 1 | Schema migration    | agent-1  | merged      | —          |
| 2 | API endpoints       | agent-2  | in review   | —          |
| 3 | Frontend integration| agent-3  | in progress | PR #2      |
| 4 | E2E tests           | self     | not started | PR #2, #3  |
```

## Checklist

- [ ] Intent fully understood and restated
- [ ] Work decomposed into parallelizable units
- [ ] Each agent has full context and a clear deliverable
- [ ] Status artifact created and being updated
- [ ] All PRs opened, reviewed, and driven to merge-ready
- [ ] User informed of final state
