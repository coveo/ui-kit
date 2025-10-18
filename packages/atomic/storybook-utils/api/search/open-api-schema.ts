// biome-ignore-all lint/suspicious/noExplicitAny: imported files without exact typing + temp fix
import searchAPIOpenSpec from 'virtual:open-api-coveo/SearchApi?group=public';
import {Ajv, type AnySchema} from 'ajv';

// Configure AJV with options to handle OpenAPI schemas
const ajv = new Ajv({
  strict: false, // Disable strict mode to allow unknown keywords
  allErrors: true, // Get all validation errors, not just the first one
  verbose: true, // Include schema and data in validation errors
  logger: false, // Mute the log;
});

// Add all schemas from the OpenAPI spec to AJV so it can resolve references
const sanitizedComponents = searchAPIOpenSpec.components as any;

// Make rankingInfo nullable ; SAPI defect, nullable missing

(
  sanitizedComponents.schemas.RestQueryResult as any
).properties.rankingInfo.nullable = true;

// Handle nullable without type - convert to union with null; SAPI Defect RestQueryParentResult, allOf + nullable; https://github.com/OAI/OpenAPI-Specification/blob/main/proposals/2019-10-31-Clarify-Nullable.md#can-allof-be-used-to-define-a-nullable-subtype-of-a-non-nullable-base-schema-see-1368
sanitizedComponents.schemas.RestQueryParentResult = {
  anyOf: [
    ...(sanitizedComponents.schemas.RestQueryParentResult as any).allOf,
    {
      type: 'null',
    },
  ],
};

// Add each schema to AJV with its proper ID
Object.entries(sanitizedComponents.schemas).forEach(([schemaName, schema]) => {
  ajv.addSchema(schema as AnySchema, `#/components/schemas/${schemaName}`);
});

export const getSchemaValidator = (schemaName: string) =>
  ajv.compile(sanitizedComponents.schemas[schemaName]);
