import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  RelevanceInspector,
  RelevanceInspectorProps,
  buildRelevanceInspector,
} from './headless-relevance-inspector.js';

export * from './headless-relevance-inspector.js';

/**
 * @internal
 */
export const defineRelevanceInspector = (
  props?: RelevanceInspectorProps
): ControllerDefinitionWithoutProps<SearchEngine, RelevanceInspector> => ({
  build: (engine) => buildRelevanceInspector(engine, props),
});
