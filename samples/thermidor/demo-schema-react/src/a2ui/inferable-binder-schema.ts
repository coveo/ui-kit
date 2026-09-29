import {
  DataBindingSchema,
  DynamicBooleanSchema,
  DynamicNumberSchema,
  DynamicStringSchema,
} from '@copilotkit/a2ui-renderer';

/**
 * Types a generated prop schema so `createReactComponent` can infer the component's props.
 *
 * This file used to ALSO rebuild each schema into the binder's Zod dialect at runtime, because
 * the generated schemas were Zod 4 and `@a2ui/web_core`'s binder reads Zod 3 internals. The
 * schema package now publishes that dialect directly (`@coveo/thermidor-schema/zod3`), so the
 * runtime rebuild is gone and what remains is purely a compile-time concern.
 *
 * The residual problem is inference, not dialect: the generator emits `z.unknown()` for every
 * array/object prop, so a schema's own `z.infer` cannot carry composite shapes — it would
 * collapse `values`/`products`/`tiers`/… to `unknown`. That is true of both dialects, so the
 * domain `XxxProps` type remains the only carrier of those shapes and callers pass it as the
 * `Output` type argument.
 */

/**
 * Maps a domain field to the type the binder will hand the render callback.
 *
 * A SCALAR (`string`/`number`/`boolean`) field maps to the BINDER's dynamic-value union
 * (`typeof Dynamic*Schema._output` = `T | DataBinding | FunctionCall`), whose `DataBinding`/
 * `FunctionCall` are the NOMINAL types `ResolveA2uiProps` inspects: it detects `DataBinding` to
 * synthesize each `set<Field>`, and `ResolveA2uiProp` then excludes both to leave a clean
 * resolved value (`string`/`number`/…). A COMPOSITE field (array / object / child-ref) is passed
 * through unchanged as a STATIC field: it carries no `DataBinding`, so `ResolveA2uiProp` returns
 * it verbatim (`RegularFacetValue[]`, `RegularFacetSearch`, `string[]`, …) and no setter is
 * generated — which is correct, since composite state is backend-owned and never two-way bound.
 */
type DynamicFieldOf<V> = [NonNullable<V>] extends [string]
  ? typeof DynamicStringSchema._output
  : [NonNullable<V>] extends [number]
    ? typeof DynamicNumberSchema._output
    : [NonNullable<V>] extends [boolean]
      ? typeof DynamicBooleanSchema._output
      : V;

/**
 * The binder's Zod 3 `ZodObject` type re-shaped to OUR fields.
 *
 * Base = `typeof DataBindingSchema` (a real binder Zod 3 `ZodObject`) so the result satisfies
 * `ComponentApi.schema`; each field's `_output` is mapped per {@link DynamicFieldOf}.
 */
type InferableBinderSchema<Output> = Omit<typeof DataBindingSchema, '_output' | 'shape'> & {
  _output: {[K in keyof Output]?: DynamicFieldOf<ResolvedFieldValue<Output[K]>>};
  shape: {[K in keyof Output]: typeof DataBindingSchema};
};

/**
 * The resolved value of a domain field. A SCALAR union (its literal branch plus the generated
 * `{path}`/`{functionName}` dynamic branches) reduces to the plain scalar so {@link DynamicFieldOf}
 * re-maps it to the binder dynamic-value union. A COMPOSITE field (array / object / child-ref) has
 * no dynamic branch to strip, so it is kept intact and flows through as STATIC.
 */
type ResolvedFieldValue<F> = [NonNullable<F>] extends [string]
  ? string
  : [NonNullable<F>] extends [number]
    ? number
    : [NonNullable<F>] extends [boolean]
      ? boolean
      : F;

/**
 * Declares `propsSchema` as a binder-Zod-3 `ZodObject` whose `z.infer` is the component's own
 * domain field shape — scalars as dynamic-value unions, composites passed through — so
 * `createReactComponent(schema)` infers `props` (with `set<Field>` setters for the scalars) and
 * the render callback needs NO manual props annotation or body cast.
 *
 * Types only: the value is returned untouched. It is already in the binder's dialect, coming from
 * `@coveo/thermidor-schema/zod3`. The cast is needed because the schema package and the renderer
 * resolve different Zod installs, so two structurally identical `ZodObject` types are nominally
 * distinct to the compiler (Zod 3's `ZodObject` declares a private `_cached` member, and private
 * members are only assignable from the same declaration). The binder itself matches structurally,
 * on `_def.typeName`, precisely to avoid the same dual-module problem at runtime. This disappears
 * once the renderer and the schema resolve a single shared Zod install.
 *
 * `Output` is the domain `XxxProps` type, supplied by the caller as an explicit type argument:
 * the generated schema's own `z.infer` types composite fields as `unknown`, so it cannot carry
 * those shapes into inference on its own.
 */
export function toInferableBinderSchema<Output>(propsSchema: {
  shape: Record<string, unknown>;
}): InferableBinderSchema<Output> {
  return propsSchema as unknown as InferableBinderSchema<Output>;
}
