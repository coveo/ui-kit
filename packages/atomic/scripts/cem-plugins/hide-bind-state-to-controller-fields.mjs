import {hideMembers} from './hide-members.mjs';

/**
 * Hides the fields decorated with `@bindStateToController`, along with the controller field each one
 * is bound to.
 *
 * Both are implementation details of the component that declares them: storybook-helpers would
 * otherwise list them as property controls, and a controller declared with `@property` (the `facet`
 * of the commerce facets, for instance) would become an input of the Angular wrapper, which builds
 * its inputs from the attributes. Only the declaring class (matched by name within
 * its module) is affected, since another component may expose a public property of the same name.
 *
 * Controller fields that stay public for other components to reach, but that are not inputs, should
 * be tagged `@internal` so that the analyzer leaves them out of the manifest altogether.
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

        const fieldsToHide = getOrCreateFieldsToHide(
          fieldsToHideByModule,
          moduleDoc,
          node.parent.name.text
        );
        fieldsToHide.add(node.name.getText());
        const [controllerProperty] = expression.arguments;
        if (controllerProperty && ts.isStringLiteralLike(controllerProperty)) {
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
        if (declaration.kind === 'class' && fieldsToHide) {
          hideMembers(declaration, (member) => fieldsToHide.has(member.name));
        }
      }
    },
  };
}

function getOrCreateFieldsToHide(fieldsToHideByModule, moduleDoc, className) {
  if (!fieldsToHideByModule.has(moduleDoc)) {
    fieldsToHideByModule.set(moduleDoc, new Map());
  }
  const fieldsToHideByClass = fieldsToHideByModule.get(moduleDoc);
  if (!fieldsToHideByClass.has(className)) {
    fieldsToHideByClass.set(className, new Set());
  }
  return fieldsToHideByClass.get(className);
}
