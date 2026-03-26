# Migration Plan Brief

## Objective

Create a standalone HTML explainer for migrating the analytics pipeline from nightly batch exports to incremental event streaming.

## Reader Need

The reader should understand:

- what exists now
- why the current batch model is too slow
- what the migration sequence should be
- which work can happen in parallel

## Current State

### Existing Pipeline

| Stage | Current Behavior | Limitation |
| --- | --- | --- |
| App events | Buffered locally then flushed hourly | Client clocks skew event ordering |
| Batch export | Nightly warehouse export | 24-hour delay for product metrics |
| Aggregation jobs | Daily rebuild of summary tables | Expensive and difficult to backfill |
| Dashboards | Query summary tables | Product teams do not trust freshness |

### Known Issues

- Executive dashboard is always at least one day stale.
- Funnel debugging requires ad hoc SQL by the data team.
- Backfills can take up most of the warehouse window.

## Target State

Move to append-only event ingestion with near-real-time summaries while keeping the current dashboards alive through the migration.

## Constraints

- No downtime for dashboards
- Warehouse cost increase must stay under 15 percent
- Product teams need side-by-side validation before switching

## Suggested Phases

1. Introduce the ingestion stream and validate event contracts.
2. Build incremental summaries in parallel with the batch path.
3. Compare metrics for two weeks and resolve drift.
4. Cut dashboards over by domain, not all at once.
5. Decommission the nightly rebuild after stability is proven.

## Risks

- Event schema drift between teams
- Duplicate events during dual-write
- Confusing ownership during the cutover window

## Desired Tone

Calm, technical, decision-ready, with at least one phased visual.
