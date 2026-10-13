/**
 * Exposes a `@mapProperty` field as an attribute named after its prefix.
 *
 * At runtime the decorator maps every `<prefix>-*` attribute onto a key of the field, which the
 * manifest cannot express. Listing the prefix as an attribute keeps the field in the Storybook
 * controls and in the inputs of the Angular wrapper, which both read attributes. The attribute
 * carries the type, description and default of the field, like the ones the analyzer creates for
 * `@property`. Fields the analyzer left out (`@internal`) get no attribute either.
 */
export function mapPropertyPlugin() {
  return {
    name: 'map-property',
    analyzePhase({ts, node, moduleDoc}) {
      if (
        !ts.isPropertyDeclaration(node) ||
        !ts.isClassDeclaration(node.parent) ||
        !node.parent.name
      ) {
        return;
      }

      const decorator = (ts.getDecorators?.(node) ?? []).find(
        ({expression}) =>
          ts.isCallExpression(expression) && expression.expression.getText() === 'mapProperty'
      );
      if (!decorator) {
        return;
      }

      const fieldName = node.name.getText();
      const declaration = moduleDoc.declarations.find(
        (candidate) => candidate.kind === 'class' && candidate.name === node.parent.name.text
      );
      const field = declaration?.members?.find(
        (member) => member.kind === 'field' && member.name === fieldName
      );
      if (!field) {
        return;
      }

      const attributePrefix = stringOption(
        decorator.expression.arguments[0],
        'attributePrefix',
        ts
      );
      const attribute = {...field, name: camelToKebab(attributePrefix ?? fieldName), fieldName};
      for (const key of ['kind', 'static', 'privacy', 'reflects', 'resolveInitializer']) {
        delete attribute[key];
      }
      declaration.attributes ??= [];
      declaration.attributes.push(attribute);
    },
  };
}

function stringOption(objectLiteral, name, ts) {
  if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
    return undefined;
  }
  const option = objectLiteral.properties.find(
    (property) => ts.isPropertyAssignment(property) && property.name.getText() === name
  );
  return option && ts.isStringLiteral(option.initializer) ? option.initializer.text : undefined;
}

/**
 * Same conversion as `camelToKebab` in `src/utils/utils.ts`, which the decorator uses at runtime.
 */
function camelToKebab(value) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
