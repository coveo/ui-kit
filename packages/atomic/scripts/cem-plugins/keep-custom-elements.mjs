/**
 * Keeps only the public custom elements in the manifest: the class export and the definition of each,
 * the class declaration, and the module that declares it.
 *
 * The analyzer lists every module, but the consumers of the manifest (Storybook, the Angular and React
 * wrapper generators) only need the custom elements. Utilities, mixins, barrel re-exports and
 * `@internal` elements, which only have a definition export, lose their exports first. Their
 * declarations are removed after the analyzer has applied inheritance, which reads the mixins. The
 * analyzer's own clean-up is not enough: it keeps any unexported declaration that an object literal
 * default of the module names.
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
    packageLinkPhase({customElementsManifest}) {
      for (const moduleDoc of customElementsManifest.modules) {
        const exportedNames = new Set(moduleDoc.exports.map((entry) => entry.declaration.name));
        moduleDoc.declarations = moduleDoc.declarations.filter((declaration) =>
          exportedNames.has(declaration.name)
        );
      }
      customElementsManifest.modules = customElementsManifest.modules.filter(
        (moduleDoc) => moduleDoc.declarations.length > 0
      );
    },
  };
}
