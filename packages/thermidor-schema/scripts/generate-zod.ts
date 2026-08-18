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

interface ComponentPropsEntry {
  componentName: string;
  schemaName: string;
  controllers: Array<{name: string; controllerSchemaId: string}>;
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

const entries: ProjectionEntry[] = [
  {
    typeName: 'Product',
    schemaId: 'https://schema.thermidor.coveo.com/definitions/product.schema.json',
  },
  {
    typeName: 'CartItem',
    schemaId: 'https://schema.thermidor.coveo.com/definitions/cart-item.schema.json',
  },
  {
    typeName: 'ActionItem',
    schemaId: 'https://schema.thermidor.coveo.com/definitions/action-item.schema.json',
  },
  {
    typeName: 'BundleTier',
    schemaId: 'https://schema.thermidor.coveo.com/definitions/bundle-tier.schema.json',
  },
  {
    typeName: 'ComparisonProduct',
    schemaId: 'https://schema.thermidor.coveo.com/definitions/comparison-product.schema.json',
  },
  {
    typeName: 'ComparisonAttribute',
    schemaId: 'https://schema.thermidor.coveo.com/definitions/comparison-attribute.schema.json',
  },
  {
    typeName: 'ProductListState',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
    pointer: '/$defs/ProductListState',
  },
  {
    typeName: 'CartState',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
    pointer: '/$defs/CartState',
  },
  {
    typeName: 'NextActionsState',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/next-actions.schema.json',
    pointer: '/$defs/NextActionsState',
  },
  {
    typeName: 'BundleDisplayState',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/bundle-display.schema.json',
    pointer: '/$defs/BundleDisplayState',
  },
  {
    typeName: 'ComparisonTableState',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/comparison-table.schema.json',
    pointer: '/$defs/ComparisonTableState',
  },
  {
    typeName: 'SetItemsPayload',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
    pointer: '/$defs/SetItemsAction/properties/payload',
  },
  {
    typeName: 'UpdateItemQuantityPayload',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
    pointer: '/$defs/UpdateItemQuantityAction/properties/payload',
  },
  {
    typeName: 'SelectActionPayload',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/next-actions.schema.json',
    pointer: '/$defs/SelectActionAction/properties/payload',
  },
  {
    typeName: 'ProductListControllerContract',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/product-list.schema.json',
  },
  {
    typeName: 'CartControllerContract',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/cart.schema.json',
  },
  {
    typeName: 'NextActionsControllerContract',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/next-actions.schema.json',
  },
  {
    typeName: 'BundleDisplayControllerContract',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/bundle-display.schema.json',
  },
  {
    typeName: 'ComparisonTableControllerContract',
    schemaId: 'https://schema.thermidor.coveo.com/controllers/comparison-table.schema.json',
  },
].map((entry) => ({...entry, reference: `${entry.schemaId}#${entry.pointer ?? ''}`}));

const discriminatedUnions: DiscriminatedUnion[] = [
  {
    typeName: 'ControllerContracts',
    discriminator: 'controllerSchema',
    memberTypeNames: [
      'ProductListControllerContract',
      'CartControllerContract',
      'NextActionsControllerContract',
      'BundleDisplayControllerContract',
      'ComparisonTableControllerContract',
    ],
  },
];

const documents = await loadSchemaDocuments(schemaDirectory);
const documentsById = new Map<string, SchemaDocument>(
  documents.map((document) => [document.$id, document])
);

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

const formatResult = await format(
  'schemas.ts',
  [...lines, ...renderDiscriminatedUnions(discriminatedUnions), ...componentPropsLines].join('\n')
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
  const componentEntries: ComponentPropsEntry[] = [];
  for (const [id, doc] of documents) {
    if (!id.includes('/components/')) continue;
    const title = doc.title as string | undefined;
    const controllersProps = doc.properties?.controllers?.properties as
      | Record<string, any>
      | undefined;
    if (!title || !controllersProps) continue;

    const controllers: Array<{name: string; controllerSchemaId: string}> = [];
    for (const [name, def] of Object.entries(controllersProps)) {
      const ref = def.$ref as string | undefined;
      if (ref) {
        controllers.push({name, controllerSchemaId: ref});
      }
    }
    if (controllers.length > 0) {
      componentEntries.push({componentName: title, schemaName: `${title}Props`, controllers});
    }
  }
  return componentEntries.sort((a, b) => a.componentName.localeCompare(b.componentName));
}

function renderComponentPropsSchemas(propsEntries: ComponentPropsEntry[]): string[] {
  const output: string[] = ['', '// Component props schemas (generated from schema/components/)'];
  for (const entry of propsEntries) {
    const controllerFields = entry.controllers.map((c) => {
      return `    ${c.name}: z.object({ controllerId: z.string(), controllerSchema: z.literal("${c.controllerSchemaId}") })`;
    });
    output.push(
      `export const ${entry.schemaName}Schema = z.object({`,
      '  controllers: z.object({',
      ...controllerFields.map((f, i) => f + (i < controllerFields.length - 1 ? ',' : '')),
      '  })',
      '});',
      `export type ${entry.schemaName} = z.infer<typeof ${entry.schemaName}Schema>;`,
      ''
    );
  }
  return output;
}
