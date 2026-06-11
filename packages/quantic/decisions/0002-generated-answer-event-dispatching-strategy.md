# Decision Record: Event Dispatching Strategy for Generated Answer Components

- **Date**: 2026-06-10
- **Status**: accepted

## Context

The `QuanticGeneratedAnswer` component needs to handle like/dislike, copy-to-clipboard, and citation hover interactions across two flows:

- **CRGA with Search API/Answer API**: A single generated answer with no `answerId` disambiguation needed.
- **CRGA with AgentAPI**: Multiple generated answers (head answer + follow-ups), where an `answerId` is required to identify which answer was interacted with.

We introduced `QuanticGeneratedAnswerBody` as a reusable component that renders a single generated answer unit. This component contains `QuanticFeedback`, `QuanticGeneratedAnswerCopyToClipboard`, and `QuanticSourceCitations` as children.

The problem is how to enrich events with `answerId` without creating ambiguity around which component is the source of a given event.

## Decision

### QuanticFeedback — Generic events, no enrichment

`QuanticFeedback` is a generic, reusable component (used by Smart Snippet, Generated Answer, etc.). It dispatches `quantic__like` and `quantic__dislike` with no payload. These are generic events that should remain unaware of generated-answer-specific concerns.

Because of this, `QuanticGeneratedAnswerBody` must not re-dispatch events with the same name `quantic__like`/`quantic__dislike` — doing so would create two components emitting the same event with different payload shapes, which is a source of confusion and future bugs.

Instead, `QuanticGeneratedAnswerBody` intercepts `quantic__like`/`quantic__dislike` from `QuanticFeedback`, stops their propagation, and dispatches dedicated events: **`quantic__generatedanswerlike`** and **`quantic__generatedanswerdislike`**, enriched with `{ answerId }`.

On the short term, `QuanticGeneratedAnswer` will handle both `quantic__like`/`quantic__dislike` (from the direct `QuanticFeedback` usage in the Search API/Answer API template) and `quantic__generatedanswerlike`/`quantic__generatedanswerdislike` (from `QuanticGeneratedAnswerBody`). This duplication is temporary — the goal is to migrate all generated answer usecases to use `QuanticGeneratedAnswerBody`, at which point only the dedicated events will remain.

### QuanticGeneratedAnswerCopyToClipboard — Accepts optional `answerId` property

This component is dedicated to CRGA. It dispatches `quantic__generatedanswercopy`. Since it is not a generic component, it will accept an optional `answerId` property and include it in the event payload when present. This eliminates the need for `QuanticGeneratedAnswerBody` to intercept and re-dispatch the copy event.

### QuanticSourceCitations — `QuanticGeneratedAnswerBody` passes an `answerId`-enriched `handleCitationHover` callback

This component accepts a `handleCitationHover` callback (called with `citationId` and `citationHoverTimeMs`). `QuanticGeneratedAnswerBody` will pass a `handleCitationHover` implementation that includes the logic to dispatch the `quantic__citationhover` event enriched with `answerId`.

## Consequences

- Clear separation between generic events (`quantic__like`) and generated-answer-specific events (`quantic__generatedanswerlike`).
- No two components emit the same event with different payload shapes.
- CRGA-dedicated components (`QuanticGeneratedAnswerCopyToClipboard`, `QuanticSourceCitations`) handle their own enrichment, reducing the mediation responsibility of `QuanticGeneratedAnswerBody`.
- Temporary duplication in `QuanticGeneratedAnswer` event handling will be resolved once all flows use `QuanticGeneratedAnswerBody`.
