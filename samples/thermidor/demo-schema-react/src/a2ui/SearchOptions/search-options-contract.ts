import {z} from 'zod';
import {DataBindingSchema, FunctionCallSchema} from '@coveo/thermidor-schema/zod3';

/**
 * Demo-local contract for the `SearchOptions` component (agent-gateway ADR-008).
 *
 * An agent answer can carry search options: buttons that each open a new gateway search block.
 * The gateway saves each option's search under an `opt-<uuid>` id and forwards only
 * `{optionId, label}`; tapping one dispatches `selectSearchOption {optionId}`.
 *
 * `SearchOptions` and `selectSearchOption` are working names that `@coveo/thermidor-schema` does
 * not publish yet, so this sample declares them in the Zod 3 dialect the renderer's binder reads.
 * Delete this file and use the generated schemas once the schema ships the component.
 */

const SearchOptionItemSchema = z.object({
  optionId: z.string().min(1),
  label: z.string(),
});
export type SearchOptionItem = z.infer<typeof SearchOptionItemSchema>;

const SearchOptionsStateSchema = z.object({
  items: z.array(SearchOptionItemSchema),
});

const SelectSearchOptionPayloadSchema = z
  .object({
    optionId: z.string().min(1),
  })
  .strict();

const SearchOptionsActionsSchema = z
  .object({
    selectSearchOption: z.object({payload: SelectSearchOptionPayloadSchema}).strict(),
  })
  .strict();

/** The `SearchOptions` member injected into the session contracts, beside the published ones. */
export const SearchOptionsSchema = z
  .object({
    actions: SearchOptionsActionsSchema.optional(),
    component: z.literal('SearchOptions'),
    id: z.string().min(1),
    state: SearchOptionsStateSchema.optional(),
  })
  .passthrough();

/** Resolved props of the `SearchOptions` renderer: `items` binds to `/state/<id>/items`. */
export const SearchOptionsPropsSchema = z.object({
  items: z.union([SearchOptionsStateSchema.shape.items, DataBindingSchema, FunctionCallSchema]),
});

export interface SearchOptionsAction {
  event: {name: 'selectSearchOption'; context: z.infer<typeof SelectSearchOptionPayloadSchema>};
}
