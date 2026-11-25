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
