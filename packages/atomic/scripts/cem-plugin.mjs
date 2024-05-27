const moduleLinkPhase = ({moduleDoc}) => {
  for (const declaration of moduleDoc.declarations) {
    if (declaration.kind !== 'class') {
      continue;
    }
    const keptAttributes = [];
    for (const attribute of declaration.attributes || []) {
      const memberLike = findMember(declaration, attribute);
      if (!memberLike || memberLike.privacy === 'private') {
        continue;
      }
      keptAttributes.push(attribute);
      copyAttributesFromMember(attribute, memberLike);
    }
    declaration.attributes =
      keptAttributes.length > 0 ? keptAttributes : undefined;
    declaration.members = [];
  }

  moduleDoc.exports = cleanExports(moduleDoc.exports);
};

function cleanExports(exports) {
  const finalExports = [];
  const exportCandidates = {};
  for (const exportCandidate of exports) {
    const exportName = exportCandidate.declaration.name;
    if (!exportCandidates[exportName]) {
      exportCandidates[exportName] = [];
    } else if (exportCandidates[exportName] !== finalExports[exportName]) {
      finalExports.push(...exportCandidates[exportName]);
      exportCandidates[exportName] = finalExports;
    }
    exportCandidates[exportName].push(exportCandidate);
  }
  return finalExports;
}

function findMember(declaration, attribute) {
  return declaration.members.find(
    (member) => attribute.fieldName === member.name
  );
}

function copyAttributesFromMember(attribute, member) {
  for (const fieldToCopy of ['type', 'default', 'description']) {
    attribute[fieldToCopy] = member[fieldToCopy];
  }
}

export const cemPlugin = () => ({
  name: 'my-plugin',
  // Runs for each module, after analyzing, all information about your module should now be available
  moduleLinkPhase,
});
