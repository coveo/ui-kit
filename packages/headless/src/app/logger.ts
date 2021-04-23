import pino, {LevelWithSilent, LogEvent} from 'pino';

export type LogLevel = LevelWithSilent;

export interface LoggerOptions {
  /**
   * By default, is set to `warn`.
   */
  level?: LogLevel;
  /**
   * Changes the shape of the log object. This function will be called every time one of the log methods (such as `.info`) is called.
   * All arguments passed to the log method, except the message, will be pass to this function. By default it does not change the shape of the log object.
   */
  logFormatter?: (object: object) => object;
  /**
   * Function which will be called after writing the log message in the browser.
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
    browser: {
      transmit: {
        send: options?.browserPostLogHook || (() => {}),
      },
    },
  });
}
