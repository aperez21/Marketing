# Claude Code Task Handoffs

Task briefs ready to hand to a Claude Code session, one file per task.

## Convention

- Filename: `NNN-short-name.md` (zero-padded, sequential across the whole project)
- Format: instruction-sheet style — Goal, Summary, Steps, each step labeled
  `Owner: Claude Code` or `Owner: Human`. Claude Code steps list the exact
  Artifacts (files created/modified), Directories, and Libraries involved.
- Each task references the checkbox it satisfies in `../DEVELOPMENT_PLAN.md`.
- When a task is finished: check the box in DEVELOPMENT_PLAN.md, move the file
  into `done/` (create it if it doesn't exist), and add an entry to
  `../project-logs/`.

## Status

| File | Phase | Status |
|---|---|---|
| 001-schema-migrations.md | 0 | Applied to `wtltwglxpasvkgjegcas` on 2026-07-04 (0001-0009 + follow-up 0010 security fix). Done. |
| 002-webhook-endpoint.md | 0 | Deployed + cURL-tested end-to-end 2026-07-05 (see project-logs). Done. |
| 003-seed-reference-data.md | 0 | `channels` seeded (0007, applied). GuruSan slug/industry confirmed 2026-07-05 and `tenants.sql` run — tenant #1 registered. Done. |
| 004-campaign-performance-view.md | 0 | Applied to `wtltwglxpasvkgjegcas` on 2026-07-04. Done. |

All four tasks (001-004) are done. All of Phase 0 is now complete except
"GuruSan wired as tenant #1" (cross-project API key/webhook-secret exchange,
still Owner: Human). See `../session-log.md` for the session that authored these
artifacts and the sessions that applied them.
