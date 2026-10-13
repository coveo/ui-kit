/**
 * Marks the members of `declaration` for which `shouldHide` returns true as private, and removes the
 * attributes backed by them, so that neither shows up in the Storybook API tables nor in the inputs
 * of the Angular wrapper.
 */
export function hideMembers(declaration, shouldHide) {
  const hidden = new Set();
  for (const member of declaration.members ?? []) {
    if (shouldHide(member)) {
      member.privacy = 'private';
      hidden.add(member.name);
    }
  }

  if (declaration.attributes) {
    const attributes = declaration.attributes.filter(
      (attribute) => !hidden.has(attribute.fieldName)
    );
    declaration.attributes = attributes.length > 0 ? attributes : undefined;
  }
}
