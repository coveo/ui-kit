export const validateControllerNames = (
  controllers: Record<string, unknown>
) => {
  const reservedNames = ['context', 'cart', 'parameterManager'];
  const invalidNames = Object.keys(controllers).filter((name) =>
    reservedNames.includes(name)
  );
  if (invalidNames.length > 0) {
    throw new Error(
      `Reserved controller names found: ${invalidNames.join(', ')}. Please use different controller names than ${reservedNames.join(', ')}.`
    );
  }
};
