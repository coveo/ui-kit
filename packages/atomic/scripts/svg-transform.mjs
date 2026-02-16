import {readFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {
  isImportDeclaration,
  NodeFlags,
  visitEachChild,
  visitNode,
} from 'typescript';

/**
 * Creates a TypeScript variable statement for an SVG import.
 *
 * This function generates a TypeScript variable statement that assigns the SVG content as a string literal
 * to a variable. It is used as part of a custom TypeScript transformer to inline SVG content in the transpiled
 * JavaScript files.
 *
 * @example
 * The following TypeScript source file:
 * ```ts
 * // src/components/component.ts
 * import Tick from '../../../images/checkbox.svg';
 * () => console.log(Tick);
 * ```
 *
 * Will be transpiled to (note that the SVG import statement has been replaced with the SVG content):
 * ```js
 * // dist/components/component.js
 * const Tick = "<svg viewBox=\"0 0 12 9\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> ... </svg>";
 * () => console.log(Tick);
 * ```
 *
 * @param {NodeFactory} factory - The TypeScript factory object used to create AST nodes.
 * @param {string} svgContent - The content of the SVG file as a string.
 * @param {string} variableName - The name of the variable to which the SVG content will be assigned.
 * @returns {VariableStatement} A TypeScript variable statement that assigns the SVG content to the variable.
 * @throws If the variable name is not defined.
 */
function createStatement(factory, svgContent, variableName) {
  const bindingName = undefined;
  const exclamationToken = undefined;
  const modifiers = [];
  const {
    createVariableStatement,
    createVariableDeclarationList,
    createVariableDeclaration,
    createStringLiteral,
  } = factory;

  if (variableName === undefined) {
    throw new Error(
      `Variable name is not defined for the import statement ${node.getText()}`
    );
  }

  return createVariableStatement(
    modifiers,
    createVariableDeclarationList(
      [
        createVariableDeclaration(
          variableName,
          bindingName,
          exclamationToken,
          createStringLiteral(svgContent)
        ),
      ],
      NodeFlags.Const
    )
  );
}

/**
 * Custom SVG transformer to handle .svg imports.
 */
export default function svgTransformer(context) {
  const {factory} = context;

  function visit(node) {
    if (isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.text;
      if (importPath.endsWith('.svg')) {
        console.log('Replacing SVG import:', basename(importPath));
        const sourceFile = (node.original || node).getSourceFile();
        const dir = dirname(sourceFile.fileName);
        const svgPath = resolve(dir, importPath);
        const svgContent = readFileSync(svgPath, 'utf8');
        const variableName = node.importClause?.name?.escapedText;

        return createStatement(factory, svgContent, variableName);
      }
    }
    return visitEachChild(node, visit, context);
  }

  return (sourceFile) => visitNode(sourceFile, visit);
}
