import {z} from 'zod';

/**
 * The `CitedDocuments` props, as `@coveo/thermidor-schema/zod3` will generate them once a release
 * has the component: https://github.com/coveo-platform/thermidor-schema/pull/205. Until then, this
 * copy stands in for `CitedDocumentsPropsSchema`; delete it once the demo depends on that release.
 *
 * It is built with the demo's own Zod 3, which the renderer's binder reads to resolve `{path}`
 * bindings, as it reads the package's `./zod3` build.
 */
const DataBindingSchema = z.object({path: z.string()}).strict();

const FunctionCallSchema = z.object({
  call: z.string(),
  args: z.record(z.string(), z.any()),
  returnType: z
    .enum(['string', 'number', 'boolean', 'array', 'object', 'any', 'void'])
    .default('boolean'),
});

const CitedDocumentDetailSchema = z
  .object({
    displayName: z.string().min(1),
    name: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

const CitedDocumentSchema = z
  .object({
    clickUri: z.string().optional(),
    details: z.array(CitedDocumentDetailSchema),
    label: z.number().int().min(1),
    title: z.string().min(1),
  })
  .strict();

export type CitedDocument = z.infer<typeof CitedDocumentSchema>;

export const CitedDocumentsPropsSchema = z.object({
  documents: z.union([z.array(CitedDocumentSchema).min(1), DataBindingSchema, FunctionCallSchema]),
});
