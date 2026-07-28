# 003 - Telemetry & Error Reporting

**Status:** Proposed  
**Date:** 2026-07-21  
**Privacy:** Strict scope by design — opt-in, crashes-only, no usage analytics (see decisions #2, #5, #9, #10).

## Context

`@coveo/create-ui` (`npm create @coveo/ui`) is a transient scaffolding CLI that
runs once on a developer's machine (see [ADR 001](./001-sample-consumption.md)
and [ADR 002](./002-sample-publishing.md)). We evaluated adding telemetry and
separated two distinct needs:

1. **Usage analytics** (adoption, funnels) — candidate: Amplitude.
2. **Proactive error visibility** (crashes) — candidate: Sentry.

Constraints: transient invocation (no persistent binary/daemon), privacy-
sensitive (stack traces can leak usernames, paths, tokens), and CI cost matters.

This ADR intentionally adopts a strict scope — opt-in, crashes-only, and no
usage analytics. Broadening the scope later (for example, usage analytics) would
be a separate decision with its own privacy review.

## Decisions

### 1. No usage analytics — npm download counts are the adoption proxy

Amplitude (and usage telemetry generally) rejected (for now). Its value is user-journey/
funnel analysis, which needs a user ID and a continuous event stream — not
meaningful for a fire-once scaffolding tool. Since the CLI resolves
`@coveo/ui-kit-sample-*` from npm ([ADR 001](./001-sample-consumption.md),
[ADR 002](./002-sample-publishing.md)), npm's per-package download counts
already provide a free, privacy-safe adoption signal — no SDK, no consent flow,
no user ID. Accepted limitation: counts are noisy (CI, mirrors, caches) and
blind to success/failure — fine as a rough trend.

### 2. Error reporting via Sentry, explicit and user-triggered — never automatic

We want crash visibility, not silent transmission from dev machines. On an
unexpected crash the CLI writes a human-readable report file and prints how to
submit it. Submission is a separate, explicit action. This decouples capture
(at crash) from transmission (on demand) — a pattern Sentry supports natively
(offline caching writes envelopes to disk to be sent later).

### 3. Submission via a `report` subcommand, re-invoked through npx

create-ui is transient — there is no persistent binary to host a command. The
package exposes a `report` subcommand; the crash handler prints the exact line:

```
npx @coveo/create-ui report <path>
```

Running it _is_ the consent for that one report: it reads the JSON, initializes
`@sentry/node`, sends the event (preserving the original crash timestamp),
flushes, and exits.

### 4. Only unexpected crashes generate a report

Reports are for bugs, not handled UX. Triggers: `uncaughtException`,
`unhandledRejection`, and untyped errors bubbling to `main`. Excluded (no
report): `TemplateVersionUnavailableError`, "directory not empty", unknown
template, and `ExitPromptError` (Ctrl-C) — expected outcomes that already have
dedicated guidance.

### 5. Consent & privacy: per-report consent + inspectable payload + best-effort scrub

- Explicit consent per report (running the command).
- The report is plain JSON on disk — the user can open and inspect exactly what
  will be sent before sending.
- Best-effort scrub at build time and again via Sentry `beforeSend`: home dir →
  `~`, cwd → basename/`[redacted]`, environment stripped, path-bearing args
  redacted. This is primarily a **security** measure (tokens can surface in
  error messages), not only privacy.
- No user ID, no automatic collection, no background transmission.

This transparency-first model replaces the need for a heavy privacy filter tested across operating systems in CI.

Consent is surfaced via the first-run disclosure (decision #9) and can be
pre-empted entirely with `DO_NOT_TRACK` (decision #10).

### 6. Report contents (JSON schema)

| Field               | Included | Notes                                 |
| ------------------- | -------- | ------------------------------------- |
| Error message       | ✅       | scrubbed                              |
| Stack trace         | ✅       | scrubbed (home → `~`)                 |
| CLI name + version  | ✅       |                                       |
| Node version        | ✅       |                                       |
| OS + arch           | ✅       |                                       |
| Template + version  | ✅       | requested template and version        |
| Package manager     | ✅       |                                       |
| Crash timestamp     | ✅       | preserved on submit                   |
| Random run-id       | ✅       | correlates report file ↔ Sentry event |
| Username in paths   | ❌       | redacted → `~`                        |
| Absolute cwd        | ❌       | basename or `[redacted]`              |
| Environment vars    | ❌       | stripped                              |
| Path-bearing args   | ❌       | redacted                              |
| Any user identifier | ❌       | never collected                       |

These technical-context fields mirror the `.coveo/create-ui.json` provenance
file written into every scaffolded project (PR #7954, KIT-5855). That file is
PII-free by design — a unit test pins a fixed key set and rejects any value
containing a path separator — so it is a known-clean source for the report's
context, and it also contributes the recorded Coveo dependency versions (see
decision #11).

### 7. Sentry project and data retention

Errors are sent to a dedicated Sentry project with its own DSN. The DSN is
embedded in the published package (a client key, publishable by design). Data
retention is set to **90 days**.

### 8. Implementation approach: capture-at-submit-time

At crash: write our own plain JSON report (no Sentry init, no DSN, no network
during normal runs). Only the `report` subcommand initializes `@sentry/node`
and sends. Chosen over a custom disk-writing Sentry transport so the JSON stays
human-inspectable (decision #5) and avoids coupling to Sentry's envelope format.
The persisted report is a versioned, vendor-neutral crash snapshot; it is not
expected to match Sentry's event schema. The `report` subcommand is the adapter
that projects the canonical report into the pinned SDK's current event format.
Hook point: the existing single crash funnel in `index.ts`
(`uncaughtException` / `unhandledRejection` / the rejection branch of
`main().then(...)`).

### 9. First-run disclosure

The CLI shows a concise disclosure the first time a crash report is offered —
the only point at which data could leave the machine. It states what a report
contains (crash/error diagnostics only), the purpose, that **nothing is sent
unless** the user runs the submit command, and how to disable it
(`DO_NOT_TRACK`). Because collection is opt-in, the disclosure is surfaced where
data egress can actually happen rather than as a happy-path banner on every
run.

### 10. Honor `DO_NOT_TRACK`

When `DO_NOT_TRACK` is set (console DO_NOT_TRACK convention — any non-empty
value other than `0`), the CLI suppresses the crash-report offer and disclosure
entirely, and the `report` subcommand refuses to send. In this opt-in design,
opting out is otherwise implicit — nothing is sent unless the user explicitly
submits — so no persisted opt-out config file is required.

### 11. Reuse the `.coveo/create-ui.json` provenance metadata

Every scaffolded project already carries a `.coveo/create-ui.json` provenance
file (PR #7954, KIT-5855) in the `ProjectMetadata` shape: `template`,
`templateVersion`, `createdWith` (`create-ui@<version>`), `createdOn`,
`dependencies` (Coveo packages only), `node`, and `packageManager`. The crash
report reuses this shape and its builder (`buildProjectMetadata` /
`provenancePath`) instead of re-deriving context — one source of truth, and it
inherits the file's tested no-PII guarantee.

- Dependency installation runs _after_ the provenance file is written, so a
  crash there (a common failure mode) can read `.coveo/create-ui.json` from the
  target directory to include the recorded Coveo dependency versions and
  `createdOn`.
- Earlier crashes (before the file exists) derive the same fields from runtime
  state.
- The report layers only crash-specific fields on top: scrubbed error message,
  scrubbed stack, OS + arch, crash timestamp, and a random run-id.

### 12. Migrate persisted schemas into one canonical model

Parsing dispatches on `schemaVersion` before validating version-specific fields.
Every released schema keeps a dedicated validator/migrator that projects it into
the current `CrashReport` model. Callers and the Sentry adapter consume
only that canonical model and do not branch on historical versions.

Adding a schema requires adding its writer and migrator without deleting older
migrators. Unknown versions produce a version-mismatch error; malformed data for
a known version is rejected as an invalid report. Schema v1 is the first
persisted format, so no fictitious earlier schema is introduced. Golden fixtures
must be added for each persisted version when a second schema is introduced.

## Consequences

- New runtime dependency `@sentry/node`, needed only on the `report` path —
  lazy-import it so normal scaffolding pays zero cost.
- New source: report builder + scrubber + `report` subcommand; the `index.ts`
  crash funnel is updated to write the report and print the submit command.
- The report builder reuses `buildProjectMetadata` / `provenancePath` (PR #7954)
  for the project-metadata block — no duplicate metadata logic.
- Persisted schemas are compatibility commitments: keep each released migrator
  when adding a new schema.
- Lower report volume than automatic telemetry (accepted) — reports are higher-
  signal, and users can alternatively attach the JSON to a GitHub issue.
- Not "proactive" in the continuous sense: no release-health / sessions /
  performance / trends. Pure crash reporting.
- License: create-ui is Apache-2.0; `@sentry/node` is MIT (permissive) — no
  licensing conflict.
- **Open actions (tracked, not blocking this ADR):**
  1. Create the dedicated Sentry project and obtain its DSN.
  2. Configure the 90-day retention on the Sentry project.
