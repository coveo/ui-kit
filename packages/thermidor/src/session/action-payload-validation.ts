/**
 * Outbound action-payload validation — INTERNAL.
 *
 * This module resolves and applies the ACTION schema for a dispatching
 * component FROM THE INJECTED `contracts`, so the core can gate an outbound
 * action on payload conformance BEFORE the HTTP POST without importing any
 * concrete contract package. It is entirely internal to `Thermidor_Core`: the
 * Consumer never invokes, imports, or becomes aware of it.
 *
 * Resolution walks the injected contract member for the dispatching component:
 * `member.shape.actions` is that component's `XxxActionsSchema`
 * (`z.strictObject({ <actionName>: <ActionEnvelopeSchema>, ... })`), a map of
 * action name → an envelope schema of the form `z.strictObject({ payload })`.
 * The dispatched interaction's `context` IS that action's payload, so we look
 * up `actions.shape[name].shape.payload` and `safeParse(context)` against it.
 *
 * (Verified against the generated Coveo schema, e.g.
 * `PaginationActionsSchema = z.strictObject({ selectPage: SelectPageSchema, setPageSize: ... })`
 * and `SelectPageSchema = z.strictObject({ payload: SelectPagePayloadSchema })`.)
 */

import type {ContractsSchema, ObjectSchema, ParsableSchema, ParseIssue} from './contracts.js';

/**
 * The outcome of {@link validateActionPayload}: either the action `name`+
 * `context` conform to the component's declared action contract (`valid`), or
 * they do not (`invalid`), carrying a human-readable `reason` naming the
 * failing field/constraint for a dev-only diagnostic.
 */
export type ActionPayloadValidation =
  | {readonly valid: true}
  | {readonly valid: false; readonly reason: string};

function isObjectSchema(schema: ParsableSchema | undefined): schema is ObjectSchema {
  return Boolean(schema) && isRecord((schema as {shape?: unknown}).shape);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function unwrapOptional(schema: ParsableSchema): ParsableSchema {
  const candidate = schema as {unwrap?: () => ParsableSchema};
  return typeof candidate.unwrap === 'function' ? candidate.unwrap() : schema;
}

/**
 * Validates an outbound action's `context` payload against the dispatching
 * component's declared action contract, resolved from the INJECTED `contracts`
 * by its PascalCase `component` discriminant and the action `name`.
 *
 * Resolution: find the contract member for `discriminant`, unwrap its optional
 * `actions` object, read the envelope schema at `actions.shape[name]`, and
 * validate `context` against that envelope's `payload` sub-schema. An unknown
 * component, a component that declares no `actions`, an unknown action `name`,
 * and a non-conforming `context` all fail.
 *
 * The `contracts` are threaded in (never imported), so the validator stays
 * decoupled from any concrete contract package.
 */
export function validateActionPayload(
  discriminant: string,
  name: string,
  context: unknown,
  contracts: ContractsSchema
): ActionPayloadValidation {
  const member = contracts.options.find(
    (candidate) => candidate.shape.component.value === discriminant
  );
  if (!member) {
    return {valid: false, reason: `no action contract for component "${discriminant}"`};
  }

  const actionsField = member.shape.actions;
  if (!actionsField) {
    return {valid: false, reason: `component "${discriminant}" declares no actions`};
  }
  const actions = unwrapOptional(actionsField);
  if (!isObjectSchema(actions)) {
    return {valid: false, reason: `component "${discriminant}" declares no actions`};
  }

  const envelopeField = actions.shape[name];
  if (!envelopeField) {
    return {valid: false, reason: `unknown action "${name}" for component "${discriminant}"`};
  }
  const envelope = unwrapOptional(envelopeField);
  const payloadSchema = isObjectSchema(envelope) ? envelope.shape['payload'] : undefined;
  if (!payloadSchema) {
    return {
      valid: false,
      reason: `action "${name}" for component "${discriminant}" declares no payload schema`,
    };
  }

  const result = payloadSchema.safeParse(context);
  if (result.success) {
    return {valid: true};
  }

  return {valid: false, reason: formatIssues(result.error.issues)};
}

/**
 * Renders the Zod issues into a compact `path: message` list identifying the
 * failing field(s)/constraint(s), for the dev-only warning. Never
 * thrown; only surfaced in a non-production diagnostic.
 */
function formatIssues(issues: readonly ParseIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.map((segment) => String(segment)).join('.') || '<root>';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}
