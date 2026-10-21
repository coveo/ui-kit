/**
 * Keeps only the exports of the public custom elements: the class export and the definition of each.
 *
 * The analyzer lists every export of every module, but the consumers of the manifest (Storybook, the
 * Angular and React wrapper generators) only need the custom elements. Utilities, mixins, barrel
 * re-exports and `@internal` elements, which only have a definition export, lose their exports, so the
 * analyzer leaves out their declarations.
 */
export function keepCustomElementsPlugin() {
  return {
    name: 'keep-custom-elements',
    moduleLinkPhase({moduleDoc}) {
      const definedElements = new Set(
        moduleDoc.exports
          .filter((entry) => entry.kind === 'custom-element-definition')
          .map((entry) => entry.declaration.name)
      );
      const exportedClasses = new Set(
        moduleDoc.exports
          .filter((entry) => entry.kind === 'js')
          .map((entry) => entry.declaration.name)
      );
      moduleDoc.exports = moduleDoc.exports.filter(
        (entry) =>
          definedElements.has(entry.declaration.name) && exportedClasses.has(entry.declaration.name)
      );
    },
  };
}
