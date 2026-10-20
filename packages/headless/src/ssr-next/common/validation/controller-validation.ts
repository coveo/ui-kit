/**
 * Throws when a controller definition uses the name of a controller that the engine definition
 * includes automatically.
 */
export const validateReservedControllerNames = (
  controllers: Record<string, unknown>,
  reservedNames: string[]
) => {
  const invalidNames = Object.keys(controllers).filter((name) => reservedNames.includes(name));
  if (invalidNames.length > 0) {
    throw new Error(
      `Reserved controller names found: ${invalidNames.join(', ')}. The ${reservedNames.join(', ')} controller${reservedNames.length > 1 ? 's are' : ' is'} included automatically in every engine definition; use different names for your own controllers.`
    );
  }
};
