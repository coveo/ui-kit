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
    declaration.attributes =
      keptAttributes.length > 0 ? keptAttributes : undefined;

    if (!declaration.members) {
      continue;
    }

    declaration.members = declaration.members.filter(
      (member) => member?.privacy !== 'private'
    );
  }

  moduleDoc.exports = cleanExports(moduleDoc.exports);
};

function cleanExports(exports) {
  const finalExports = [];
  const exportCandidates = {};
  for (const exportCandidate of exports) {
    const exportName = exportCandidate.declaration.name;
    if (!exportCandidates[exportName]) {
      // First time we see this export, we add it to the final exports candidate map.
      exportCandidates[exportName] = [];
    } else if (exportCandidates[exportName] !== finalExports[exportName]) {
      // Second time we see this export, we merge all the candidates into the final exports, and make the candidate map point to the final exports for this export name.
      finalExports.push(...exportCandidates[exportName]);
      exportCandidates[exportName] = finalExports;
    }
    // Add the export candidate to the candidate map, regardless of what array it points to.
    exportCandidates[exportName].push(exportCandidate);
  }
  return finalExports;
}

function findMember(declaration, attribute) {
  return declaration.members.find(
    (member) => attribute.fieldName === member.name
  );
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
              attribute.type.text = removeUndefinedFromType(
                attribute.type.text
              );
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
 * CEM plugin to mark BaseInitializableComponent fields as private
 * for custom elements that extend LitElement and implement BaseInitializableComponent.
 */
export function hideBaseInitializableComponentFieldsPlugin() {
  return {
    name: 'hide-base-initializable-component-fields',
    // Run in moduleLinkPhase to process after all analysis is complete
    moduleLinkPhase({moduleDoc}) {
      // List of BaseInitializableComponent field names that should be marked as private
      const baseInitializableComponentFields = [
        'bindings',
        'initialized',
        'unsubscribeLanguage',
        'error',
      ];

      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }

        // Check if this class extends LitElement
        const extendsLitElement = declaration.superclass?.name === 'LitElement';

        // Check if this class implements BaseInitializableComponent
        // The CEM analyzer might not capture TypeScript implements directly,
        // so we'll check for the presence of the BaseInitializableComponent fields instead
        const implementsBaseInitializable = declaration.implements?.some(
          (impl) =>
            impl.name === 'BaseInitializableComponent' ||
            impl.name === 'InitializableComponent' ||
            impl.name === 'SearchBoxSuggestionsComponent'
        );

        // Alternative: check if the class has the BaseInitializableComponent fields
        const hasBaseInitializableFields = declaration.members?.some((member) =>
          baseInitializableComponentFields.includes(member.name)
        );

        // Use either explicit implements or presence of the fields
        const shouldProcess =
          extendsLitElement &&
          (implementsBaseInitializable || hasBaseInitializableFields);

        // If both conditions are met, mark the BaseInitializableComponent fields as private
        if (shouldProcess && declaration.members) {
          for (const member of declaration.members) {
            if (baseInitializableComponentFields.includes(member.name)) {
              member.privacy = 'private';
            }
          }

          // Also handle attributes that might correspond to these fields
          if (declaration.attributes) {
            const attributesToRemove = [];
            for (let i = 0; i < declaration.attributes.length; i++) {
              const attribute = declaration.attributes[i];
              if (
                baseInitializableComponentFields.includes(attribute.fieldName)
              ) {
                attributesToRemove.push(i);
              }
            }
            // Remove attributes in reverse order to maintain indices
            for (let i = attributesToRemove.length - 1; i >= 0; i--) {
              declaration.attributes.splice(attributesToRemove[i], 1);
            }
            // Clean up empty attributes array
            if (declaration.attributes.length === 0) {
              declaration.attributes = undefined;
            }
          }
        }
      }
    },
  };
}

/**
 * CEM plugin to mark properties decorated with @bindStateToController as private,
 * along with the property referenced in the decorator argument.
 */
export function hideBindStateToControllerFieldsPlugin() {
  // Store fields to hide globally across all modules
  const globalFieldsToHide = new Set();

  return {
    name: 'hide-bind-state-to-controller-fields',
    // Run in analyzePhase to capture decorator information during analysis
    analyzePhase({ts, node}) {
      if (ts.isPropertyDeclaration(node)) {
        // Check for bindStateToController decorator directly
        const decorators = ts.getDecorators?.(node) || [];
        for (const decorator of decorators) {
          const expr = decorator.expression;

          if (ts.isCallExpression(expr)) {
            const decoratorName = expr.expression.getText();
            if (decoratorName === 'bindStateToController') {
              const propName = node.name.getText();

              // Mark the decorated property itself
              globalFieldsToHide.add(propName);

              // Mark the property referenced in the decorator argument
              if (expr.arguments.length > 0) {
                const firstArg = expr.arguments[0];
                if (ts.isStringLiteral(firstArg)) {
                  const referencedPropertyName = firstArg.text;
                  globalFieldsToHide.add(referencedPropertyName);
                }
              }
            }
          }
        }
      }
    },
    // Run in moduleLinkPhase to mark the identified fields as private
    moduleLinkPhase({moduleDoc}) {
      if (globalFieldsToHide.size === 0) {
        return;
      }

      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }

        // Check if this class extends LitElement
        const extendsLitElement = declaration.superclass?.name === 'LitElement';
        if (!extendsLitElement) {
          continue;
        }

        // Mark the identified fields as private
        if (declaration.members) {
          for (const member of declaration.members) {
            if (globalFieldsToHide.has(member.name)) {
              member.privacy = 'private';
            }
          }
        }

        // Also handle attributes that might correspond to these fields
        if (declaration.attributes) {
          const attributesToRemove = [];
          for (let i = 0; i < declaration.attributes.length; i++) {
            const attribute = declaration.attributes[i];
            if (globalFieldsToHide.has(attribute.fieldName)) {
              attributesToRemove.push(i);
            }
          }
          // Remove attributes in reverse order to maintain indices
          for (let i = attributesToRemove.length - 1; i >= 0; i--) {
            declaration.attributes.splice(attributesToRemove[i], 1);
          }
          // Clean up empty attributes array
          if (declaration.attributes.length === 0) {
            declaration.attributes = undefined;
          }
        }
      }
    },
  };
}
