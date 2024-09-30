import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  RelevanceInspector,
  RelevanceInspectorProps,
  buildRelevanceInspector,
} from './headless-relevance-inspector.js';

export * from './headless-relevance-inspector.js';

export interface RelevanceInspectorDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RelevanceInspector> {}

/**
 * Defines a `RelevanceInspector` controller instance.
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
