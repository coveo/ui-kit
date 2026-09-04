import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {resolve, join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {format} from 'oxfmt';
import {InputData, JSONSchemaInput, JSONSchemaStore, Ref, quicktype} from 'quicktype-core';
import {ThermidorZodTargetLanguage} from './quicktype-zod.ts';

type Schema = Record<string, any>;
type SchemaDocument = Schema & {$id: string};

interface ProjectionEntry {
  typeName: string;
  schemaId: string;
  pointer?: string;
  reference: string;
}

interface DiscriminatedUnion {
  typeName: string;
  discriminator: string;
  memberTypeNames: string[];
}

interface ComponentContractsTriad {
  typeName: string;
  discriminator: string;
  memberTypeNames: string[];
}

interface ComponentPropsEntry {
  componentName: string;
  schemaName: string;
  componentType: string;
}

class LocalSchemaStore extends JSONSchemaStore {
  private readonly documentsById: Map<string, SchemaDocument>;
  constructor(documentsById: Map<string, SchemaDocument>) {
    super();
    this.documentsById = documentsById;
  }
  async fetch(address: string): Promise<SchemaDocument | undefined> {
    return this.documentsById.get(address);
  }
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schemaDirectory = join(packageRoot, 'schema');
const outputPath = join(packageRoot, 'src', 'generated', 'schemas.ts');
const checkOnly = process.argv.includes('--check');
const typeScriptIdentifierPattern = /^[$A-Z_a-z][$\w]*$/;

const documents = await loadSchemaDocuments(schemaDirectory);
const documentsById = new Map<string, SchemaDocument>(
  documents.map((document) => [document.$id, document])
);
const componentIndex = loadComponentIndex(documentsById);
const compositionDocuments = loadCompositionDocuments(documentsById);
const projectionDocuments = crawlSchemaDocuments(
  [componentIndex, ...compositionDocuments],
  documentsById
);
const entries = loadProjectionEntries(projectionDocuments);
const discriminatedUnions = loadDiscriminatedUnions(componentIndex, projectionDocuments);

const [seed] = entries;
const seedDocument = documentsById.get(seed?.schemaId);
if (!seedDocument) {
  throw new Error(`Unable to find entry document ${seed?.schemaId}.`);
}

const schemaInput = new JSONSchemaInput(new LocalSchemaStore(documentsById));
await schemaInput.addSource({
  name: seed.typeName,
  uris: [seed.schemaId],
});

for (const entry of entries) {
  schemaInput.addTopLevel(entry.typeName, Ref.parse(entry.reference));
}

const inputData = new InputData();
inputData.addInput(schemaInput);

const {lines} = await quicktype({
  alphabetizeProperties: false,
  fixedTopLevels: true,
  indentation: '  ',
  inputData,
  lang: new ThermidorZodTargetLanguage(),
  leadingComments: [
    {
      lines: [
        'This file is generated from the canonical JSON Schema documents.',
        'Do not edit it directly; run `pnpm run generate` from the package root.',
      ],
    },
  ],
  outputFilename: 'schemas.ts',
});

const componentPropsEntries = loadComponentPropsEntries(documentsById);
const componentPropsLines = renderComponentPropsSchemas(componentPropsEntries);

const componentContractsTriad = loadComponentContractsTriad(componentIndex, projectionDocuments);
const projectedLines = injectComponentContractsTriadUnion(lines, componentContractsTriad);

const formatResult = await format(
  'schemas.ts',
  [
    ...projectedLines,
    ...renderDiscriminatedUnions(discriminatedUnions),
    ...componentPropsLines,
  ].join('\n'),
  {singleQuote: true, trailingComma: 'es5'}
);
if (formatResult.errors.length > 0) {
  throw new Error(
    `Unable to format generated Zod schemas:\n${formatResult.errors.map((error) => error.message).join('\n')}`
  );
}

const generated = formatResult.code;

if (checkOnly) {
  const current = await readFile(outputPath, 'utf8').catch(() => '');
  if (current !== generated) {
    throw new Error('Generated Zod schemas are stale. Run `pnpm run generate`.');
  }
  console.log('Generated schemas are up to date.');
} else {
  await mkdir(dirname(outputPath), {recursive: true});
  await writeFile(outputPath, generated, 'utf8');
  console.log(
    `Generated ${entries.length + componentPropsEntries.length} Zod schema exports at ${relative(packageRoot, outputPath)}.`
  );
}

function loadProjectionEntries(documents: SchemaDocument[]): ProjectionEntry[] {
  const componentDocuments = loadComponentContractDocuments(documents);
  const definitionDocuments = documents.filter((document) =>
    document.$id.includes('/definitions/')
  );
  const compositionDocuments = documents.filter((document) =>
    document.$id.includes('/composition/')
  );

  return [
    ...definitionDocuments.map((document) =>
      createProjectionEntry(loadSchemaTitle(document), document.$id)
    ),
    ...componentDocuments.flatMap((document) => loadComponentPayloadEntries(document)),
    ...componentDocuments.map((document) =>
      createProjectionEntry(loadSchemaTitle(document), document.$id)
    ),
    ...compositionDocuments.map((document) =>
      createProjectionEntry(loadSchemaTitle(document), document.$id)
    ),
  ];
}

function loadCompositionDocuments(documents: Map<string, SchemaDocument>): SchemaDocument[] {
  return [...documents.values()].filter((document) => document.$id.includes('/composition/'));
}

function loadDiscriminatedUnions(
  index: SchemaDocument,
  documents: SchemaDocument[]
): DiscriminatedUnion[] {
  const union = loadComponentUnion(index);
  return [
    {
      typeName: loadSchemaTitle(union),
      discriminator: 'componentType',
      memberTypeNames: loadComponentContractDocuments(documents).map(loadSchemaTitle),
    },
  ];
}

function loadComponentContractsTriad(
  index: SchemaDocument,
  documents: SchemaDocument[]
): ComponentContractsTriad {
  const triad = loadComponentTriadView(index);
  return {
    typeName: loadSchemaTitle(triad),
    discriminator: 'componentType',
    memberTypeNames: loadComponentContractDocuments(documents).map(loadSchemaTitle),
  };
}

function loadComponentTriadView(index: SchemaDocument): Schema & {oneOf: Schema[]} {
  const definition = (index.$defs ?? ({} as Record<string, Schema>))['ComponentContractsTriad'];
  if (!definition || !Array.isArray((definition as Schema).oneOf)) {
    throw new Error(`Unable to find ComponentContractsTriad view in ${index.$id}.`);
  }
  return definition as Schema & {oneOf: Schema[]};
}

// quicktype structurally unifies the 15 identity-free triad views (they share the same shape) into
// a single flat, permissive object that decouples componentType from state/actions — which lets a
// cross-type mismatch (e.g. componentType 'cart' with a facet-manager state) pass the Zod projection
// while Ajv's per-member `oneOf` rejects it. We strip that flattened projection and its merged
// sub-schemas, then re-emit ComponentContractsTriadSchema as a strict discriminated union over the
// per-component member schemas (which are the identity-free triads), restoring Ajv↔Zod agreement.
function injectComponentContractsTriadUnion(
  lines: string[],
  triad: ComponentContractsTriad
): string[] {
  const stripped = stripFlattenedTriadDeclarations(lines, triad.typeName);
  const anchorIndex = stripped.findIndex((line) =>
    line.startsWith(`export const CompositionSnapshotSchema`)
  );
  if (anchorIndex === -1) {
    throw new Error('Unable to locate CompositionSnapshotSchema to anchor the triad union.');
  }
  return [
    ...stripped.slice(0, anchorIndex),
    ...renderComponentContractsTriadUnion(triad),
    '',
    ...stripped.slice(anchorIndex),
  ];
}

function stripFlattenedTriadDeclarations(lines: string[], triadTypeName: string): string[] {
  const flattenedTypeNames = [
    triadTypeName,
    `${triadTypeName}State`,
    `${triadTypeName}Actions`,
    `${triadTypeName}ComponentType`,
  ];
  let result = lines;
  for (const typeName of flattenedTypeNames) {
    result = removeSchemaDeclaration(result, typeName);
  }
  return result;
}

// Removes a generated declaration spanning the `export const <TypeName>Schema = ...` value (which
// may be a multi-line object/enum literal and, for objects, carries no trailing semicolon) through
// its paired `export type <TypeName> = z.infer<...>;` alias line, inclusive.
function removeSchemaDeclaration(lines: string[], typeName: string): string[] {
  const start = lines.findIndex((line) => line.startsWith(`export const ${typeName}Schema`));
  if (start === -1) {
    throw new Error(`Unable to find generated declaration "export const ${typeName}Schema".`);
  }
  const end = lines.findIndex(
    (line, index) => index >= start && line.startsWith(`export type ${typeName} =`)
  );
  if (end === -1) {
    throw new Error(`Unable to find generated declaration "export type ${typeName} =".`);
  }
  let after = end + 1;
  while (after < lines.length && lines[after].trim() === '') {
    after += 1;
  }
  return [...lines.slice(0, start), ...lines.slice(after)];
}

function renderComponentContractsTriadUnion(triad: ComponentContractsTriad): string[] {
  return [
    `export const ${triad.typeName}Schema = z.discriminatedUnion(${JSON.stringify(
      triad.discriminator
    )}, [`,
    ...triad.memberTypeNames.map((memberTypeName) => `  ${memberTypeName}Schema,`),
    ']);',
    `export type ${triad.typeName} = z.infer<typeof ${triad.typeName}Schema>;`,
  ];
}

function crawlSchemaDocuments(
  roots: SchemaDocument | SchemaDocument[],
  documents: Map<string, SchemaDocument>
): SchemaDocument[] {
  const crawled: SchemaDocument[] = [];
  const visited = new Set<string>();
  const schemaKeywords = [
    'additionalItems',
    'additionalProperties',
    'allOf',
    'anyOf',
    'contains',
    'contentSchema',
    'else',
    'if',
    'items',
    'not',
    'oneOf',
    'prefixItems',
    'propertyNames',
    'then',
    'unevaluatedItems',
    'unevaluatedProperties',
  ] as const;
  const schemaMapKeywords = [
    '$defs',
    'definitions',
    'dependencies',
    'dependentSchemas',
    'patternProperties',
    'properties',
  ] as const;

  const visitDocument = (document: SchemaDocument) => {
    if (visited.has(document.$id)) {
      return;
    }
    visited.add(document.$id);
    crawled.push(document);
    visitSchema(document);
  };

  const visitSchemas = (schemas: unknown) => {
    if (Array.isArray(schemas)) {
      schemas.forEach(visitSchema);
      return;
    }
    visitSchema(schemas);
  };

  const visitSchema = (schema: unknown) => {
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      return;
    }

    const schemaObject = schema as Schema;
    const reference = schemaObject.$ref;
    if (typeof reference === 'string' && !reference.startsWith('#')) {
      const [schemaId] = reference.split('#');
      const referencedDocument = documents.get(schemaId);
      if (!referencedDocument) {
        throw new Error(`Unable to find referenced schema document ${schemaId}.`);
      }
      visitDocument(referencedDocument);
    }

    schemaKeywords.forEach((keyword) => visitSchemas(schemaObject[keyword]));
    schemaMapKeywords.forEach((keyword) => {
      const schemaMap = schemaObject[keyword];
      if (schemaMap && typeof schemaMap === 'object' && !Array.isArray(schemaMap)) {
        Object.values(schemaMap).forEach(visitSchemas);
      }
    });
  };

  (Array.isArray(roots) ? roots : [roots]).forEach(visitDocument);
  return crawled;
}

function loadComponentContractDocuments(documents: SchemaDocument[]): SchemaDocument[] {
  return documents.filter(
    (document) => typeof document.properties?.componentType?.const === 'string'
  );
}

function loadComponentIndex(documents: Map<string, SchemaDocument>): SchemaDocument {
  const id = 'https://schema.thermidor.coveo.com/components/component-contracts.schema.json';
  const document = documents.get(id);
  if (!document) {
    throw new Error(`Unable to find component index ${id}.`);
  }
  return document;
}

function loadComponentUnion(index: SchemaDocument): Schema & {oneOf: Schema[]} {
  const definitions = Object.values((index.$defs ?? {}) as Record<string, Schema>);
  const union = definitions.find((definition) => Array.isArray(definition.oneOf));
  if (!union) {
    throw new Error(`Unable to find component union in ${index.$id}.`);
  }
  return union as Schema & {oneOf: Schema[]};
}

function loadComponentPayloadEntries(document: SchemaDocument): ProjectionEntry[] {
  const actions = Object.values(document.properties?.actions?.properties ?? {}) as Schema[];
  return actions.flatMap((action) => {
    const reference = action.$ref;
    if (typeof reference !== 'string') {
      return [];
    }
    const actionSchema = resolveLocalReference(document, reference);
    if (!actionSchema.properties?.payload) {
      return [];
    }
    const actionName = loadSchemaTitle(actionSchema);
    const typeName = `${actionName[0].toUpperCase()}${actionName.slice(1)}Payload`;
    return [
      createProjectionEntry(typeName, document.$id, `${reference.slice(1)}/properties/payload`),
    ];
  });
}

function resolveLocalReference(document: SchemaDocument, reference: string): Schema {
  if (!reference.startsWith('#/')) {
    throw new Error(`Expected a local reference in ${document.$id}, received ${reference}.`);
  }
  const segments = reference
    .slice(2)
    .split('/')
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'));
  const resolved = segments.reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }
    return (value as Schema)[segment];
  }, document);
  if (!resolved || typeof resolved !== 'object') {
    throw new Error(`Unable to resolve ${reference} in ${document.$id}.`);
  }
  return resolved as Schema;
}

function loadSchemaTitle(schema: Schema): string {
  if (typeof schema.title !== 'string' || schema.title.length === 0) {
    throw new Error('A projected schema is missing its title.');
  }
  if (!typeScriptIdentifierPattern.test(schema.title)) {
    throw new Error(
      `Projected schema title ${JSON.stringify(schema.title)} is not a valid TypeScript identifier.`
    );
  }
  return schema.title;
}

function createProjectionEntry(
  typeName: string,
  schemaId: string,
  pointer?: string
): ProjectionEntry {
  return {
    typeName,
    schemaId,
    pointer,
    reference: `${schemaId}#${pointer ?? ''}`,
  };
}

async function loadSchemaDocuments(directory: string): Promise<SchemaDocument[]> {
  const entriesInDirectory = await readdir(directory, {withFileTypes: true});
  const documentsInDirectory: SchemaDocument[] = [];
  for (const entry of entriesInDirectory) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      documentsInDirectory.push(...(await loadSchemaDocuments(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      const document = JSON.parse(await readFile(entryPath, 'utf8')) as Schema;
      if (typeof document.$id === 'string' && document.$id.length > 0) {
        documentsInDirectory.push(document as SchemaDocument);
      }
    }
  }
  return documentsInDirectory;
}

function renderDiscriminatedUnions(unions: DiscriminatedUnion[]): string[] {
  return unions.flatMap(({typeName, discriminator, memberTypeNames}) => [
    '',
    `export const ${typeName}Schema = z.discriminatedUnion(${JSON.stringify(discriminator)}, [`,
    ...memberTypeNames.map((memberTypeName) => `  ${memberTypeName}Schema,`),
    ']);',
    `export type ${typeName} = z.infer<typeof ${typeName}Schema>;`,
  ]);
}

function loadComponentPropsEntries(documents: Map<string, SchemaDocument>): ComponentPropsEntry[] {
  const entries: ComponentPropsEntry[] = [];
  for (const [id, doc] of documents) {
    if (!id.includes('/components/') || id.includes('component-contracts')) continue;
    const title = doc.title as string | undefined;
    const componentType = doc.properties?.componentType?.const as string | undefined;
    if (!title || !componentType) continue;
    entries.push({
      componentName: title,
      schemaName: `${title}Props`,
      componentType,
    });
  }
  return entries.sort((a, b) => a.componentName.localeCompare(b.componentName));
}

function renderComponentPropsSchemas(propsEntries: ComponentPropsEntry[]): string[] {
  const output: string[] = [
    '',
    '/**',
    ' * Component props schemas.',
    ' * These props are injected by the A2-UI surface layer (backend) and passed to catalog',
    ' * renderers automatically. Consumers should NOT hardcode these values; they arrive via',
    " * the createSurface message's components[].props.",
    ' */',
  ];
  for (const entry of propsEntries) {
    output.push(
      `export const ${entry.schemaName}Schema = z.object({`,
      `  componentId: z.string(),`,
      `  componentType: z.literal("${entry.componentType}"),`,
      '});',
      `export type ${entry.schemaName} = z.infer<typeof ${entry.schemaName}Schema>;`,
      ''
    );
  }
  return output;
}
