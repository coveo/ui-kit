import {createAttributeFromField} from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createAttribute.js';

/**
 * Exposes a `@mapProperty` field as an attribute named after its prefix.
 *
 * At runtime the decorator maps every `<prefix>-*` attribute onto a key of the field, which the
 * manifest cannot express. Listing the prefix as an attribute keeps the field in the Storybook
 * controls and in the inputs of the Angular wrapper, which both read attributes. The attribute is
 * built the way the analyzer builds the one of a `@property` field, so it carries the type,
 * description and default of the field. Fields the analyzer left out (`@internal`) get no attribute.
 */
export function mapPropertyPlugin() {
  return {
    name: 'map-property',
    analyzePhase({ts, node, moduleDoc}) {
      if (!ts.isPropertyDeclaration(node)) {
        return;
      }
      const decorator = ts
        .getDecorators(node)
        ?.find(
          ({expression}) =>
            ts.isCallExpression(expression) && expression.expression.getText() === 'mapProperty'
        );
      if (!decorator) {
        return;
      }
      if (!ts.isClassDeclaration(node.parent) || !ts.isSourceFile(node.parent.parent)) {
        throw new Error(
          `${moduleDoc.path}: @mapProperty is only supported on the fields of a top-level class.`
        );
      }

      const fieldName = node.name.getText();
      const declaration = moduleDoc.declarations.find(
        (candidate) => candidate.kind === 'class' && candidate.name === node.parent.name?.text
      );
      const field = declaration?.members?.find(
        (member) => member.kind === 'field' && member.name === fieldName
      );
      if (!field) {
        return;
      }

      const attribute = {
        ...createAttributeFromField(field),
        name: camelToKebab(attributePrefixOf(decorator, ts) || fieldName),
      };
      field.attribute = attribute.name;
      declaration.attributes ??= [];
      declaration.attributes.push(attribute);
    },
  };
}

function attributePrefixOf(decorator, ts) {
  const [options] = decorator.expression.arguments;
  if (!options) {
    return undefined;
  }
  if (ts.isObjectLiteralExpression(options)) {
    const option = options.properties.find((property) => property.name?.text === 'attributePrefix');
    if (!option) {
      return undefined;
    }
    if (ts.isPropertyAssignment(option) && ts.isStringLiteralLike(option.initializer)) {
      return option.initializer.text;
    }
  }
  throw new Error(
    `Cannot read the attribute prefix of ${decorator.getText()}: pass the options as an object literal, with attributePrefix as a string.`
  );
}

/**
 * Same conversion as `camelToKebab` in `src/utils/utils.ts`, which the decorator uses at runtime.
 */
function camelToKebab(value) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
