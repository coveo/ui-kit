import pino, {LevelWithSilent, LogEvent} from 'pino';

/**
 * @group Engine
 * @category Generic
 */
export type LogLevel = LevelWithSilent;

/**
 * @group Engine
 * @category Generic
 */
export interface LoggerOptions {
  /**
   * By default, is set to `warn`.
   */
  level?: LogLevel;
  /**
   * Changes the shape of the log object. This function will be called every time one of the log methods (such as `.info`) is called.
   * All arguments passed to the log method, except the message, will be pass to this function. By default it does not change the shape of the log object.
   */
  logFormatter?: (object: {}) => {};
  /**
   * Function which will be called after writing the log message in the browser.
   *
   * @deprecated This option is deprecated and will be removed in a future version.
   */
  browserPostLogHook?: (level: LogLevel, logEvent: LogEvent) => void;
}

export function buildLogger(options: LoggerOptions | undefined) {
  return pino({
    name: '@coveo/headless',
    level: options?.level || 'warn',
    formatters: {
      log: options?.logFormatter,
    },
  });
}
