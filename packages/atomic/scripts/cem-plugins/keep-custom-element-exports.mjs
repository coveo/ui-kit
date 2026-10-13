/**
 * Keeps only the public custom elements in the manifest.
 *
 * The analyzer lists every export of every module, but the consumers of the manifest (Storybook,
 * the Angular and React wrapper generators, the published package) only care about custom elements.
 * Keeping just the class export and the definition of each element lets the analyzer's own clean-up
 * drop every other declaration: utilities, mixins, and `@internal` elements, which only have a
 * definition export.
 */
export function keepCustomElementExportsPlugin() {
  return {
    name: 'keep-custom-element-exports',
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
