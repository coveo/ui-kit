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

    if (!declaration.members) {
      continue;
    }

    declaration.members = declaration.members.filter(
      (member) => member?.privacy !== 'private' && member.kind === 'method'
    );
  }

  moduleDoc.exports = cleanExports(moduleDoc.exports);
};

function cleanExports(exports) {
  const finalExports = [];
  const exportCandidates = {};
  for (const exportCandidate of exports) {
    const exportName = exportCandidate.declaration.name;
    if (!exportCandidates[exportName]) {
      // First time we see this export, we add it to the final exports candidate map.
      exportCandidates[exportName] = [];
    } else if (exportCandidates[exportName] !== finalExports[exportName]) {
      // Second time we see this export, we merge all the candidates into the final exports, and make the candidate map point to the final exports for this export name.
      finalExports.push(...exportCandidates[exportName]);
      exportCandidates[exportName] = finalExports;
    }
    // Add the export candidate to the candidate map, regardless of what array it points to.
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

function extractObjectLiteralOptions(arg, ts) {
  const options = {};
  if (arg && ts.isObjectLiteralExpression(arg)) {
    for (const prop of arg.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name.getText();
        options[key] = prop.initializer.text ?? undefined;
      }
    }
  }
  return options;
}

/**
 * CEM plugin to recognize @mapProperty decorator and emit the property as an attribute.
 */
function getDecoratorNameAndOptions(node, ts) {
  let decoratorName = null;
  let options = {};
  if (ts.getDecorators) {
    for (const decorator of ts.getDecorators(node) || []) {
      const expr = decorator.expression;
      if (ts.isCallExpression(expr)) {
        decoratorName = expr.expression.getText();
        options = extractObjectLiteralOptions(expr.arguments[0], ts);
      } else {
        decoratorName = expr.getText();
      }
    }
  }
  return {decoratorName, options};
}

export function mapPropertyPlugin() {
  return {
    name: 'map-property',
    analyzePhase({ts, node, moduleDoc}) {
      if (ts.isPropertyDeclaration(node)) {
        const {decoratorName, options} = getDecoratorNameAndOptions(node, ts);
        if (decoratorName === 'mapProperty') {
          const propName = node.name.getText();
          const attributeName = options.attributePrefix || propName;

          moduleDoc.declarations[0].attributes.push({
            name: attributeName,
            fieldName: propName,
          });
        }
      }
    },
  };
}
