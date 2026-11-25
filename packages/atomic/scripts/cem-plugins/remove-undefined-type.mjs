/**
 * CEM plugin to remove "| undefined" from all attribute types.
 * Transforms types like "X | Y | undefined" to "X | Y".
 */
export function removeUndefinedTypePlugin() {
  return {
    name: 'remove-undefined-type',
    // Run in moduleLinkPhase to process after all analysis is complete
    moduleLinkPhase({moduleDoc}) {
      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }

        // Process attributes
        if (declaration.attributes) {
          for (const attribute of declaration.attributes) {
            if (attribute.type?.text) {
              attribute.type.text = removeUndefinedFromType(attribute.type.text);
            }
          }
        }
      }
    },
  };
}

/**
 * Removes "| undefined" from a type string.
 * Handles various formats:
 * - "X | undefined" -> "X"
 * - "undefined | X" -> "X"
 * - "X | Y | undefined" -> "X | Y"
 * - "X | undefined | Y" -> "X | Y"
 */
function removeUndefinedFromType(typeText) {
  if (!typeText || typeof typeText !== 'string') {
    return typeText;
  }

  // Split by | and filter out undefined, then rejoin
  const parts = typeText
    .split('|')
    .map((part) => part.trim())
    .filter((part) => part !== 'undefined');

  // If all parts were undefined, return the original (shouldn't happen in practice)
  if (parts.length === 0) {
    return typeText;
  }

  // If only one part remains, return it without |
  if (parts.length === 1) {
    return parts[0];
  }

  // Join remaining parts with proper spacing
  return parts.join(' | ');
}
