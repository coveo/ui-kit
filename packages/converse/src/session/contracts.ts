/**
 * The injected component-contracts type — the runtime's decoupling seam.
 *
 * `@coveo/converse` validates every session against a contract that is
 * INJECTED through {@link SessionConfig.contracts}, never imported from a
 * concrete schema package. {@link ContractsSchema} is the STRUCTURAL type that
 * seam accepts: a Zod discriminated union on the `component` field whose every
 * member carries that component's optional `state` and `actions` sub-schemas.
 *
 * It is declared STRUCTURALLY (not by importing `@coveo/thermidor-schema`, and
 * not in terms of the cross-package `z.*` classes whose version identity does
 * not match this package's Zod) so the runtime works with ANY A2-UI contract
 * schema of this shape — the Coveo schema is merely one such contract a
 * consumer may inject. The concrete `ComponentContractsSchema` produced by
 * `@coveo/thermidor-schema` is assignable to this type: it is
 * `z.discriminatedUnion('component', [...])` whose members are
 * `z.object({ component: z.literal(...), state?, actions? })`, and every field
 * the seam reads (`options`, `shape.component.value`, `shape.state`,
 * `shape.actions`, `safeParse`) is present on it.
 *
 * Those members are all stable public Zod API that behaves identically in Zod 3
 * and Zod 4, and no Zod internal (`_def`, `typeName`, ...) is read anywhere in
 * this package — which is what lets the `zod` peerDependency span both majors
 * (`3.25.76 || ^4`). Zod 4 is accepted as a range; the Zod 3 side is pinned to the
 * exact version the A2-UI renderer's binder resolves (`@a2ui/web_core` depends on
 * `^3.25.76`), because a Zod 3 consumer has to share that one install — two copies
 * of Zod 3 are structurally identical but nominally distinct, so schemas built
 * against a different copy are not assignable. Keep it that way: reaching for an
 * internal here would silently break consumers on the other major. See
 * `zod-major-compat.test.ts`.
 */

// Narrowed to fields read by the core so the injected schema can be built with either supported
// Zod major.
/**
 * The result of {@link ParsableSchema.safeParse}: the parsed `data` on success, or the validation
 * issues on failure.
 *
 * @group Contracts
 */
export type SafeParseResult =
  | {
      /** `true` when the value is valid. */
      readonly success: true;
      /** The parsed value. */
      readonly data: unknown;
    }
  | {
      /** `false` when the value is invalid. */
      readonly success: false;
      /** The validation error. */
      readonly error: {
        /** The validation issues. */
        readonly issues: readonly ParseIssue[];
      };
    };

// Only the fields used by the dev-only validation diagnostic are represented here.
/**
 * A single validation issue, such as a Zod issue.
 *
 * @group Contracts
 */
export interface ParseIssue {
  /** The path to the value that failed validation. */
  readonly path: ReadonlyArray<string | number | symbol>;
  /** Why the value failed validation. */
  readonly message: string;
}

// Declared structurally instead of importing Zod types to avoid cross-package version identity.
/**
 * A schema that validates a value without throwing, such as any Zod 3 or Zod 4 schema.
 *
 * @group Contracts
 */
export interface ParsableSchema {
  /**
   * Validates `value` without throwing.
   *
   * @param value - The value to validate.
   * @returns The parsed value on success, or the validation issues on failure.
   */
  safeParse(value: unknown): SafeParseResult;
}

/**
 * A Zod object schema, narrowed to its `.shape` (a record of field sub-schemas)
 * and its `.safeParse`. Used for a component's `state` object and for walking
 * partial-update sub-paths.
 */
export interface ObjectSchema extends ParsableSchema {
  readonly shape: Record<string, ParsableSchema | undefined>;
}

/**
 * The contract of one component: a Zod object schema whose `shape` holds the component's
 * PascalCase `component` literal and its optional `state` and `actions` schemas.
 *
 * @group Contracts
 */
export interface ComponentContractSchema {
  /** The member's field schemas. */
  readonly shape: {
    /** The literal schema of the component's `component` discriminant. */
    readonly component: {
      /** The PascalCase component name, such as `'CommerceSearch'`. */
      readonly value: string;
    };
    /**
     * The object schema of the component's state, optionally wrapped in `.optional()`. Without an
     * object schema, every `updateDataModel` operation addressed to the component is dropped from
     * `Session.state`; `Session.a2uiMessages` still carries it to the renderer.
     */
    readonly state?: ParsableSchema;
    /**
     * The object schema of the component's actions, optionally wrapped in `.optional()`: keyed by
     * action name, each value an object schema whose `payload` field validates the dispatched
     * payload, such as `{ fetchSuggestions: z.strictObject({ payload: FetchSuggestionsPayloadSchema }) }`.
     * A dispatch whose action isn't declared, or whose payload doesn't match, is withheld.
     */
    readonly actions?: ParsableSchema;
  };
}

/**
 * The component contracts a session validates against: a Zod discriminated union on `component`,
 * whose `options` list one {@link ComponentContractSchema} per component.
 *
 * @remarks
 * The `ComponentContractsSchema` of an A2-UI contract package, such as `@coveo/thermidor-schema`,
 * is assignable to it, whether it was built with Zod 3 or Zod 4.
 *
 * @group Contracts
 */
export interface ContractsSchema {
  /** The union's members, one per component. */
  readonly options: readonly ComponentContractSchema[];
}

/**
 * Lists of action names by component, keyed by the `component` literal of each member of
 * `TComponents`, such as the actions a consumer keeps in a list of its own.
 *
 * @remarks
 * A member's action names are read from its `actions` object schema, unwrapped when optional.
 * They are `string` when its type doesn't expose them, as for the structural
 * {@link ContractsSchema} default.
 *
 * @example
 * ```ts
 * const contracts = z.discriminatedUnion('component', [
 *   z.strictObject({
 *     component: z.literal('RegularFacet'),
 *     actions: z.strictObject({search: z.strictObject({payload: z.strictObject({})})}).optional(),
 *   }),
 * ]);
 *
 * type FacetActions = ComponentActionNames<typeof contracts>;
 * // {readonly RegularFacet?: readonly 'search'[]}
 * ```
 *
 * @group Actions
 */
export type ComponentActionNames<TComponents extends ContractsSchema = ContractsSchema> = {
  readonly [
    TMember in TComponents['options'][number] as TMember['shape']['component']['value']
  ]?: readonly (TMember extends {
    readonly shape: {readonly actions?: infer TActions};
  }
    ? NonNullable<TActions> extends {unwrap(): {readonly shape: infer TShape}}
      ? keyof TShape & string
      : NonNullable<TActions> extends {readonly shape: infer TShape}
        ? keyof TShape & string
        : string
    : string)[];
};
