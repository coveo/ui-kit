/**
 * Removes the ` | undefined` that the analyzer appends to the type of an optional (`?`) field from the
 * type of its attribute.
 *
 * Attributes are optional by nature, so the suffix only adds noise to the type column of the
 * Storybook API tables. The analyzer builds each attribute from its field and shares the `type`
 * object, so the field loses the suffix too. Only the suffix goes: splitting the type on `|` would
 * also rewrite a string literal or a type argument that contains one.
 */
export function removeUndefinedTypePlugin() {
  return {
    name: 'remove-undefined-type',
    moduleLinkPhase({moduleDoc}) {
      for (const declaration of moduleDoc.declarations) {
        for (const attribute of declaration.attributes ?? []) {
          if (attribute.type?.text) {
            attribute.type.text = attribute.type.text.replace(/ \| undefined$/, '');
          }
        }
      }
    },
  };
}
