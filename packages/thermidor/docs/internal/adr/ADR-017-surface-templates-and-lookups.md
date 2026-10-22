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
  - thermidor-schema ADR-020 (surface templates and lookup actions)
---

# Surface templates and lookup actions

This ADR amends [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md) (the session takes
one contract bundle), [ADR-015](./ADR-015-surface-and-route-derivation.md) (surface instances
do not come from turns) and
[ADR-016](./ADR-016-inline-state-consumption-remove-remote-controller.md) (lookups are dispatched
without an active turn).

## Context and Problem Statement

`thermidor-schema` ADR-020 decides how query suggestions work:

- The contract declares **surface templates**. A template fixes a surface's composition
  and initial state, but not its id: the application creates instances of it, and the producer
  only writes their state. It never creates, recomposes (`updateComponents`) or deletes an
  instance. The first template is the search box, whose root is a `QuerySuggestions` component.
- Each template has a **catalog of its own**, exactly the components it places. `QuerySuggestions`
  is in the search box's catalog, and no longer in the conversational component union.
- An instance's surface id starts with **`template:`**, and the id of a surface the producer
  creates never does.
- The contract marks some actions as **lookups**, such as `fetchSuggestions`. A lookup is answered
  outside the session's request queue, with or without a session.

The session cannot support this today:

- **Surfaces come from turns.** A turn's surfaces and state are derived from that turn's own
  `activities` (ADR-015). Nothing creates a surface before a request, or outside a turn.
- **Dispatch needs the active turn.** `dispatchAction` resolves the source component only in the
  active turn, and drops the action otherwise (ADR-016).
- **Every request waits in one queue.** The session has one in-flight stream. Actions run one after
  another, and are held back while a prompt streams.
- **The contract is a component union.** The session receives the component contracts (ADR-014),
  but nothing about surfaces or lookups.

## Decision Drivers

- **Faithful transmission and rendering (charter MUST).** A surface instance is rendered exactly
  as the contract declares it, with A2-UI's standard rendering.
- **First paint.** The search box is usable on first paint, before the producer has answered
  anything, and its input is never remounted while the shopper types.
- **Any number of instances.** A page can draw several search boxes, such as one in the header and
  one in a drawer, and they never interfere.
- **Lookups.** A lookup never waits for, blocks or fails another action or turn. A newer lookup
  from the same surface, source component and action replaces the previous one.
- **Best-in-class DX (charter MUST).** An application renders the search box with no code that
  stitches its own input to an A2-UI component, and injects one contract.
- **Breaking changes are acceptable.** The package is experimental and published as `0.x`, where a
  minor release may break its API. Each breaking change ships with a changeset that describes the
  migration.

## Considered Options

### Option A: create the surface instances in a synthetic first turn

- **Summary:** the session opens a turn at construction that carries a `createSurface` message
  for each surface template.
- **Pros:** surfaces stay derived from turns.
- **Cons:**
  - Turns are the transcript. A turn with no prompt and no response would appear in it and in
    serialized sessions.
  - The first prompt opens turn 1, so the search box would stop accepting actions (ADR-016).

### Option B: the application creates the surface itself

- **Summary:** the session knows nothing about surface templates. The application feeds their
  instances' `createSurface` to its renderer and sends their lookups itself.
- **Pros:** no change to the session.
- **Cons:** every application rebuilds the same plumbing: creating the surface, routing its
  actions outside `dispatchAction`, superseding lookups and applying their results. That is the
  stitching the design exists to avoid.

### Option C (selected): the session holds the surface instances, and sends lookups in a lane of their own

- **Summary:** the application asks the session for an instance of a surface template
  where it draws one. The session creates it outside any turn, and sends its lookups at once.
- **Pros:** an application renders the search box like any surface, and its actions go through
  `dispatchAction` like any other.
- **Cons:** the session gains a small layer beside turns, and renderer integrations feed one more
  message stream per instance.

## Decision Outcome

Adopt **Option C**.

### The injected contract

The session reads the surface templates and the lookup marks from the contract it is
given. ADR-014's injected contracts schema becomes one bundle, which `@coveo/thermidor-schema`
generates in both its root and `zod3` entry points:

```ts
export const ThermidorContract = {
  components: ComponentContractsSchema,
  surfaceTemplates: SurfaceTemplates,
  lookupActions: LookupActions,
  surfaceInstanceIdPrefix: SURFACE_INSTANCE_ID_PREFIX, // 'template:'
} as const;
```

`components` is the conversational component union. Each entry of `surfaceTemplates` carries the
template's name, its own `catalogId`, its `createSurface` components and data model, and
`componentContracts`, the component union of its catalog.

- **One input.** `SessionConfig` replaces `contracts` with `contract`, and an application injects
  the bundle: `createSession({contract: ThermidorContract, ...})`. The rename keeps no
  compatibility for `contracts`. Separate inputs would allow two mistakes:
  - pieces from different schema versions, so that the session validates against one contract and
    creates another one's surfaces;
  - leaving the lookup actions out, so that every action on a surface instance is dropped with
    only a warning in development.
- **Accepted by its shape.** The session accepts any contract with `components`,
  `surfaceTemplates`, `lookupActions` and `surfaceInstanceIdPrefix`, and never imports `@coveo/thermidor-schema`, as ADR-014
  requires.
- **Not inside the component union.** The templates describe surfaces, not components, so they do
  not belong in `ComponentContractsSchema`. The lookup mark belongs to each action, but the Zod
  projection has no place for it: Zod 3 has no metadata channel besides `.describe()`, and the
  session reads no Zod internals. Encoding it in the union would add fields that carry data instead
  of validating it.
- **Future contract-level metadata** goes into the bundle, not into new session inputs.

### Surface instances

- **Created and disposed of by the application, per placement.** The application asks the session
  for an instance of a template where it draws one, and disposes of it when it stops drawing it.
  The session refuses a template the contract does not declare, and a surface id that a live
  instance already holds. Disposing of an instance aborts its in-flight lookups and drops their
  late results.
- **Ids chosen by the application, with the contract's prefix.** The application may pass the
  surface id, and the session refuses one that does not start with `surfaceInstanceIdPrefix`, so an
  instance never collides with a surface the producer creates. Otherwise the session mints one
  that is unique within the session, such as `template:search-box-1`. A server-rendered surface
  needs an id that is the same on server and client, such as the prefix followed by one derived
  from React's `useId`.
- **Outside turns.** Instances belong to no turn. Each one exposes its renderer messages as a
  stream of its own, beside the turns, using the same v0.9 projection as turns (ADR-015 addendum).
  The stream starts with the instance's `createSurface` message, produced from the template at
  creation, before any request, and naming the template's own `catalogId`.
- **Fed once, never replayed.** A renderer integration feeds each new message to the renderer once:
  clearing and replaying the stream would recreate the surface and remount the input. It feeds the
  creation before the first paint, for example from a React layout effect, and deletes the surface
  from its renderer when it disposes of the instance.
- **Rendered by the instance's id.** The integration renders the instance it created:

  ```tsx
  function SearchBox() {
    const surface = useSurfaceInstance(SearchBoxSurfaceTemplate); // instantiateSurface in a layout effect
    return surface ? <A2UIRenderer surfaceId={surface.surfaceId} /> : null;
  }
  ```

  The hook belongs to the renderer integration. demo-schema-react implements it on top of the
  session's instances. The renderer registers the template's catalog under its `catalogId`.

- **Validated against the template's catalog.** An inbound `updateDataModel` for a surface instance
  is validated against the contract of the component it targets, in the template's
  `componentContracts`, before it reaches the renderer. Only `updateDataModel` applies to an
  instance: the producer never recomposes one.
- **Not serialized.** A restored session's application creates its instances again. Their state is
  lookup results, which the next keystroke replaces. ADR-011 is unchanged.

### Dispatch

When an action's source component is on a live instance, `dispatchAction` finds the component in
the instance, validates its payload against the template's `componentContracts`, and sends it in
the lookup lane, with the template name as the request's `surfaceTemplate`. It needs no active turn, which amends ADR-016 for these surfaces. If the
contract does not mark the action as a lookup, the template and the lookup marks disagree: the
action is dropped with a warning in development.

### Request lanes

| Lane                 | Members                                                    | Behavior                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prompts and gestures | `submitPrompt`, and component actions that are not lookups | Unchanged.                                                                                                                                                                                                               |
| Lookups              | component actions the contract marks as lookups            | Sent at once, alongside any prompt or gesture, with the session token when there is one. A new lookup from the same surface, source component and action aborts the previous one. A lookup's failure never fails a turn. |

A lookup's run only updates its source component's state, through the instance's stream. It never
opens a turn or folds into one, and the session never adopts a `sessionId` or `sessionToken` from
it. So a shopper who only types opens no session, and the first prompt still opens it, as it does
today.

A lookup's run can overlap a prompt's run on the same thread. AG-UI only requires a run id that is
unique within the thread, and validates event order per stream. This package parses each stream
on its own, so concurrent streams need nothing beyond these lanes.

### The search box in the renderer

The `QuerySuggestions` component, in the search box template's catalog, draws the whole search
box: the input and the completions popover.

- The input holds what is typed, on the renderer side.
- An empty input sends no lookup and shows no completions.
- A submit hides the completions until the next keystroke, so a lookup that answers after the
  submit cannot reopen them.
- What submitting does is the application's: the component receives a submit handler from the
  application, for example through a React context. Whether `submitPrompt` becomes an action the
  component dispatches is left to the prompt-submission ADR.

demo-schema-react implements this as the reference.

### Rationale

Option A puts in the transcript something that is not part of it, and Option B puts the same
plumbing in every application. Option C puts it once in the session, where `dispatchAction`,
superseding and in-transit validation already live.

The application creates instances, rather than the session at construction, because only the
application knows how many search boxes it draws and for how long. A fixed surface id per template
would allow one per page: two search boxes would share a surface and a superseding key, so typing
in one would abort the other's lookups.

## Impact on the Charter

- **Faithful transmission and rendering (MUST):** preserved. A surface instance is the contract's
  template, applied as declared under the application's surface id. Its state is the producer's,
  validated in transit.
- **Public API independence (MUST):** unchanged. Surface instances are exposed as the same
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
  - Instant products, or other surface templates, reuse the same mechanism.
- **Negative:**
  - Renderer integrations gain work: they create and dispose of instances, and feed each
    instance's stream without replaying it.
  - The search box instances belong to the session. A session cannot start a new conversation, so
    an application starts one by creating a new session, which recreates its search boxes: they
    remount and lose what the shopper typed.

## Implementation and Follow-up

- **Session-scoped surfaces.** A separate decision settles whether surfaces created by turns live
  for the whole session, as the producer and A2-UI scope them, so that earlier turns' surfaces keep
  accepting actions.
- **New conversations without remounting the search box.** A separate decision settles how an
  application starts a new conversation without creating a new session, for example by letting a
  session start one itself.
- **Instant products.** See `thermidor-schema` ADR-020's follow-up decisions.
