# Decision Record: Search API Mocking Strategy for Component E2E Tests

- **Date**: 2026-07-20
- **Status**: accepted

## Context

Our Playwright end-to-end (E2E) tests drive real user interactions in the browser.
Historically, component-level tests let the interface issue **real requests to the
Coveo Search API** — on initial load and on every interaction (selecting a value,
paginating, clearing a filter, …).

This does not scale. Every component spec, multiplied by every use case, every analytics mode and every
interaction, produces many real Search API calls. When the full suite runs in parallel
against the same organization, the volume triggers **HTTP 429 (Too Many Requests)**,
making the suite flaky for reasons unrelated to the code under test. Real round-trips
also make tests slower and less deterministic, since response content and counts drift
over time.

This refines the general strategy in [`0001-testing-strategy.md`](./0001-testing-strategy.md):
verifying real API interactions remains valuable, but that value should be concentrated
in a few deliberate tests rather than paid on every component interaction.

## Decision

**Component-level E2E tests must mock the Search API instead of calling it.**

Real Search API calls are reserved for a small, intentional subset of **happy-path /
full-workflow E2E tests** whose purpose is to exercise the real API contract and
integration end to end. Because this subset is small, its aggregate call volume stays
well below the rate limit, removing the 429 risk.

**Analytics requests are still allowed to reach the real API.** They do not have a
volume problem, and letting them through lets us validate the resulting analytics
reports. This may be revisited if it becomes a constraint.

## Mocked E2E Workflow

The base mocked search response is provided by the **`@coveo/platform-mock-api`**
package (under `ui-kit`), which holds canonical, reusable API response fixtures.

A component test wires it up as follows:

1. **Mock the initial search** with the base response from `@coveo/platform-mock-api`,
   so the search auto-triggered on interface load never reaches the network.
2. **Declare scenario data** in a local `data.ts`: small overrides that complement and
   replace only the relevant sections of that base response (e.g. the facet values, or
   a specific result set) to represent the state a given test needs.
3. **Serve a response sequence** for interactions: the Nth search returns the Nth
   declared override (the last one repeats), so a test can walk through steps like
   select → deselect with deterministic responses.

This is implemented by a few shared building blocks:

- **Base-response mock** — `mockSearchWithBaseResponse()`
  (`playwright/page-object/searchObject.ts`) fulfills the search endpoint with the
  `@coveo/platform-mock-api` base response. Covers step 1.
- **Response-sequence mock** — `mockSearchResponseSequence()`
  (`playwright/page-object/searchObject.ts`) fulfills successive searches with a list of responses, each built by merging a declared override onto the base response; the last entry repeats. Covers steps 2 and 3, so a test only specifies what differs from the
  base.
- **Sequence fixture value** — a Playwright fixture value declares a test's response sequence, with a default that individual `describe` blocks override via `test.use({...})`.

## Consequences

- **The 429 risk is eliminated**: real Search API calls no longer grow with the number
  of components and interactions.
- **Component tests become fast and deterministic**: no network round-trips, stable
  payloads, reproducible interaction sequences.
- **Contract verification is preserved** but consolidated into the happy-path subset,
  which still fails when the real request/response contract breaks.
- **Local mock data to maintain**: tests own local override data — a maintenance cost,
  but one that keeps mocked payloads visible and reviewable next to the assertions they
  support.
