export function cemPlugin() {
  // Write a custom plugin
  return {
    // Make sure to always give your plugins a name, this helps when debugging
    name: 'my-plugin',
    // Runs before analysis starts
    initialize({ts, customElementsManifest, context}) {},
    // Runs for all modules in a project, before continuing to the analyzePhase
    collectPhase({ts, node, context}) {},
    // Runs for each module
    analyzePhase({ts, node, moduleDoc, context}) {},
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({moduleDoc, context}) {
      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }
        declaration.members = declaration.members?.filter(
          (m) => m.privacy !== 'private'
        );
        const keptAttributes = [];
        for (const attribute of declaration.attributes || []) {
          const memberLike = declaration.members.find(
            (member) => attribute.fieldName === member.name
          );
          if (!memberLike) {
            continue;
          }
          keptAttributes.push(attribute);
          for (const fieldToCopy of ['type', 'default', 'description']) {
            attribute[fieldToCopy] = declaration.members.find(
              (member) => attribute.fieldName === member.name
            )[fieldToCopy];
          }
        }
        declaration.attributes =
          keptAttributes.length > 0 ? keptAttributes : undefined;
      }

      const wrappedFinalExports = {exports: []};
      const exportCandidates = {};
      for (const exportCandidate of moduleDoc.exports) {
        const exportName = exportCandidate.declaration.name;
        if (!exportCandidates[exportName]) {
          exportCandidates[exportName] = [];
        } else if (
          exportCandidates[exportName] !==
          wrappedFinalExports.exports[exportName]
        ) {
          wrappedFinalExports.exports.push(...exportCandidates[exportName]);
          exportCandidates[exportName] = wrappedFinalExports.exports;
        }
        exportCandidates[exportName].push(exportCandidate);
      }
      moduleDoc.exports = wrappedFinalExports.exports;
    },
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({customElementsManifest, context}) {},
  };
}
