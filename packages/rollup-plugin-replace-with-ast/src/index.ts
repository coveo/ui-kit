import {createFilter} from '@rollup/pluginutils';
import {
  parse,
  Node,
  ImportDeclaration,
  ExportNamedDeclaration,
  ExportAllDeclaration,
  Program,
} from 'acorn';
import MagicString from 'magic-string';

interface PluginOptions {
  include?: string | string[];
  exclude?: string | string[];
  replacements?: Record<string, string>;
}

function replaceWithASTPlugin(options: PluginOptions = {}) {
  const filter = createFilter(options.include, options.exclude);
  const replacements = options.replacements || {};

  return {
    name: 'replace-with-ast-plugin',

    transform(code: string, id: unknown) {
      if (!filter(id)) {
        return null;
      }

      let ast: Program;
      try {
        ast = parse(code, {ecmaVersion: 2020, sourceType: 'module'});
      } catch (error) {
        console.error(`Error parsing ${id}: ${(error as Error).message}`);
        return null;
      }

      const magicString = new MagicString(code);

      ast.body.forEach((node: Node) => {
        if (
          node.type === 'ImportDeclaration' ||
          node.type === 'ImportDefaultSpecifier' ||
          node.type === 'ImportSpecifier' ||
          node.type === 'ImportNamespaceSpecifier' ||
          node.type === 'ExportSpecifier' ||
          node.type === 'ExportDefaultSpecifier' ||
          node.type === 'ExportNamedDeclaration' ||
          node.type === 'ExportAllDeclaration'
        ) {
          const source = (
            node as
              | ImportDeclaration
              | ExportNamedDeclaration
              | ExportAllDeclaration
          ).source;
          if (
            source &&
            typeof source.value === 'string' &&
            replacements[source.value]
          ) {
            const start = source.start;
            const end = source.end;
            magicString.overwrite(
              start,
              end,
              JSON.stringify(replacements[source.value])
            );
          }
        }
      });

      return {
        code: magicString.toString(),
        map: magicString.generateMap({hires: true}),
      };
    },
  };
}

export default replaceWithASTPlugin;
