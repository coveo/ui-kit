import type {Logger} from 'pino';

const warnedApisByKey = new WeakMap<object, Set<string>>();

/**
 * Logs a deprecation warning the first time a deprecated API is used for a given key.
 *
 * @param logger - The logger that logs the warning.
 * @param api - The name of the deprecated API.
 * @param instruction - What to do instead, as a full sentence.
 * @param key - The object the warning is logged once for. Defaults to the logger, so that the warning is logged once
 * per engine. Server-side rendering code builds an engine per request, so it passes its engine or controller
 * definition instead.
 */
export function warnDeprecatedOnce(
  logger: Logger,
  api: string,
  instruction: string,
  key: object = logger
) {
  let warnedApis = warnedApisByKey.get(key);
  if (!warnedApis) {
    warnedApis = new Set();
    warnedApisByKey.set(key, warnedApis);
  }

  if (warnedApis.has(api)) {
    return;
  }

  warnedApis.add(api);
  logger.warn(
    `[Deprecated] ${api} is deprecated and will be removed in Headless v4. ${instruction}`
  );
}

/**
 * Wraps an action creator so that it logs a deprecation warning, once per engine, whenever `isDeprecatedUsage` returns
 * `true` for its arguments. The returned function keeps the `type` and `match` members of the original action creator.
 */
export function withDeprecationWarning<TActionCreator extends (...args: never[]) => unknown>(
  logger: Logger,
  actionCreator: TActionCreator,
  api: string,
  instruction: string,
  isDeprecatedUsage: (...args: Parameters<TActionCreator>) => boolean = () => true
): TActionCreator {
  const wrapped = (...args: Parameters<TActionCreator>) => {
    if (isDeprecatedUsage(...args)) {
      warnDeprecatedOnce(logger, api, instruction);
    }
    return actionCreator(...args);
  };

  return Object.assign(wrapped, actionCreator) as unknown as TActionCreator;
}
