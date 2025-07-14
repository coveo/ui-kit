import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildRelevanceInspector,
  type RelevanceInspector,
  type RelevanceInspectorProps,
} from './headless-relevance-inspector.js';

export * from './headless-relevance-inspector.js';

export interface RelevanceInspectorDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RelevanceInspector> {}

/**
 * Defines a `RelevanceInspector` controller instance.
 * @group Definers
 *
 * @param props - The configurable `RelevanceInspector` properties.
 * @returns The `RelevanceInspector` controller definition.
 * */
export function defineRelevanceInspector(
  props?: RelevanceInspectorProps
): RelevanceInspectorDefinition {
  return {
    build: (engine) => buildRelevanceInspector(engine, props),
  };
}
