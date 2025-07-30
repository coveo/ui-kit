import {
  isIdentifier,
  isNonNullExpression,
  isPropertyAccessExpression,
  visitEachChild,
  visitNode,
} from 'typescript';

/**
 * Custom transformer to replace process.env.VERSION with the actual version from package.json.
 */
export default function versionTransformer(context, version) {
  const {factory} = context;

  function visit(node) {
    // Check if this node is process.env.VERSION
    if (
      isPropertyAccessExpression(node) &&
      isPropertyAccessExpression(node.expression) &&
      isIdentifier(node.expression.expression) &&
      node.expression.expression.escapedText === 'process' &&
      node.expression.name.escapedText === 'env' &&
      node.name.escapedText === 'VERSION'
    ) {
      console.log('Replacing process.env.VERSION with:', version);
      return factory.createStringLiteral(version);
    }

    // Check if this node is process.env.VERSION! (non-null assertion)
    if (
      isNonNullExpression(node) &&
      isPropertyAccessExpression(node.expression) &&
      isPropertyAccessExpression(node.expression.expression) &&
      isIdentifier(node.expression.expression.expression) &&
      node.expression.expression.expression.escapedText === 'process' &&
      node.expression.expression.name.escapedText === 'env' &&
      node.expression.name.escapedText === 'VERSION'
    ) {
      console.log('Replacing process.env.VERSION! with:', version);
      return factory.createStringLiteral(version);
    }

    return visitEachChild(node, visit, context);
  }

  return (sourceFile) => visitNode(sourceFile, visit);
}
