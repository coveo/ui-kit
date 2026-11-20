/**
 * Hides the fields that the `InitializableComponent` interface makes public on every component:
 * `bindings`, `initialized`, `unsubscribeLanguage` and `error`.
 *
 * They are implementation details: storybook-helpers would otherwise list them as property controls,
 * and the published manifest would document them. A field backed by an attribute is a public input,
 * such as `error` on `atomic-component-error`, and is left alone.
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

        const attributeFieldNames = new Set(
          (declaration.attributes ?? []).map((attribute) => attribute.fieldName)
        );
        for (const member of declaration.members ?? []) {
          if (
            baseInitializableComponentFields.includes(member.name) &&
            !attributeFieldNames.has(member.name)
          ) {
            member.privacy = 'private';
          }
        }
      }
    },
  };
}
