/**
 * Hides the fields decorated with `@bindStateToController`, along with the controller field each one
 * is bound to.
 *
 * Both are implementation details of the component that declares them: storybook-helpers would
 * otherwise list them as property controls, and a controller declared with `@property` (the `facet`
 * of the commerce facets, for instance) would become an input of the Angular wrapper, which builds
 * its inputs from the attributes. Only the class that declares the decorated field is affected,
 * since another component may expose a public property of the same name.
 */
export function hideBindStateToControllerFieldsPlugin() {
  return {
    name: 'hide-bind-state-to-controller-fields',
    analyzePhase({ts, node, moduleDoc}) {
      if (!ts.isPropertyDeclaration(node) || !ts.isClassDeclaration(node.parent)) {
        return;
      }

      for (const {expression} of ts.getDecorators(node) ?? []) {
        if (
          !ts.isCallExpression(expression) ||
          expression.expression.getText() !== 'bindStateToController'
        ) {
          continue;
        }

        const declaration = moduleDoc.declarations.find(
          (candidate) => candidate.kind === 'class' && candidate.name === node.parent.name?.text
        );
        const [controller] = expression.arguments;
        const fieldsToHide = new Set([node.name.getText()]);
        if (controller && ts.isStringLiteralLike(controller)) {
          fieldsToHide.add(controller.text);
        }
        hideFields(declaration, fieldsToHide);
      }
    },
  };
}

function hideFields(declaration, fieldsToHide) {
  for (const member of declaration?.members ?? []) {
    if (fieldsToHide.has(member.name)) {
      member.privacy = 'private';
    }
  }
  if (declaration?.attributes) {
    declaration.attributes = declaration.attributes.filter(
      (attribute) => !fieldsToHide.has(attribute.fieldName)
    );
  }
}
