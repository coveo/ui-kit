import {hideMembers} from './hide-members.mjs';

/**
 * Hides the fields that `InitializableComponent` requires of every component: `bindings`,
 * `initialized`, `unsubscribeLanguage` and `error`.
 *
 * They are public so that the `@bindings` decorator and the error guard can set them, but they are
 * implementation details: storybook-helpers would otherwise list them as property controls, and the
 * published manifest would document them. A field backed by an attribute is a public input, such as
 * `error` on `atomic-component-error`, and is left alone.
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
        hideMembers(
          declaration,
          (member) =>
            baseInitializableComponentFields.includes(member.name) && !inputs.has(member.name)
        );
      }
    },
  };
}
