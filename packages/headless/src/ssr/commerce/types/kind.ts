/**
 * @deprecated This type will be removed in the next major version.
 */
export enum Kind {
  Cart = 'CART',
  Context = 'CONTEXT',
  ParameterManager = 'PARAMETER_MANAGER',
  Recommendations = 'RECOMMENDATIONS',
}

export function createControllerWithKind<TController, TKind extends Kind>(
  controller: TController,
  kind: TKind
): TController & {_kind: TKind} {
  const copy = Object.defineProperties(
    {},
    Object.getOwnPropertyDescriptors(controller)
  );

  Object.defineProperty(copy, '_kind', {
    value: kind,
  });

  return copy as TController & {_kind: TKind};
}
