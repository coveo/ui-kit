export function applyJsonPatch(
  source: Record<string, unknown>,
  patch: unknown[]
): Record<string, unknown> {
  let result = {...source};

  for (const op of patch) {
    if (!op || typeof op !== 'object') {
      continue;
    }

    const {
      op: operation,
      path,
      value,
    } = op as {
      op?: string;
      path?: string;
      value?: unknown;
    };

    if (!operation || !path) {
      continue;
    }

    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) {
      if (
        (operation === 'replace' || operation === 'add') &&
        typeof value === 'object' &&
        value !== null
      ) {
        result = {...(value as Record<string, unknown>)};
      }
      continue;
    }

    const [head, ...rest] = segments;

    if (operation === 'remove' && rest.length === 0) {
      const {[head]: _, ...remaining} = result;
      result = remaining;
      continue;
    }

    if (operation !== 'replace' && operation !== 'add') {
      continue;
    }

    if (rest.length === 0) {
      result = {...result, [head]: value};
      continue;
    }

    const nested =
      typeof result[head] === 'object' && result[head] !== null
        ? (result[head] as Record<string, unknown>)
        : {};

    result = {
      ...result,
      [head]: applyJsonPatch(nested, [
        {op: operation, path: `/${rest.join('/')}`, value},
      ]),
    };
  }

  return result;
}
