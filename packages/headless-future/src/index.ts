/**
 * @coveo/headless-future - Headless State Management Library
 *
 * Exports:
 * - Layer 2: Public Controllers (search)
 * - Layer 3: Advanced Mutators
 */

// TODO: Encapsulate Engine to export a "public" Engine.
export {Engine} from './core/index.js';
export * from './public/actions/index.js';
export * from './public/controllers/index.js';

// Protocol types (normalized stream events)
export type {NormalizedStreamEvent} from './api/shared/stream-types.js';
