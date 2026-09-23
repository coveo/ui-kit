import {basicCatalog} from '@copilotkit/a2ui-renderer';
import type {z as z4} from 'zod';
/**
 * Runtime Zod 4 → Zod 3 migration for the catalog props schemas.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `@coveo/thermidor-schema` generates each component's `XxxPropsSchema` with Zod 4
 * (`z.object({...})`). The frozen A2-UI binder that resolves `{ "path": ... }` bindings —
 * `scrapeSchemaBehavior` / `getFieldBehavior` in `@a2ui/web_core@0.9.0` (a transitive, pinned
 * dependency of `@copilotkit/a2ui-renderer@1.61.2`) — classifies each prop field by reading
 * **Zod 3** runtime internals: `schema._def.typeName` (`'ZodUnion'`, `'ZodObject'`, `'ZodArray'`,
 * `'ZodString'`, `'ZodOptional'`, ...), `_def.options` for unions, and `_def.shape()` (a FUNCTION)
 * for objects. On a Zod 4 schema `_def.typeName` is `undefined`, so every field falls through to
 * STATIC and a `{ path }` A2-UI Data_Binding leaks to the renderer unresolved — the
 * `actions.map is not a function` crash. A TypeScript cast cannot fix this because the binder
 * inspects the runtime object, not the type.
 *
 * HOW IT WORKS
 * ------------
 * `@copilotkit/a2ui-renderer` re-exports `basicCatalog`, whose built-in component schemas (Text,
 * Button, Slider, CheckBox, Row, Card, ...) are authored with the **exact `zod@3.25.76` instance
 * the binder resolves** (the renderer's own dependency subtree). We harvest the Zod 3 schema
 * constructors and the canonical A2-UI dynamic-value unions (`{ path }`-bearing) from those
 * schemas, then rebuild each generated `XxxPropsSchema` as a real Zod 3 `ZodObject`:
 *   - a *bindable* field (a Zod 4 union that admits a `{ path }` Data_Binding) becomes the matching
 *     Zod 3 dynamic-value union — the shape `getFieldBehavior` classifies as DYNAMIC and resolves;
 *   - a *composition / scalar child-ref* field (a plain, non-union Zod 4 `string` / `string[]`,
 *     e.g. `CommerceSearch.sidebarChild`, `LayoutStack.children`, `direction`) becomes a plain
 *     Zod 3 `ZodString` / `ZodArray(ZodString)` — the shape the binder classifies as STATIC and
 *     passes through UNTOUCHED, so named-slot delivery (validated in
 *     `named-slot-delivery.test.tsx`) keeps receiving the raw child ids.
 *
 * Importing through `basicCatalog` (a declared sample dependency) is what makes this
 * browser-bundleable (vite build) and resolvable under tsc/vitest without adding a `zod@3`
 * dependency, a lockfile entry, or a pnpm-catalog change.
 *
 * We reproduce only the *shape* the binder classifies, not full validation: the binder classifies
 * and resolves, it does not validate.
 *
 * STATIC vs DYNAMIC field mapping
 * -------------------------------
 * The generated schemas declare composition child-refs as `z.string().optional()` /
 * `z.array(z.string()).optional()` (STATIC), distinct from the bindable `Dynamic*Schema` unions.
 * Mapping those to a dynamic union would let the binder rewrite the child ids and break named-slot
 * delivery. `migrateField` unwraps `optional`/`nullable`/`default` and maps a non-union field to a
 * plain Zod 3 STATIC schema, reserving the dynamic unions for Zod 4 union fields that actually carry
 * a DataBinding.
 *
 * @deprecated Remove this file and pass the generated `XxxPropsSchema` directly to `createCatalog`
 * once `@copilotkit/a2ui-renderer` upgrades its binder to Zod 4.
 */
// A minimal structural view of a Zod 3 schema's internals (the binder-relevant surface only).
interface Zod3Def {
  typeName: string;
  options?: Zod3Schema[];
  shape?: () => Record<string, Zod3Schema>;
  type?: Zod3Schema;
  innerType?: Zod3Schema;
}
interface Zod3Schema {
  _def: Zod3Def;
}
// The Zod 3 `ZodObject` class has a static `create(shape)` factory.
interface Zod3ObjectCtor {
  create(shape: Record<string, Zod3Schema>): Zod3Schema;
}
function objectShape(schema: Zod3Schema): Record<string, Zod3Schema> | undefined {
  return schema._def.typeName === 'ZodObject' ? schema._def.shape?.() : undefined;
}
/**
 * Harvest the Zod 3 building blocks from the frozen renderer's basic catalog. Each field we pull is
 * authored with the binder's own `zod@3.25.76`, so the shapes are exactly what `getFieldBehavior`
 * expects.
 */
function harvestZod3Primitives() {
  const componentSchema = (name: string): Zod3Schema => {
    const component = basicCatalog.components.get(name);
    if (!component) {
      throw new Error(`Expected the frozen basic catalog to define "${name}".`);
    }
    return component.schema as unknown as Zod3Schema;
  };
  const field = (componentName: string, fieldName: string): Zod3Schema => {
    const shape = objectShape(componentSchema(componentName));
    const value = shape?.[fieldName];
    if (!value) {
      throw new Error(
        `Expected basic-catalog "${componentName}" to expose the "${fieldName}" field.`
      );
    }
    return value;
  };
  // Canonical A2-UI dynamic-value unions (each is `union([literal, DataBinding, FunctionCall])`).
  const dynamicString = field('Text', 'text'); // string | { path } | call
  const dynamicNumber = field('Slider', 'value'); // number | { path } | call
  const dynamicBoolean = field('CheckBox', 'value'); // boolean | { path } | call
  const action = field('Button', 'action'); // { event } | { functionCall }
  const childList = field('Row', 'children'); // string[] | { componentId, path }
  // A plain Zod 3 `ZodString` STATIC child-ref (single named slot), harvested from `Card.child`.
  const staticString = field('Card', 'child');
  // The Zod 3 `ZodObject` factory, taken from any basic-catalog object schema.
  const zodObject = componentSchema('Text').constructor as unknown as Zod3ObjectCtor;
  // Rebuild the fine-grained dynamic-list and any-value unions from the harvested constructors so
  // they stay in the same Zod 3 module instance the binder resolves.
  const stringSchema = dynamicString._def.options![0];
  const numberSchema = dynamicNumber._def.options![0];
  const booleanSchema = dynamicBoolean._def.options![0];
  const dataBinding = dynamicString._def.options!.find(
    (option) => option._def.typeName === 'ZodObject' && !!objectShape(option)?.path
  )!;
  const functionCall = dynamicString._def.options!.find(
    (option) => option._def.typeName === 'ZodObject' && !objectShape(option)?.path
  )!;
  // `Row.children` first option is `array(ComponentId)`; reuse it as the array branch.
  const stringArraySchema = childList._def.options!.find(
    (option) => option._def.typeName === 'ZodArray'
  )!;
  const ZodUnion = dynamicString.constructor as unknown as {
    create(options: Zod3Schema[]): Zod3Schema;
  };
  const ZodArray = stringArraySchema.constructor as unknown as {
    create(element: Zod3Schema): Zod3Schema;
  };
  // The array branch's element constructor (a `ZodString` from `array(ComponentId)`). Reused only
  // to synthesize an element for the `DynamicValue` `array(...)` branch; the binder recurses into
  // ARRAY fields but never validates the element, so `string` is an adequate stand-in for `any`.
  const arrayElement = stringArraySchema._def.type ?? stringSchema;
  const ZodArrayElementCtor = arrayElement.constructor as unknown as {create(): Zod3Schema};
  // A plain STATIC Zod 3 `array(string)` child-ref list (ordered named slots) — classified ARRAY of
  // STATIC by the binder, so the string ids pass through untouched (mirrors `named-slot-delivery`).
  const staticStringArray = ZodArray.create(staticString);
  // DynamicStringList: `union([array(string), DataBinding, FunctionCall])`.
  const dynamicStringList = ZodUnion.create([
    ZodArray.create(stringSchema),
    dataBinding,
    functionCall,
  ]);
  // DynamicValue: `union([string, number, boolean, array(any), DataBinding, FunctionCall])`.
  const dynamicValue = ZodUnion.create([
    stringSchema,
    numberSchema,
    booleanSchema,
    ZodArray.create(ZodArrayElementCtor.create()),
    dataBinding,
    functionCall,
  ]);
  return {
    zodObject,
    dynamicString,
    dynamicNumber,
    dynamicBoolean,
    dynamicStringList,
    dynamicValue,
    action,
    staticString,
    staticStringArray,
  };
}
const zod3 = harvestZod3Primitives();
// A minimal structural view of a Zod 4 schema's binder-relevant internals.
interface Zod4Def {
  type?: string;
  options?: unknown[];
  innerType?: unknown;
  element?: unknown;
}
function zod4Def(field: unknown): Zod4Def | undefined {
  return (field as {_zod?: {def?: Zod4Def}})._zod?.def;
}
/**
 * Classify one Zod 4 prop field and return the matching Zod 3 schema the binder resolves.
 *
 *  - A Zod 4 UNION that admits a `{ path }` Data_Binding is a bindable A2-UI Dynamic_Value → map to
 *    the matching Zod 3 dynamic union (DYNAMIC → the binder resolves the binding).
 *  - A Zod 4 union carrying an `{ event }` member is an action → map to the Zod 3 action union.
 *  - A bare (non-union) `string` / `string[]` is a STATIC composition child-ref (sidebarChild,
 *    mainChild, children) or scalar (direction) → map to a plain Zod 3 `ZodString` /
 *    `ZodArray(string)` so the binder passes it through UNTOUCHED.
 *  - `optional` / `nullable` / `default` wrappers are unwrapped first (the binder unwraps them too).
 */
function migrateField(field: unknown): Zod3Schema {
  let def = zod4Def(field);
  let current = field;
  // Unwrap optionals/nullables/defaults to reach the classifiable inner type (mirrors the binder).
  while (def && (def.type === 'optional' || def.type === 'nullable' || def.type === 'default')) {
    current = def.innerType;
    def = zod4Def(current);
  }
  if (!def) {
    return zod3.dynamicValue;
  }
  if (def.type === 'union') {
    const options = def.options ?? [];
    const optionDefs = options.map((option) => zod4Def(option));
    const hasEvent = options.some((option) => {
      const shape = (option as {shape?: Record<string, unknown>}).shape;
      return !!shape && 'event' in shape;
    });
    if (hasEvent) {
      return zod3.action;
    }
    const hasDataBinding = options.some((option) => {
      const shape = (option as {shape?: Record<string, unknown>}).shape;
      return !!shape && 'path' in shape && !('componentId' in shape);
    });
    // A union with no DataBinding member is not a bindable Dynamic_Value; treat it as STATIC.
    if (!hasDataBinding) {
      return zod3.staticString;
    }
    // The literal (non-object) branch identifies the fine-grained dynamic form.
    const literalTypes = optionDefs
      .map((optionDef) => optionDef?.type)
      .filter((type) => type && type !== 'object' && type !== 'undefined');
    const literal = literalTypes[0];
    if (literal === 'array') {
      return zod3.dynamicStringList;
    }
    if (literal === 'number') {
      return zod3.dynamicNumber;
    }
    if (literal === 'boolean') {
      return zod3.dynamicBoolean;
    }
    // A single `string` literal branch → DynamicString; anything else (incl. `unknown`) →
    // DynamicValue.
    if (literal === 'string' && literalTypes.length === 1) {
      return zod3.dynamicString;
    }
    return zod3.dynamicValue;
  }
  // Non-union fields are STATIC composition child-refs or scalars — pass them through unchanged.
  switch (def.type) {
    case 'string':
      return zod3.staticString;
    case 'number':
      return zod3.dynamicNumber;
    case 'boolean':
      return zod3.dynamicBoolean;
    case 'array':
      return zod3.staticStringArray;
    default:
      return zod3.dynamicValue;
  }
}
/**
 * Convert a generated Zod 4 `XxxPropsSchema` into an equivalent Zod 3 `ZodObject` the frozen binder
 * classifies and resolves. Empty-shape props become an empty Zod 3 object — an OBJECT node with
 * nothing to resolve, which is correct.
 *
 * The return type is annotated with the sample's Zod 4 `ZodObject` so the existing
 * `asCatalogDefinitions` cast stays a legitimate Zod-3-vs-Zod-4 type bridge; the runtime value is a
 * real Zod 3 object.
 */
export function toBinderProps(propsSchema: {
  shape: Record<string, unknown>;
}): z4.ZodObject<z4.ZodRawShape> {
  const sourceShape = propsSchema.shape;
  const migratedShape: Record<string, Zod3Schema> = {};
  for (const [key, field] of Object.entries(sourceShape)) {
    migratedShape[key] = migrateField(field);
  }
  return zod3.zodObject.create(migratedShape) as unknown as z4.ZodObject<z4.ZodRawShape>;
}
