/**
 * Removes `| undefined` from the type of attributes, and of the fields behind them.
 *
 * The analyzer adds `| undefined` to the type of every optional (`?`) field. Attributes are optional
 * by nature, so the suffix only adds noise to the type column of the Storybook API tables, which show
 * the type of the attribute (built-in docs) or of its field (storybook-helpers). Fields without an
 * attribute keep their exact type.
 */
export function removeUndefinedTypePlugin() {
  return {
    name: 'remove-undefined-type',
    moduleLinkPhase({moduleDoc}) {
      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }

        for (const attribute of declaration.attributes ?? []) {
          const field = declaration.members?.find((member) => member.name === attribute.fieldName);
          for (const typed of [attribute, field]) {
            if (typed?.type?.text) {
              typed.type.text = removeUndefined(typed.type.text);
            }
          }
        }
      }
    },
  };
}

function removeUndefined(typeText) {
  const types = typeText
    .split('|')
    .map((type) => type.trim())
    .filter((type) => type !== 'undefined');
  return types.length > 0 ? types.join(' | ') : typeText;
}
