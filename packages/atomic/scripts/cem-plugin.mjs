const moduleLinkPhase = ({moduleDoc}) => {
  for (const declaration of moduleDoc.declarations) {
    if (declaration.kind !== 'class') {
      continue;
    }

    // Skip processing if superClass is LitElement
    if (declaration.superclass?.name === 'LitElement') {
      continue;
    }

    const keptAttributes = [];
    for (const attribute of declaration.attributes || []) {
      const memberLike = findMember(declaration, attribute);
      if (!memberLike || memberLike.privacy === 'private') {
        continue;
      }
      keptAttributes.push(attribute);
      copyAttributesFromMember(attribute, memberLike);
    }
    declaration.attributes = keptAttributes.length > 0 ? keptAttributes : undefined;

    if (!declaration.members) {
      continue;
    }

    declaration.members = declaration.members.filter((member) => member?.privacy !== 'private');
  }

  moduleDoc.exports = keepCustomElementExports(moduleDoc.exports);
};

/**
 * Keeps the exports of the public custom elements: the class export and its definition.
 * The analyzer then drops every declaration that is no longer exported, which keeps utilities,
 * mixins and `@internal` elements (they only have a definition export) out of the manifest.
 */
function keepCustomElementExports(exports) {
  const definedElements = new Set(
    exports
      .filter((entry) => entry.kind === 'custom-element-definition')
      .map((entry) => entry.declaration.name)
  );
  const exportedClasses = new Set(
    exports.filter((entry) => entry.kind === 'js').map((entry) => entry.declaration.name)
  );
  return exports.filter(
    (entry) =>
      definedElements.has(entry.declaration.name) && exportedClasses.has(entry.declaration.name)
  );
}

function findMember(declaration, attribute) {
  return declaration.members.find((member) => attribute.fieldName === member.name);
}

function copyAttributesFromMember(attribute, member) {
  for (const fieldToCopy of ['type', 'default', 'description']) {
    attribute[fieldToCopy] = member[fieldToCopy];
  }
}

export const cemPlugin = () => ({
  name: 'my-plugin',
  // Runs for each module, after analyzing, all information about your module should now be available
  moduleLinkPhase,
});

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

/**
 * CEM plugin to remove "| undefined" from all attribute types.
 * Transforms types like "X | Y | undefined" to "X | Y".
 */
export function removeUndefinedTypePlugin() {
  return {
    name: 'remove-undefined-type',
    // Run in moduleLinkPhase to process after all analysis is complete
    moduleLinkPhase({moduleDoc}) {
      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }

        // Process attributes
        if (declaration.attributes) {
          for (const attribute of declaration.attributes) {
            if (attribute.type?.text) {
              attribute.type.text = removeUndefinedFromType(attribute.type.text);
            }
          }
        }
      }
    },
  };
}

/**
 * Removes "| undefined" from a type string.
 * Handles various formats:
 * - "X | undefined" -> "X"
 * - "undefined | X" -> "X"
 * - "X | Y | undefined" -> "X | Y"
 * - "X | undefined | Y" -> "X | Y"
 */
function removeUndefinedFromType(typeText) {
  if (!typeText || typeof typeText !== 'string') {
    return typeText;
  }

  // Split by | and filter out undefined, then rejoin
  const parts = typeText
    .split('|')
    .map((part) => part.trim())
    .filter((part) => part !== 'undefined');

  // If all parts were undefined, return the original (shouldn't happen in practice)
  if (parts.length === 0) {
    return typeText;
  }

  // If only one part remains, return it without |
  if (parts.length === 1) {
    return parts[0];
  }

  // Join remaining parts with proper spacing
  return parts.join(' | ');
}

/**
 * CEM plugin to hide the fields that InitializableComponent requires (`bindings`, `initialized`,
 * `unsubscribeLanguage` and `error`), since they are implementation details of every component.
 * A field backed by an attribute is a public input and is left alone.
 */
export function hideBaseInitializableComponentFieldsPlugin() {
  const baseInitializableComponentFields = [
    'bindings',
    'initialized',
    'unsubscribeLanguage',
    'error',
  ];

  return {
    name: 'hide-base-initializable-component-fields',
    moduleLinkPhase({moduleDoc}) {
      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }

        const inputs = new Set(
          (declaration.attributes ?? []).map((attribute) => attribute.fieldName)
        );
        for (const member of declaration.members ?? []) {
          if (baseInitializableComponentFields.includes(member.name) && !inputs.has(member.name)) {
            member.privacy = 'private';
          }
        }
      }
    },
  };
}

/**
 * CEM plugin to mark properties decorated with @bindStateToController as private,
 * along with the controller property referenced in the decorator argument.
 *
 * Both are implementation details of the component that declares them, so only that
 * class is affected: another component may expose a public property of the same name.
 */
export function hideBindStateToControllerFieldsPlugin() {
  const fieldsToHideByModule = new WeakMap();

  return {
    name: 'hide-bind-state-to-controller-fields',
    analyzePhase({ts, node, moduleDoc}) {
      if (
        !ts.isPropertyDeclaration(node) ||
        !ts.isClassDeclaration(node.parent) ||
        !node.parent.name
      ) {
        return;
      }

      for (const decorator of ts.getDecorators?.(node) ?? []) {
        const expression = decorator.expression;
        if (
          !ts.isCallExpression(expression) ||
          expression.expression.getText() !== 'bindStateToController'
        ) {
          continue;
        }

        const fieldsToHide = fieldsToHideIn(fieldsToHideByModule, moduleDoc, node.parent.name.text);
        fieldsToHide.add(node.name.getText());
        const [controllerProperty] = expression.arguments;
        if (controllerProperty && ts.isStringLiteral(controllerProperty)) {
          fieldsToHide.add(controllerProperty.text);
        }
      }
    },
    moduleLinkPhase({moduleDoc}) {
      const fieldsToHideByClass = fieldsToHideByModule.get(moduleDoc);
      if (!fieldsToHideByClass) {
        return;
      }

      for (const declaration of moduleDoc.declarations) {
        const fieldsToHide = fieldsToHideByClass.get(declaration.name);
        if (declaration.kind !== 'class' || !fieldsToHide) {
          continue;
        }

        for (const member of declaration.members ?? []) {
          if (fieldsToHide.has(member.name)) {
            member.privacy = 'private';
          }
        }

        if (declaration.attributes) {
          const attributes = declaration.attributes.filter(
            (attribute) => !fieldsToHide.has(attribute.fieldName)
          );
          declaration.attributes = attributes.length > 0 ? attributes : undefined;
        }
      }
    },
  };
}

function fieldsToHideIn(fieldsToHideByModule, moduleDoc, className) {
  if (!fieldsToHideByModule.has(moduleDoc)) {
    fieldsToHideByModule.set(moduleDoc, new Map());
  }
  const fieldsToHideByClass = fieldsToHideByModule.get(moduleDoc);
  if (!fieldsToHideByClass.has(className)) {
    fieldsToHideByClass.set(className, new Set());
  }
  return fieldsToHideByClass.get(className);
}
