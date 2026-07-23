# RFC: Override browser privacy signals for legacy analytics in Headless v3

- **Status**: Proposed
- **Date**: 2026-07-22
- **Owners**: Headless maintainers
- **Reviewers**: Headless, Analytics, Product, and Privacy representatives
- **Related work**: [KIT-2844](https://coveord.atlassian.net/browse/KIT-2844), [SVCC-4407](https://coveord.atlassian.net/browse/SVCC-4407), [PR #7597](https://github.com/coveo/ui-kit/pull/7597), [PR #4020](https://github.com/coveo/ui-kit/pull/4020), [UA-11175](https://coveord.atlassian.net/browse/UA-11175)

## Summary

Add a stable `analytics.disableBrowserPrivacySignals` option to Headless v3. When set to `true` with legacy analytics, Headless and `coveo.analytics.js` stop interpreting browser-based privacy signals (Do Not Track and Global Privacy Control) as reasons to disable analytics. The default remains `false` (privacy-friendly).

This aligns legacy analytics with Coveo's documented privacy stance: provide a privacy-friendly default and let customers re-configure based on their own compliance responsibilities.

The option is a transitional compatibility capability. It remains supported for the lifetime of legacy analytics and is removed together with legacy analytics under KIT-2844.

## Context

### Customer problem

A customer operates an internal Knowledge search experience in a managed enterprise browser. Do Not Track is enabled through a corporate browser policy and cannot be disabled for the target application. During Headless engine initialization, legacy analytics is automatically disabled when DNT is detected, preventing expected analytics collection.

This has been a sustained support issue and a source of customer dissatisfaction.

### Coveo's privacy stance

Coveo's internal privacy documentation establishes:

- Coveo acts as a **data processor**. Customers are data controllers and maintain the direct relationship with their end-users.
- Coveo is **not responsible** for reviewing browser privacy headers or assessing whether a user's privacy preferences shall be honored. That responsibility belongs to the customer's front-end integration.
- Coveo's front-end frameworks should provide a **privacy-friendly default** that can **easily be re-configured by customers**.

The current Headless legacy analytics behavior exceeds this stance by making a non-overridable decision on behalf of the customer.

### Event Relay precedent

Event Relay (`analyticsMode: 'next'`) already ignores both DNT and GPC. The proposed option brings legacy analytics in line with this established direction.

### Long-term direction

1. Make Event Relay available for Knowledge Website and Workplace use cases under SVCC-4407.
2. Migrate customers from legacy analytics to Event Relay.
3. Remove legacy analytics under KIT-2844.

Waiting for Event Relay does not address the immediate customer need.

## Problem statement

Headless needs to let an implementer explicitly keep legacy analytics enabled regardless of browser privacy signals, without:

- changing behavior for applications that do not opt in;
- requiring an Atomic implementation change;
- requiring direct calls to low-level analytics interfaces;
- creating an unstable production dependency; or
- turning a legacy compatibility requirement into a long-term privacy framework.

The success criterion is actual delivery of legacy search and click events while browser privacy signals are active.

## Current behavior

Headless evaluates a combined `doNotTrack()` helper during engine initialization when the analytics mode is not `next`. The helper returns `true` when any of these values indicate an active privacy signal:

- `navigator.globalPrivacyControl` (GPC)
- `navigator.doNotTrack` (DNT)
- `navigator.msDoNotTrack` (legacy DNT)
- `window.doNotTrack` (legacy DNT)

```ts
// Current guard in engine.ts
if (analyticsMode !== 'next' && doNotTrack()) {
  disableAnalytics();
}
```

The installed `coveo.analytics.js` client performs the same combined check independently, selecting a no-op client or runtime when it detects an active signal. A Headless-only change is therefore insufficient.

## Proposal

### Public Headless configuration

Add `disableBrowserPrivacySignals?: boolean` to `AnalyticsConfiguration`:

```ts
const engine = buildSearchEngine({
  configuration: {
    accessToken,
    organizationId,
    analytics: {
      analyticsMode: 'legacy',
      disableBrowserPrivacySignals: true,
    },
  },
});
```

### Contract

- Default: `false` (current privacy-preserving behavior).
- When `true`: Headless and the downstream legacy analytics client do not check `navigator.doNotTrack`, `navigator.msDoNotTrack`, `window.doNotTrack`, or `navigator.globalPrivacyControl`.
- Scope: `analyticsMode: 'legacy'` only. No effect on Event Relay.
- Does not override explicit `enabled: false`.
- Immutable: set at engine initialization; not part of runtime analytics state.
- Lifecycle: supported for the lifetime of legacy analytics; removed with KIT-2844.

### Why an umbrella option rather than DNT-only

1. **Aligns with Coveo's documented stance.** The customer, not Coveo's libraries, decides which privacy signals to honor. The option hands that control to the customer.
2. **Matches Event Relay behavior.** Event Relay already ignores both DNT and GPC. This option brings legacy analytics in line.
3. **Better UX.** A single option communicates one concept: "I handle privacy decisions myself." Separate `ignoreDoNotTrack` and `ignoreGlobalPrivacyControl` options would be harder to discover and to explain.
4. **Avoids a forced re-assessment.** If the affected customer (or others) also has GPC enforced by corporate policy, a DNT-only option would leave the problem unsolved and require a second option. We do not know yet whether the managed browser also sets GPC.
5. **Simpler implementation.** The existing `doNotTrack()` helper already combines DNT and GPC. The umbrella option skips the helper entirely rather than requiring a signal-by-signal split.

### Decision precedence

1. Explicit `enabled: false` wins (analytics disabled).
2. If `disableBrowserPrivacySignals` is `true`, browser signals are not checked.
3. Otherwise, if any browser privacy signal is active, analytics is disabled.

Equivalent pseudocode:

```ts
const disableAnalytics =
  explicitlyDisabled || (!disableBrowserPrivacySignals && doNotTrack());
```

### Behavior matrix

| Analytics mode | Configured enabled | DNT | GPC | `disableBrowserPrivacySignals` | Effective result              |
| -------------- | ------------------ | --- | --- | ------------------------------ | ----------------------------- |
| `legacy`       | `false`            | Any | Any | Any                            | Disabled                      |
| `legacy`       | `true` or default  | Off | Off | Any                            | Enabled                       |
| `legacy`       | `true` or default  | On  | Off | `false` or omitted             | Disabled                      |
| `legacy`       | `true` or default  | Off | On  | `false` or omitted             | Disabled                      |
| `legacy`       | `true` or default  | On  | On  | `false` or omitted             | Disabled                      |
| `legacy`       | `true` or default  | On  | Off | `true`                         | Enabled                       |
| `legacy`       | `true` or default  | Off | On  | `true`                         | Enabled                       |
| `legacy`       | `true` or default  | On  | On  | `true`                         | Enabled                       |
| `next`         | Any                | Any | Any | Any                            | Existing Event Relay behavior |

### Initialization and runtime semantics

`disableBrowserPrivacySignals` establishes an immutable engine-lifetime policy. It is not part of runtime Redux analytics state and is not exposed through `updateAnalyticsConfiguration`.

Runtime behavior remains unchanged:

- `disableAnalytics()` disables analytics.
- `enableAnalytics()` enables analytics.
- Reconstructing an engine evaluates the new configuration.

### `coveo.analytics.js` support

The downstream client must accept and honor an equivalent option. When present, it must skip its own `doNotTrack()` check in:

- Client construction (avoids `NoopAnalytics`).
- Runtime selection (avoids `NoopRuntime`).
- Client identifier extraction from links.

### Internal Headless propagation

1. Validate in the engine analytics configuration schema.
2. Read during initial analytics state calculation.
3. Exclude from the runtime analytics configuration payload.
4. Capture in `ThunkExtraArguments` (immutable).
5. Pass to every legacy analytics configurator.
6. Pass from each configurator to `coveo.analytics.js`.

### Observability

Log one warning from the engine-build path when the option is `true` and any browser privacy signal is active:

> "Browser privacy signals detected but ignored by explicit configuration (disableBrowserPrivacySignals: true). The implementer is responsible for privacy compliance."

No tokens or payloads in the message.

## Implementer responsibility

Enabling this option can cause analytics to be sent despite active browser privacy preferences. Coveo's libraries default to respecting these signals. When the customer explicitly disables this detection, they accept full responsibility for compliance with applicable privacy regulations, including but not limited to the California Consumer Privacy Act and its successor the California Privacy Rights Act (which recognizes GPC as a valid opt-out mechanism).

Documentation must clearly state this. Product and Privacy representatives must approve the public wording before release.

## Atomic integration

No Atomic implementation change required. Applications using Atomic supply the option through the existing Headless engine configuration path.

## Alternatives considered

### DNT-only option (`ignoreDoNotTrack`)

Rejected because:

- Does not cover the case where GPC is also enforced by IT policy.
- Requires splitting the combined `doNotTrack()` helper into separate signal detection.
- Forces a second option later if GPC needs the same treatment.
- Does not align with Coveo's stance that the customer owns the privacy decision.
- Does not match Event Relay's existing behavior.

### Experimental engine-level privacy controls (PR #7597)

Rejected because:

- `experimental.useOwnPrivacyControl` is not suitable for production.
- The `experimental` namespace forces migration work when stabilized.
- The name is vague about what it controls.
- Does not address independent suppression in `coveo.analytics.js`.

### Make explicit `enabled: true` take precedence

Rejected because existing applications may already set `enabled: true` without intending to override browser signals.

### Callback-based privacy decision

Rejected because it creates unnecessary complexity for a single transitional requirement.

### Headless-only change

Rejected because `coveo.analytics.js` independently suppresses events.

## Compatibility

For applications that omit the option: no behavior change.

For applications that enable the option while explicitly selecting legacy analytics:

- DNT and GPC no longer disable analytics.
- Explicit `enabled: false` continues to win.
- Event Relay behavior remains unchanged.
- The behavior is stable for the lifetime of legacy analytics.

## Security and privacy considerations

The option changes whether behavioral analytics may be emitted. The implementation must:

- Default to `false` (privacy-preserving).
- Require an explicit boolean opt-in.
- Avoid inferring the value from environment, organization, or browser.
- Not appear in runtime-mutable Redux state.
- Log a clear warning without sensitive values.
- Receive Privacy review for public documentation.

The option is consistent with Coveo's documented stance as a processor that provides privacy-friendly defaults with customer re-configuration.

## Validation strategy

### Unit tests

Headless tests must cover the full behavior matrix above plus:

- Omitted `analyticsMode` preserves current behavior.
- Search, insight, and case-assist legacy client construction.
- Runtime enable and disable calls.
- Absence from runtime Redux state.
- Warning fires when signals are active and option is `true`.
- Warning does not fire when signals are absent, option is `false`, or Event Relay is selected.
- Configuration schema validation.

`coveo.analytics.js` tests must assert that with the option enabled under active DNT/GPC:

- `CoveoAnalyticsClient` does not select `NoopRuntime`.
- `CoveoSearchPageClient` does not select `NoopAnalytics`.
- A send operation reaches the test transport.
- Client identifier extraction from links functions.

### Integration tests

1. Set DNT and/or GPC active before engine creation.
2. Build a legacy Headless engine with `disableBrowserPrivacySignals: true`.
3. Emit a search event and click event.
4. Assert both requests reach the analytics transport.
5. Repeat with the option omitted; assert no request.
6. Repeat with `enabled: false` and the option `true`; assert no request.

Tests must exercise the real `coveo.analytics.js` integration. They are blocked until the downstream option is available.

### Atomic smoke test

Confirm the option reaches Headless through Atomic's normal engine configuration path.

## Rollout

1. Add `disableBrowserPrivacySignals` support in `coveo.analytics.js` with transport-level tests.
2. Release the downstream client.
3. Update Headless to the compatible `coveo.analytics.js` version.
4. Add the Headless configuration, propagation, and tests against the real dependency.
5. Add a Headless changeset.
6. Publish documentation after Product and Privacy review.
7. Validate the customer integration before recommending production adoption.
8. Monitor first customer rollout.

The downstream release is a hard merge gate for the Headless option.

## Migration and removal

- Supported while legacy analytics exists.
- Once Event Relay covers Knowledge use cases, recommend migration rather than new adoption.
- Deprecate together with legacy analytics.
- Remove in the same major release as KIT-2844.

## Consequences

### Positive

- Resolves the managed-browser use case regardless of whether DNT, GPC, or both are active.
- Aligns with Coveo's documented privacy stance.
- Matches Event Relay's existing behavior.
- Single option, one concept, clear UX.
- Simpler implementation (no signal-by-signal split).
- Clear end-of-life condition.

### Negative

- Requires coordinated Headless and `coveo.analytics.js` releases.
- Adds a stable property to a subsystem planned for removal.
- Requires clear documentation of implementer compliance responsibility.
- A customer could disable GPC detection without fully understanding the legal implications.

### Risks and mitigations

| Risk                                                     | Mitigation                                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Customer bypasses GPC without understanding legal weight | Clear documentation; default `false`; warning log; Privacy-reviewed public docs.                                |
| Headless reports enabled but events are dropped          | Downstream release with transport-level tests is a hard gate.                                                   |
| Existing apps start tracking unexpectedly                | Default `false`; explicit opt-in only.                                                                          |
| Bridge becomes permanent                                 | Tied to legacy analytics lifecycle.                                                                             |
| Future signals expand the bypass scope                   | The stance document delegates all browser privacy signals to the customer. This is intentional, not accidental. |

## Open questions for review

1. Which `coveo.analytics.js` release will introduce the downstream option?
2. Should the initialization warning use `warn` or `info` severity?
3. Which Product and Privacy representatives must approve public documentation?
4. Should we confirm the affected customer's actual GPC value before shipping, or is the umbrella approach acceptable regardless?

## Decision requested

Approve the following direction:

- Add stable `analytics.disableBrowserPrivacySignals` to Headless v3.
- Bypass both DNT and GPC for legacy analytics when enabled.
- Default to `false` (privacy-preserving).
- Require coordinated `coveo.analytics.js` support.
- Support until legacy analytics is removed under KIT-2844.
- Document that the implementer accepts full privacy compliance responsibility.
