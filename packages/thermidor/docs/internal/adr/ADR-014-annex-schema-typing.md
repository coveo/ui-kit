---
status: Accepted
date: 2026-09-15
related:
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-013-remote-controller-vending.md
---

# ADR-014 — Annex: schema typing (injected contracts)

Type-system detail supporting [ADR-014](./ADR-014-consumer-supplied-endpoint-and-schema.md).
This is implementation-level material, not a separate decision.

## Verified result

DX (intellisense) is a charter MUST. This was prototyped against the real
`typeof ComponentContractsSchema` (beta.3) with `tsc`:

- **Full intellisense is achievable and confirmed** when the concrete schema is
  pinned at `createSession(...)`. Verified: `createSession({ contracts:
ComponentContractsSchema })` → `session.remoteController('cmp', 'next-actions-bar')`
  → `.dispatch('selectAction', { text, type: 'search' })` gives autocomplete on the
  component type, autocomplete on the action name (a real literal union, not
  `string`), a type-checked payload (wrong enum value errors), and typed `state`.

## Load-bearing design rule

`createSession` MUST be generic over the contracts type and infer it from the
`contracts` argument, and that concrete `TContracts` MUST be threaded unbroken
through `Session<TContracts>` → `remoteController<T>()` → `RemoteController<TContracts, T>`.
As long as the concrete type flows from the argument to the `.dispatch` call site,
action typing resolves.

## Failure mode to avoid

If any internal seam widens `TContracts` back to the bare `ContractsSchema`
constraint (e.g., storing the schema as the constraint type and re-vending
controllers from that), `keyof z.infer<…['actions']>` collapses to `never` and
action-name typing is lost (state typing still survives, because it is a direct
`z.infer` rather than a `keyof`). Do not erase the concrete schema type behind an
internal generic boundary.

## Constraint spelling (Zod v4)

The constraint is `z.ZodDiscriminatedUnion<ComponentContractSchema[]>` — a single
tuple-of-options type argument, with members
`z.ZodObject<{ componentType; state; actions }, z.core.$strict>`. This is the v4
shape; the v3 `ZodDiscriminatedUnion<'componentType', Options[]>` form does not
match and must not be used.

## Derivation helpers (sketch)

Parameterized on the injected schema type `TContracts`:

```ts
type ComponentTypeOf<TContracts extends ContractsSchema> = z.infer<TContracts>['componentType'];

type ContractFor<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> = Extract<TContracts['options'][number], {shape: {componentType: {value: T}}}>;

type StateFor<TContracts extends ContractsSchema, T extends ComponentTypeOf<TContracts>> = z.infer<
  ContractFor<TContracts, T>['shape']['state']
>;

type ActionNameFor<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> = keyof z.infer<ContractFor<TContracts, T>['shape']['actions']> & string;

type ActionPayloadFor<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
  A extends ActionNameFor<TContracts, T>,
> =
  z.infer<ContractFor<TContracts, T>['shape']['actions']> extends Record<A, {payload: infer P}>
    ? P
    : never;
```

These resolve correctly only when `TContracts` is the concrete injected type at the
call site (per the design rule above), which is why the prototype passed for a
`createSession`-pinned schema and failed when the schema was erased behind a
standalone generic function.
