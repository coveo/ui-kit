import {describe, expectTypeOf, it} from 'vitest';
import {z} from 'zod/v4';
import {createSession} from '@/src/session/create-session.js';
import type {ActionNameFor, ComponentTypeOf, StateFor} from './types.js';

/**
 * ============================================================================
 * DX type test — compile-time acceptance gate (ADR-009).
 * ============================================================================
 *
 * This test pins a *real*, concrete contracts schema at the `createSession`
 * call site and asserts that the concrete `TContracts` threads unbroken through
 * `Session<TContracts>` → `remoteController<T>()` → `RemoteController<TContracts, T>`
 * (ADR-014 typing annex). It is the compile-time gate for the end-to-end typed
 * developer experience: if any internal seam widens the schema
 * back to the bare `ContractsSchema` constraint, `ActionNameFor` collapses to
 * `never` and the action-name assertions below fail to compile — surfacing the
 * regression in CI.
 *
 * The schema is declared IN this file (not imported from a schema package): it
 * is a realistic multi-component discriminated union built with the Zod v4
 * `z.discriminatedUnion` + `z.strictObject` spelling the `ContractsSchema`
 * constraint requires. This is the "real injected schema pinned at
 * `createSession`" the design's DX type test calls for.
 */
const componentContractsSchema = z.discriminatedUnion('componentType', [
  z.strictObject({
    componentType: z.literal('next-actions-bar'),
    state: z.strictObject({
      actions: z.array(z.strictObject({text: z.string(), type: z.string()})),
    }),
    actions: z.strictObject({
      selectAction: z.strictObject({
        payload: z.strictObject({text: z.string(), type: z.string()}),
      }),
    }),
  }),
  z.strictObject({
    componentType: z.literal('pagination'),
    state: z.strictObject({page: z.number(), pageSize: z.number()}),
    actions: z.strictObject({
      selectPage: z.strictObject({payload: z.strictObject({page: z.number()})}),
      setPageSize: z.strictObject({payload: z.strictObject({pageSize: z.number()})}),
    }),
  }),
]);

type Contracts = typeof componentContractsSchema;

describe('Remote controller end-to-end DX typing', () => {
  const session = createSession({
    organizationId: 'org',
    accessToken: 'token',
    contracts: componentContractsSchema,
  });

  it('componentType is the literal union of component types, not string', () => {
    // The vended-controller `componentType` parameter is the literal union
    // declared by the pinned schema — not the bare `string` type.
    expectTypeOf<ComponentTypeOf<Contracts>>().toEqualTypeOf<'next-actions-bar' | 'pagination'>();

    // The `remoteController` componentType argument accepts the declared
    // literals...
    session.remoteController('nab', 'next-actions-bar');
    session.remoteController('pager', 'pagination');

    // ...and rejects a component type absent from the schema.
    // @ts-expect-error 'not-a-component' is not a declared componentType.
    session.remoteController('bad', 'not-a-component');

    // It must NOT be typed as the bare `string`.
    expectTypeOf<ComponentTypeOf<Contracts>>().not.toEqualTypeOf<string>();
  });

  it('dispatch action name is the literal union, not string and not never', () => {
    const controller = session.remoteController('nab', 'next-actions-bar');
    type ActionArg = Parameters<typeof controller.dispatch>[0];

    // The action-name union for this component resolves to its declared action
    // literals. Asserting this specifically detects the `never` collapse the
    // ADR-014 annex warns about (state typing would survive a `never` collapse
    // and mask the regression).
    expectTypeOf<ActionArg>().toEqualTypeOf<'selectAction'>();
    expectTypeOf<ActionArg>().not.toEqualTypeOf<never>();
    expectTypeOf<ActionArg>().not.toEqualTypeOf<string>();

    // The pagination component carries a two-literal action union.
    expectTypeOf<ActionNameFor<Contracts, 'pagination'>>().toEqualTypeOf<
      'selectPage' | 'setPageSize'
    >();
    expectTypeOf<ActionNameFor<Contracts, 'pagination'>>().not.toEqualTypeOf<never>();
  });

  it('a wrong-typed dispatch payload is a compile error', () => {
    const controller = session.remoteController('pager', 'pagination');

    // A correctly-typed payload for the bound action type-checks.
    void controller.dispatch('selectPage', {page: 1});

    // A payload whose shape does not match the declared action payload is a
    // compilation error (`page` must be a number).
    // @ts-expect-error payload.page must be a number, not a string.
    void controller.dispatch('selectPage', {page: 'one'});

    // A payload keyed for a different action is also rejected.
    // @ts-expect-error selectPage takes {page}, not {pageSize}.
    void controller.dispatch('selectPage', {pageSize: 10});
  });

  it('state is StateFor<...> | undefined, not unknown', () => {
    const controller = session.remoteController('nab', 'next-actions-bar');

    expectTypeOf(controller.state).toEqualTypeOf<
      StateFor<Contracts, 'next-actions-bar'> | undefined
    >();
    expectTypeOf(controller.state).not.toBeUnknown();

    const pager = session.remoteController('pager', 'pagination');
    expectTypeOf(pager.state).toEqualTypeOf<{page: number; pageSize: number} | undefined>();
    expectTypeOf(pager.state).not.toBeUnknown();
  });
});
