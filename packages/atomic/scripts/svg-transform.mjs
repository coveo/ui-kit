import {readFileSync} from 'fs';
import {basename, dirname, join, resolve} from 'path';
import {
  NodeFlags,
  isImportDeclaration,
  visitEachChild,
  visitNode,
} from 'typescript';

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
        const dir = dirname(node.getSourceFile().fileName);
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
