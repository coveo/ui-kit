import type {z} from 'zod/v4';
import type {Unsubscribe} from '@/src/session/store.js';

/**
 * The surviving base controller shape: a current `state` snapshot plus a
 * `subscribe(listener)` seam. It replaces the engine-backed base controller
 * (ADR-010) and depends only on the observable store's `Unsubscribe`.
 */
export interface Controller<T = unknown> {
  /**
   * The current state of the controller.
   */
  readonly state: T;

  /**
   * Subscribes to controller state changes.
   *
   * @param listener - Invoked when the controller state changes.
   * @returns A function that unsubscribes the listener.
   */
  subscribe(listener: () => void): Unsubscribe;
}

/**
 * ============================================================================
 * Generic remote-controller contract type helpers (Zod v4)
 * ============================================================================
 *
 * These types derive component state and action typings from an *injected*
 * contracts schema (`TContracts`). They resolve correctly only when
 * `TContracts` is the concrete injected type pinned at the `createSession`
 * call site; widening it back to the bare `ContractsSchema` constraint
 * collapses `ActionNameFor` to `never` (ADR-014 annex).
 *
 * The Zod v4 spelling is used throughout: `ZodDiscriminatedUnion` takes a
 * tuple-of-options type argument, and the object config is `z.core.$strict`.
 * The v3 form `ZodDiscriminatedUnion<'componentType', Options[]>` is NOT used.
 */

/**
 * A single component contract: a strict Zod object exposing a `componentType`
 * discriminant literal, a `state` schema, and an `actions` schema.
 */
export type ComponentContractSchema = z.ZodObject<
  {componentType: z.ZodLiteral<string>; state: z.ZodType; actions: z.ZodType},
  z.core.$strict
>;

/**
 * The injected contracts schema: a discriminated union of component contracts
 * (Zod v4 tuple-of-options spelling).
 */
export type ContractsSchema = z.ZodDiscriminatedUnion<ComponentContractSchema[]>;

/**
 * The literal union of component types declared by a contracts schema.
 */
export type ComponentTypeOf<TContracts extends ContractsSchema> =
  z.infer<TContracts>['componentType'];

/**
 * The single component contract within `TContracts` whose `componentType`
 * literal matches `T`.
 */
export type ContractFor<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> = Extract<TContracts['options'][number], {shape: {componentType: {value: T}}}>;

/**
 * The inferred state type of the component `T` in `TContracts`.
 */
export type StateFor<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> = z.infer<ContractFor<TContracts, T>['shape']['state']>;

/**
 * The literal union of action names declared by the component `T` in
 * `TContracts`.
 */
export type ActionNameFor<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> = keyof z.infer<ContractFor<TContracts, T>['shape']['actions']> & string;

/**
 * The payload type of the action `A` on the component `T` in `TContracts`.
 */
export type ActionPayloadFor<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
  A extends ActionNameFor<TContracts, T>,
> =
  z.infer<ContractFor<TContracts, T>['shape']['actions']> extends Record<A, {payload: infer P}>
    ? P
    : never;

/**
 * A controller for one server-owned entry in the active turn's AG-UI state
 * snapshot. Its `state` is the validated `StateFor<...>` (or `undefined` when
 * the snapshot is missing/empty), and `dispatch` is typed against the injected
 * contract's action schema.
 */
export interface RemoteController<
  TContracts extends ContractsSchema,
  T extends ComponentTypeOf<TContracts>,
> extends Controller<StateFor<TContracts, T> | undefined> {
  readonly componentId: string;
  dispatch<A extends ActionNameFor<TContracts, T>>(
    action: A,
    payload: ActionPayloadFor<TContracts, T, A>
  ): Promise<void>;
}
