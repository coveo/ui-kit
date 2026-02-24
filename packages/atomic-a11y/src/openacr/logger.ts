export interface Logger {
  warn(...args: unknown[]): void;
  log(...args: unknown[]): void;
}

export function createLogger(prefix: string): Logger {
  return {
    warn(...args: unknown[]) {
      console.warn(`[${prefix}]`, ...args);
    },
    log(...args: unknown[]) {
      console.log(`[${prefix}]`, ...args);
    },
  };
}
