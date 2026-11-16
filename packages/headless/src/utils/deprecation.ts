import type {Logger} from 'pino';

const warnedApisByLogger = new WeakMap<Logger, Set<string>>();

/**
 * Logs a deprecation warning through the engine logger the first time a deprecated API is used with that engine.
 *
 * @param logger - The logger of the engine that uses the deprecated API.
 * @param api - The name of the deprecated API.
 * @param instruction - What to do instead, as a full sentence.
 */
export function warnDeprecatedOnce(logger: Logger, api: string, instruction: string) {
  let warnedApis = warnedApisByLogger.get(logger);
  if (!warnedApis) {
    warnedApis = new Set();
    warnedApisByLogger.set(logger, warnedApis);
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
