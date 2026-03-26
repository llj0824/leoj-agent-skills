# Architecture Audit Brief

## Context

Acme Docs is a small internal platform for turning product plans into customer-facing documentation. The team wants a browser-readable deep dive that explains the current architecture, the gaps causing publishing friction, and the recommended next steps.

## Audience

- CTO
- engineering manager
- platform team

## Scope

Cover the current system, the specific problems in the publishing path, and a ranked direction for the next quarter. Do not propose a total rewrite.

## Current State

### Systems

| Component | Responsibility | Pain Points |
| --- | --- | --- |
| Web app | Draft editing and preview | Slow preview refresh under large docs |
| API service | Stores drafts, triggers builds | Build requests fail silently in some edge cases |
| Worker | Converts markdown to static output | Queue retries create duplicate builds |
| CDN bucket | Stores final assets | No explicit version pinning |

### Current Flow

1. Editor saves draft to the API.
2. API emits a build job to the worker queue.
3. Worker converts content and uploads static files.
4. CDN bucket serves the newest uploaded files.

### Evidence

- Preview refresh p95 is 11.2 seconds.
- 14 percent of failed builds had no user-visible error message last month.
- Duplicate worker retries produced conflicting uploads in 6 incidents.
- Teams do not have one diagram showing the full draft-to-publish path.

## Gap / Intent

The team does not need a platform redesign. It needs a clearer publishing pipeline, visible failure states, and safer asset versioning so incidents stop looking random.

## Constraints

- 6-week implementation window
- 3 engineers available
- Existing API and worker must stay in service during changes
- The output should be a single self-contained HTML file with diagrams or tables

## Direction Candidates

### Option A

Add explicit build state tracking, user-visible error surfaces, and content-addressed asset versioning. Keep the current API and worker split.

### Option B

Collapse the API-trigger path and worker into one service.

### Option C

Move the whole workflow onto a new event platform.

## Recommendation

Option A is the intended direction because it reduces incident ambiguity without requiring an architectural reset.
