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
| 001-schema-migrations.md | 0 | Ready |
| 002-webhook-endpoint.md | 0 | Ready |
| 003-seed-reference-data.md | 0 | Ready |
| 004-campaign-performance-view.md | 0 | Ready |
