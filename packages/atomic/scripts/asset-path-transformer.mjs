import {
  isIdentifier,
  isMetaProperty,
  isPropertyAccessExpression,
  SyntaxKind,
  visitEachChild,
  visitNode,
} from 'typescript';

/**
 * Transforms occurrences of `import.meta.env.RESOURCE_URL` in the source file
 * to `import.meta.url`.
 */
function resourceUrlTransformer(context) {
  const {factory} = context;
  return (sourceFile) => {
    function visitor(node) {
      // Check for import.meta.env.RESOURCE_URL
      if (
        isPropertyAccessExpression(node) &&
        isIdentifier(node.name) &&
        node.name.text === 'RESOURCE_URL'
      ) {
        const envNode = node.expression;
        if (
          isPropertyAccessExpression(envNode) &&
          isIdentifier(envNode.name) &&
          envNode.name.text === 'env'
        ) {
          const metaNode = envNode.expression;
          if (
            isMetaProperty(metaNode) &&
            metaNode.keywordToken === SyntaxKind.ImportKeyword
          ) {
            return factory.createPropertyAccessExpression(
              factory.createMetaProperty(
                SyntaxKind.ImportKeyword,
                factory.createIdentifier('meta')
              ),
              'url'
            );
          }
        }
      }
      return visitEachChild(node, visitor, context);
    }
    return visitNode(sourceFile, visitor);
  };
}

export default resourceUrlTransformer;
