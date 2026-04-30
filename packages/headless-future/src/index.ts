/**
 * @thermidor/headless - Headless State Management Library
 *
 * Layer 0 POC Implementation
 *
 * This library is side-effect free. You MUST call initialize() before use.
 *
 * This file will eventually export:
 * - Layer 2: Public Controllers (not yet implemented)
 * - Layer 3: Advanced Mutators (not yet implemented)
 *
 * Currently exports nothing externally - Layer 0 is internal only.
 */

// TODO: Encapsulate Engine to export a "public" Engine.
export {Engine} from './core/index.js';
export * from './public/actions/index.js';
export * from './public/controllers/index.js';
