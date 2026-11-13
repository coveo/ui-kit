function extractObjectLiteralOptions(arg, ts) {
  const options = {};
  if (arg && ts.isObjectLiteralExpression(arg)) {
    for (const prop of arg.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name.getText();
        options[key] = prop.initializer.text ?? undefined;
      }
    }
  }
  return options;
}

/**
 * CEM plugin to recognize @mapProperty decorator and emit the property as an attribute.
 */
function getDecoratorNameAndOptions(node, ts) {
  let decoratorName = null;
  let options = {};
  if (ts.getDecorators) {
    for (const decorator of ts.getDecorators(node) || []) {
      const expr = decorator.expression;
      if (ts.isCallExpression(expr)) {
        decoratorName = expr.expression.getText();
        options = extractObjectLiteralOptions(expr.arguments[0], ts);
      } else {
        decoratorName = expr.getText();
      }
    }
  }
  return {decoratorName, options};
}

export function mapPropertyPlugin() {
  return {
    name: 'map-property',
    analyzePhase({ts, node, moduleDoc}) {
      if (ts.isPropertyDeclaration(node)) {
        const {decoratorName, options} = getDecoratorNameAndOptions(node, ts);
        if (decoratorName === 'mapProperty') {
          const propName = node.name.getText();
          const attributeName = options.attributePrefix || propName;

          moduleDoc.declarations[0].attributes.push({
            name: attributeName,
            fieldName: propName,
          });
        }
      }
    },
  };
}
