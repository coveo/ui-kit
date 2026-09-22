/**
 * Dev-only diagnostic warning — INTERNAL.
 *
 * Emits a `console.warn` while developing but stays SILENT in production, so a
 * dropped/ withheld action (empty message, unresolved component, invalid
 * payload) surfaces during development without adding noise to a production
 * bundle's runtime. Gated on `process.env.NODE_ENV !== 'production'`, which
 * bundlers dead-code-eliminate for a production build.
 */
export function devWarn(message: string): void {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[thermidor] ${message}`);
  }
}
