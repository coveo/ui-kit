//const ReservedContextKeys = [] as const;
/**
 * @todo Example reserved keys
 */
const ReservedContextKeys = ['caseId', 'caseNumber'] as const;
type ReservedContextKey = (typeof ReservedContextKeys)[number];
const ReservedContextKeysToControllerMap: Record<ReservedContextKey, string> = {
  caseId: 'caseContext',
  caseNumber: 'caseContext',
};

export class ReservedContextKeyError extends Error {
  constructor(key: ReservedContextKey) {
    super(
      `The key "${key}" is reserved for internal use. Use ${ReservedContextKeysToControllerMap[key]} to set this value.}`
    );
  }
}

class UnreservedContextKeyError extends Error {
  constructor(key: ReservedContextKey) {
    super(
      `The key "${key}" has not been reserved. Please report this error to Coveo on https://github.com/coveo/ui-kit/issues/new.`
    );
  }
}

export function isReservedContextKey(
  contextKey: string
): contextKey is ReservedContextKey {
  return (ReservedContextKeys as readonly string[]).includes(contextKey);
}
