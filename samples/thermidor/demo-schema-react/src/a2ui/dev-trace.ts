export function devTrace(channel: string, ...parts: unknown[]): void {
  if (import.meta.env.DEV && !import.meta.env.TEST) {
    console.debug(channel, ...parts);
  }
}
