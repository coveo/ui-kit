/**
 * Core primitives for knowledge graph construction
 *
 * Layer 1: Graph Primitives (generic)
 */

export type {CacheKey, CacheKeys, NodeId} from './entity-cache.js';
export {EntityCache} from './entity-cache.js';
export type {GraphStats, NodeData, RelationshipData} from './graph-builder.js';
export {GraphBuilder} from './graph-builder.js';
export type {LinkingConfig} from './relationship-linker.js';
export {linkEntitiesByFileAnalysis} from './relationship-linker.js';
