/**
 * The injected component-contracts type — the runtime's decoupling seam.
 *
 * `@coveo/thermidor` validates every session against a contract that is
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
 * (`^3.25 || ^4`). Keep it that way: reaching for an internal here would
 * silently break consumers on the other major. See `zod-major-compat.test.ts`.
 */

/**
 * The success/failure result returned by {@link ParsableSchema.safeParse}.
 * Narrowed to the fields the core reads: the parsed `data` on success and the
 * issue list on failure (used for a dev-only diagnostic).
 */
export type SafeParseResult =
  | {readonly success: true; readonly data: unknown}
  | {readonly success: false; readonly error: {readonly issues: readonly ParseIssue[]}};

/** A single Zod issue, narrowed to the fields the dev-only diagnostic reads. */
export interface ParseIssue {
  readonly path: ReadonlyArray<string | number | symbol>;
  readonly message: string;
}

/**
 * The minimal structural shape the core needs from any Zod schema: a
 * `safeParse` returning a discriminated success/failure result. Declared
 * locally (rather than importing `z.ZodType`) to sidestep the cross-package Zod
 * version-identity mismatch — the injected schema may even come from a
 * different Zod major, and `safeParse` is structurally compatible across both.
 */
export interface ParsableSchema {
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
 * A single component-contract member: a Zod object schema whose `shape`
 * exposes the PascalCase `component` discriminant literal (`{ value }`) and the
 * component's optional `state` and `actions` sub-schemas.
 */
export interface ComponentContractSchema {
  readonly shape: {
    readonly component: {readonly value: string};
    readonly state?: ParsableSchema;
    readonly actions?: ParsableSchema;
  };
}

/**
 * The injected contracts schema: a Zod discriminated union on `component`
 * exposing its member list through `.options`. The concrete
 * `ComponentContractsSchema` of any A2-UI contract package is assignable to it.
 */
export interface ContractsSchema {
  readonly options: readonly ComponentContractSchema[];
}
