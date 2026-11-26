const warnedDeprecations = new Set();

/**
 * Logs a console warning, once per page, that a component property is deprecated.
 * @param {string} componentName The tag name of the component, e.g. `c-quantic-result-link`.
 * @param {string} deprecatedProperty The name of the deprecated property.
 * @param {string} replacementProperty The name of the property to use instead.
 */
export function warnDeprecatedPropertyOnce(
  componentName,
  deprecatedProperty,
  replacementProperty
) {
  const key = `${componentName}:${deprecatedProperty}`;
  if (warnedDeprecations.has(key)) {
    return;
  }
  warnedDeprecations.add(key);
  console.warn(
    `The "${deprecatedProperty}" property of ${componentName} is deprecated and will be removed in the next major version. Use "${replacementProperty}" instead.`
  );
}
