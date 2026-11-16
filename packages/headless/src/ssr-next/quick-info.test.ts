import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {describe, expect, it} from 'vitest';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Returns what an editor shows when hovering each declared name of a source file, as the TypeScript
 * language service computes it, on one line. The source file is read as if it sat in `directory`,
 * relative to the package root, so that its relative imports resolve.
 */
function getQuickInfo(directory: string, source: string, names: string[]): Record<string, string> {
  const {config} = ts.readConfigFile(join(packageRoot, 'tsconfig.json'), ts.sys.readFile);
  const {options} = ts.parseJsonConfigFileContent(config, ts.sys, packageRoot);
  const fileName = join(packageRoot, directory, 'quick-info-fixture.ts');
  const readFile = (path: string) => (path === fileName ? source : ts.sys.readFile(path));
  const service = ts.createLanguageService(
    {
      getScriptFileNames: () => [fileName],
      getScriptVersion: () => '1',
      getScriptSnapshot: (path) => {
        const text = readFile(path);
        return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
      },
      getCurrentDirectory: () => packageRoot,
      getCompilationSettings: () => options,
      getDefaultLibFileName: ts.getDefaultLibFilePath,
      fileExists: (path) => path === fileName || ts.sys.fileExists(path),
      readFile,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
    },
    ts.createDocumentRegistry()
  );

  return Object.fromEntries(
    names.map((name) => {
      const declaration = new RegExp(`\\b(?:const|type) ${name}\\b`).exec(source);
      if (!declaration) {
        throw new Error(`No declaration of ${name} in the source.`);
      }
      const position = declaration.index + declaration[0].length - name.length;
      const info = service.getQuickInfoAtPosition(fileName, position);
      return [name, ts.displayPartsToString(info?.displayParts).replace(/\s+/g, ' ')];
    })
  );
}

describe('the states of a commerce engine definition, as editors show them', () => {
  const quickInfo = getQuickInfo(
    'src/ssr-next',
    `
    import {
      defineCommerceEngine,
      defineProductList,
      getSampleCommerceEngineConfiguration,
      type InferHydratedState,
      type InferStaticState,
      type NavigatorContext,
    } from '../ssr-commerce-next.index.js';

    const {listingEngineDefinition} = defineCommerceEngine({
      configuration: getSampleCommerceEngineConfiguration(),
      controllers: {productList: defineProductList()},
    });
    type ListingHydratedState = InferHydratedState<typeof listingEngineDefinition>;

    export async function render(
      navigatorContext: NavigatorContext,
      props: {staticState: InferStaticState<typeof listingEngineDefinition>}
    ) {
      const staticState = await listingEngineDefinition.fetchStaticState({
        navigatorContext,
        context: {language: 'en', country: 'US', currency: 'USD', view: {url: 'https://example.com'}},
      });
      const hydratedState = await listingEngineDefinition.hydrateStaticState(staticState);
      const fromProps = props.staticState;
      return {staticState, hydratedState, fromProps};
    }
    `,
    ['staticState', 'hydratedState', 'fromProps', 'ListingHydratedState']
  );
  const controllers = '{ productList: ProductListDefinition; }';

  it('should name the static state after the controllers and the kind of page', () => {
    expect(quickInfo.staticState).toBe(
      `const staticState: CommerceStaticState<${controllers}, SolutionType.listing>`
    );
    expect(quickInfo.fromProps).toBe(
      `const fromProps: CommerceStaticState<${controllers}, SolutionType.listing>`
    );
  });

  it('should name the hydrated state after the controllers and the kind of page', () => {
    expect(quickInfo.hydratedState).toBe(
      `const hydratedState: CommerceHydratedState<${controllers}, SolutionType.listing>`
    );
    expect(quickInfo.ListingHydratedState).toBe(
      `type ListingHydratedState = CommerceHydratedState<${controllers}, SolutionType.listing>`
    );
  });
});
