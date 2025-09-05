import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildRelevanceInspector,
  type RelevanceInspector,
  type RelevanceInspectorProps,
} from '../../../../controllers/relevance-inspector/headless-relevance-inspector.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/relevance-inspector/headless-relevance-inspector.js';

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
