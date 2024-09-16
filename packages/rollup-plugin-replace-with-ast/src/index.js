import {createFilter} from '@rollup/pluginutils';
import {parse} from 'acorn';
import MagicString from 'magic-string';

function replaceWithASTPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const replacements = options.replacements || {};
  return {
    name: 'replace-with-ast-plugin',
    transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      let ast;
      try {
        ast = parse(code, {ecmaVersion: 2020, sourceType: 'module'});
      } catch (error) {
        console.error(`Error parsing ${id}: ${error.message}`);
        return null;
      }
      const magicString = new MagicString(code);
      ast.body.forEach((node) => {
        if (
          node.type === 'ImportDeclaration' ||
          node.type === 'ExportNamedDeclaration' ||
          node.type === 'ExportAllDeclaration'
        ) {
          const source = node.source;
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
