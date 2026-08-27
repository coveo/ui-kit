---
status: Proposed
date: 2026-08-27
related:
  - ../rfc/kit-6134-retryable-e2e-scratch-org-lifecycle.md
  - https://coveord.atlassian.net/browse/KIT-6134
  - ../../../../docs/adr/0002-adr-template.md
---

<!-- cspell:words HMAC -->

# Own Quantic E2E scratch orgs by workflow attempt and LWS variant

## Context and Problem Statement

Quantic E2E currently shares two Salesforce scratch orgs across setup, Apex, and Playwright jobs and identifies them with a short commit prefix. Concurrent runs and GitHub Actions re-runs can therefore discover ambiguous orgs, consume stale run-scoped artifacts, or delete an environment that another job still expects. Native failed-job and specific-job re-runs also skip successful provisioning prerequisites. Retaining failed environments for GitHub's 30-day re-run window would consume scarce active and daily Dev Hub allocations and still fail when an org expires.

The lifecycle must support success, failure, cancellation, and protected partial retries without allowing pull-request-controlled code to access Dev Hub credentials or forge the required candidate check. The detailed threat model, state machines, capacity model, estimates, and implementation stories are in the linked [KIT-6134 spike report](../rfc/kit-6134-retryable-e2e-scratch-org-lifecycle.md).

## Decision Drivers

- Isolate concurrent workflow runs, accepted retry requests, and LWS variants.
- Delete an attempt's orgs promptly without predicting future protected retry requests.
- Keep Dev Hub credentials and lifecycle authority outside pull-request-controlled code.
- Recover one LWS variant without rebuilding the other.
- Make Salesforce mutation, cleanup, and capacity reservation deterministic and auditable.
- Bound cancellation leaks without using workflow artifacts as authority.
- Report one required result that PR code cannot forge on the immutable candidate or merge-group SHA.

## Considered Options

### Option A: Retain run-scoped environments for later attempts

- **Summary:** Key the two orgs by workflow run and keep them after failures so re-run jobs can reuse them.
- **Pros:** Preserves the current Playwright shard topology and avoids repeated setup.
- **Cons:** Cleanup cannot know whether a re-run will occur, artifacts span attempts, failed deployments can leave uncertain state, and retention consumes allocation until expiry.

### Option B: Use trusted, attempt-scoped lifecycle ownership per LWS variant

- **Summary:** A base-revision control plane owns one signed lease for each `(repository, workflow run, attempt, LWS variant)`. Privileged jobs provision, run Apex, and clean up; unprivileged Playwright jobs receive only a public URL and non-secret test capability.
- **Pros:** Makes cleanup immediately safe, isolates PR code from credentials, permits one-variant recovery, and gives the sweeper an artifact-free ownership proof.
- **Cons:** Requires a trusted control workflow, atomic Dev Hub reservation, signed markers, and additional job handoffs. Reduced test fan-out may increase wall time.

### Option C: Give each Playwright shard an org or use a persistent pool

- **Summary:** Isolate every shard with a disposable org, or lease long-lived shared environments from a pool.
- **Pros:** Per-shard orgs retain runner parallelism; a pool minimizes setup latency.
- **Cons:** Per-shard orgs multiply active and daily capacity by four. A pool introduces cross-run state, sanitization, and a larger privileged broker boundary.

## Decision Outcome

Adopt **Option B**. Each LWS variant has an attempt-scoped lease owned by trusted control-plane code from the protected base revision. GitHub-native failed-job, specific-job, and workflow re-runs are unsupported for lifecycle and test jobs and fail closed. A supported retry uses a protected default-branch entrypoint that validates the original failure and current candidate through GitHub, creates a fresh lifecycle request, reserves only the requested failed variant or both variants for retry-all, and provisions fresh state without consuming prior environment outputs. Privileged lifecycle jobs never execute PR-controlled scripts; Playwright jobs never receive Salesforce CLI auth state or the Dev Hub JWT.

Artifacts are diagnostics only. A trusted finalization job determines the result from an expected-attempt manifest, exact GitHub job IDs and conclusions, and expected artifact IDs and digests. A newer accepted request that started a producer but lacks terminal evidence fails instead of falling back to an older pass.

A separate protected reporter, using a narrowly scoped check-writing credential unavailable to PR jobs, idempotently publishes one stable required check on the verified candidate or merge-group SHA. Every lost-generation replacement requires an atomic daily-capacity top-up. Before another org is created, it must also reserve any temporary active slot or verify absence and release/rebind the old active reservation.

### Rationale

Attempt ownership removes the conflict between immediate cleanup and future retries: no future request is eligible to consume the old environment. Variant ownership limits a partial retry to one org. Keeping the authority in a protected control plane prevents same-repository and fork PR code from reading lifecycle credentials, while a canonical HMAC-signed Dev Hub marker lets cleanup and sweeping prove ownership without trusting artifacts.

The alternatives optimize setup latency by spending substantially more Salesforce capacity or weakening isolation. The selected design accepts bounded orchestration and performance cost in exchange for deterministic ownership and cleanup.

## Consequences

- **Positive:** Success, failure, cancellation, stale runs, and protected retries have one ownership and cleanup model.
- **Positive:** One LWS environment can be recreated independently, and active expired duplicates can be removed deterministically after their signed lease expires.
- **Positive:** PR-controlled jobs receive no Dev Hub secret, scratch-org admin credential, or Salesforce CLI auth directory.
- **Positive:** Branch and merge-queue policy consumes a stable candidate-SHA check that PR code cannot publish.
- **Negative:** The design adds a trusted controller, retry/reporter boundary, reservation broker, exact-result finalization job, and sweeper.
- **Negative:** Contributors cannot use GitHub's native re-run buttons; an authorized maintainer must use the protected retry entrypoint.
- **Negative:** The proposed topology is estimated at 17.5–24 minutes p50 and 32.5–45 minutes p95 until paired benchmarks replace the planning range.
- **Neutral:** Test reports remain useful diagnostics but no longer establish pass/fail or resource ownership.

## Implementation and Follow-up

Implement the stories in the spike report in dependency order: identity/evidence, atomic reservation and replacement top-ups, deployment without disposal, exact in-job cleanup, sweeper, protected retry/reporting and trusted/unprivileged topology, then canary and benchmark. Do not switch the workflow topology until exact cleanup is proven. Use a globally serialized, manually approved maximum of one Quantic lifecycle with at most two requested variants until Dev Hub quotas, reserves, and participation by other automated consumers are confirmed.

Review this decision if paired measurements exceed the 45-minute p95 planning ceiling, if the Dev Hub cannot hold the canonical signed marker, or if all Dev Hub consumers cannot participate in the reservation protocol or provide a defensible external-consumer reserve.
