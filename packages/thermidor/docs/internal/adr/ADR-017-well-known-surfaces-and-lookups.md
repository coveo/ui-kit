---
status: Proposed
date: 2026-10-20
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-011-session-serialization.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-015-surface-and-route-derivation.md
  - ./ADR-016-inline-state-consumption-remove-remote-controller.md
  - thermidor-schema ADR-020 (well-known surfaces and lookup actions)
---

# Well-known surfaces and lookup actions

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md). This ADR **amends**
> [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md) (the injected contract),
> [ADR-015](./ADR-015-surface-and-route-derivation.md) (surfaces derived from turns) and
> [ADR-016](./ADR-016-inline-state-consumption-remove-remote-controller.md) (dispatch from the
> active turn).

## Context and Problem Statement

`thermidor-schema` ADR-020 decides how query suggestions work:

- The contract declares **well-known surface templates**: surfaces whose composition and initial
  state it fixes, but not their id. A consumer creates an instance of one itself, under a surface
  id of its choosing, before that instance's first request, and the producer only writes its
  state. A lookup sends the template name with its action. The first template is the search box,
  whose root is a `QuerySuggestions` component.
- Some actions are **lookups**, marked in the contract. A lookup is answered outside the line,
  with or without a session, and writes only its source component's state. `fetchSuggestions` is
  one.

The point is the user experience: the search box is usable on first paint, before the producer
has answered anything, and is never swapped while the shopper types.

The session cannot support this today:

- **Surfaces come from turns.** A turn's surfaces and state are derived from that turn's own
  `activities` (ADR-015). Nothing creates a surface before a request, or outside a turn.
- **Dispatch needs the active turn.** `dispatchAction` resolves the source component only in the
  active turn, and drops the action otherwise (ADR-016).
- **Everything waits in line.** The session has one in-flight stream. Actions run one after
  another, and are held back while a prompt streams.
- **The contract is a component union.** The session receives the component contracts (ADR-014),
  but nothing about surfaces or lookups.

## Decision Drivers

- **Faithful transmission and rendering (charter MUST).** A well-known surface is rendered exactly
  as the contract declares it, with A2-UI's standard rendering.
- **First paint.** The search box surface exists before any request, and its input is never
  remounted.
- **Any number of instances.** A page can draw several search boxes, such as one in the header and
  one in a drawer, and they never interfere.
- **Lookups.** A lookup never waits for, blocks or fails another action or turn. A newer lookup
  from the same surface and component replaces the previous one.
- **Best-in-class DX (charter MUST).** An application renders the search box with no code that
  stitches its own input to an A2-UI component, and injects one contract.
- **Breaking changes are acceptable.** The package is experimental and published as `0.x`, where a
  minor release may break its API. Each breaking change ships with a changeset that describes the
  migration.

## Considered Options

### Option A: create the well-known surfaces in a synthetic first turn

- **Summary:** the session opens a turn at construction that carries the well-known surfaces'
  `createSurface` messages.
- **Pros:** surfaces stay derived from turns.
- **Cons:**
  - Turns are the transcript. A turn with no prompt and no response would appear in it and in
    serialized sessions.
  - The first prompt opens turn 1, so the search box would stop accepting actions (ADR-016).

### Option B: the application creates the surface itself

- **Summary:** the session knows nothing about well-known surfaces. The application feeds their
  `createSurface` to its renderer and sends their lookups itself.
- **Pros:** no change to the session.
- **Cons:** every application rebuilds the same plumbing: creating the surface, routing its
  actions outside `dispatchAction`, superseding lookups and applying their results. That is the
  stitching the design exists to avoid.

### Option C (selected): the session holds the well-known surfaces, and sends lookups in a lane of their own

- **Summary:** the application asks the session for an instance of a well-known surface template
  where it draws one. The session creates it outside any turn, and sends its lookups at once.
- **Pros:** an application renders the search box like any surface, and its actions go through
  `dispatchAction` like any other.
- **Cons:** the session gains a small layer beside turns, and a second message stream for renderer
  integrations to feed.

## Decision Outcome

Adopt **Option C**.

### The injected contract

The session reads the well-known surface templates and the lookup marks from the contract it is
given. ADR-014's injected contracts schema becomes one contract bundle with three parts, which
`@coveo/thermidor-schema` generates in both of its entry points:

```ts
export const ThermidorContract = {
  components: ComponentContractsSchema,
  wellKnownSurfaces: WellKnownSurfaces,
  lookupActions: LookupActions,
} as const;
```

- **One input.** `SessionConfig` replaces `contracts` with `contract`, and an application injects
  the bundle: `createSession({contract: ThermidorContract, ...})`. Separate inputs would let the
  pieces come from different schema versions, so that the session validates against one contract
  and creates another one's surfaces, or let an application leave the lookup actions out, so that
  every action on a well-known surface is dropped with only a dev-only warning. The rename keeps
  no compatibility for `contracts`.
- **Accepted by its shape.** The session accepts any contract with `components`,
  `wellKnownSurfaces` and `lookupActions`, and never imports `@coveo/thermidor-schema`, as ADR-014
  requires.
- **Not inside the component union.** The templates describe surfaces, not components, so they do
  not belong in `ComponentContractsSchema`. The lookup mark belongs to each action, but the Zod
  projection has no place for it: Zod 3 has no metadata channel besides `.describe()`, and the
  session reads no Zod internals. Encoding it in the union would add fields that carry data instead
  of validating it.
- **Future contract-level metadata** goes into the bundle, not into new session inputs.

### Well-known surfaces

- **Created by the application, per placement.** The application asks the session for an
  instance of a template where it draws one, and disposes of it when it stops drawing it. The
  session turns the template into the instance's `createSurface` message at once, before any
  request, so a renderer can draw it on first paint. It refuses a template the contract does not
  declare, and a surface id that a live instance already holds.
- **Ids chosen by the application.** The application may pass the surface id. Otherwise the
  session mints one that is unique within the session. A server-rendered surface needs an id that
  is the same on server and client, such as one derived from React's `useId`.
- **Outside turns.** Instances belong to no turn. Each one exposes its renderer messages as a
  stream of its own, beside the turns, and appends each of its lookup results to it. They use the
  same v0.9 projection as turns (ADR-015 addendum).
- **Fed once, never replayed.** A renderer integration feeds each new message to the renderer once.
  Clearing and replaying the stream would recreate the surface and remount the input. It feeds the
  creation before the first paint, for example from a React layout effect, and deletes the surface
  from its renderer when it disposes of the instance.
- **Rendered by the instance's id.** The integration renders the instance it created:

  ```tsx
  function SearchBox() {
    const surface = useWellKnownSurface(SearchBoxSurface); // created in a layout effect
    return surface ? <A2UIRenderer surfaceId={surface.surfaceId} /> : null;
  }
  ```

  The hook belongs to the renderer integration. demo-schema-react implements it on top of the
  session's instances.

- **Disposed with their renderer.** Disposing of an instance aborts its in-flight lookups and drops
  their late results.

- **Validated like any surface.** An inbound `updateDataModel` for a well-known surface is validated
  against its component's contract before it reaches the renderer.
- **Not serialized.** A restored session's application creates its instances again.
  Their state is lookup results, which the next keystroke replaces. ADR-011 is unchanged.

### Dispatch

`dispatchAction` resolves an action whose source component is on a live instance against its
template's declaration, and sends it in the lookup lane, with the template name as the request's
`surfaceTemplate`. It needs no active turn, which amends
ADR-016 for these surfaces. An action from a well-known surface that the contract does not mark as a
lookup is dropped with a dev-only warning; the contract never places one there.

### Request lanes

| Lane                 | Members                                                    | Behavior                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prompts and gestures | `submitPrompt`, and component actions that are not lookups | Unchanged.                                                                                                                                                                                                               |
| Lookups              | component actions the contract marks as lookups            | Sent at once, alongside any prompt or gesture, with the session token when there is one. A new lookup from the same surface, source component and action aborts the previous one. A lookup's failure never fails a turn. |

A lookup's run applies only to live instances. It never opens a turn or folds into one,
and the session never adopts session keys from it. So a shopper who only types opens no session,
and the first prompt still opens it, as it does today.

### The search box in the renderer

The `QuerySuggestions` catalog component draws the whole search box: the input and the completions
popover.

- The input holds what is typed, on the renderer side.
- An empty input sends no lookup and shows no completions.
- A submit hides the completions until the next keystroke, so a lookup that answers after the
  submit cannot reopen them.
- What submitting does is the application's: the component receives it from the application, for
  example through a React context. Whether `submitPrompt` becomes an action the component
  dispatches is left to the prompt-submission ADR.

demo-schema-react implements this as the reference.

### Rationale

Option A bends the transcript to hold something that is not part of it. Option B pushes the same
plumbing into every application. Option C puts it once in the session, where `dispatchAction`,
superseding and in-transit validation already live, and leaves applications rendering a surface
and choosing what a submit does.

Instances are created by the application rather than at construction, because only the
application knows how many search boxes it draws and for how long. A fixed surface id per template
would allow one per page: two search boxes would share a surface and a superseding key, so typing
in one would abort the other's lookups.

## Impact on the Charter

- **Faithful transmission and rendering (MUST):** preserved. A well-known surface is the contract's
  template, applied as declared under the application's surface id, and its state is the producer's, validated in transit.
- **Public API independence (MUST):** unchanged. Well-known surfaces are exposed as the same
  renderer messages as turns.
- **Best-in-class DX (MUST):** improved. The search box needs no stitching, and the application
  injects one contract.
- **Consumer-owned inputs (MUST):** unchanged. The input stays on the renderer side.
- **Conditional SSR (SHOULD):** helped. The search box surface exists without any request, so a
  server can render it, under an id that hydration reproduces.
- **Simplicity (SHOULD):** mixed. The session gains a layer beside turns and a lane for lookups,
  but applications lose all of their search box plumbing.

## Consequences

- **Positive:**
  - The search box is drawn on first paint and never remounted while the shopper types.
  - Suggestions work before the first prompt and while an answer streams.
  - A page can draw any number of search boxes.
  - Instant products, or other well-known surfaces, reuse the same mechanism.
- **Negative:**
  - The injected contract changes shape. It ships in a minor `0.x` release with a changeset.
  - Renderer integrations create and dispose of instances, and feed each one's message stream,
    once per message.
  - Instances belong to a session handle, so an application that replaces its session to start a
    new conversation remounts the search box.
  - The mock converse service must answer lookups with or without a session.
- **Neutral:** an earlier version of this ADR made every surface session-scoped. Query suggestions no
  longer need that, so it is left to a decision of its own.

## Implementation and Follow-up

- **Overlapping runs are allowed.** A lookup's run can overlap a prompt's run on the same thread.
  - AG-UI only requires a run id that is unique within the thread, and validates event order per
    stream.
  - This package parses each stream on its own, so concurrent streams only need the request lanes
    above.
- **Session-scoped surfaces.** Whether surfaces created by turns live for the whole session, as the
  producer and A2-UI scope them, so that earlier turns' surfaces keep accepting actions.
- **Starting a new conversation without remounting the search box.** For example by letting a
  session handle start a new conversation.
- **Instant products.** See `thermidor-schema` ADR-020's follow-up decisions.
