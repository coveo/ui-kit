import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RelevanceInspector,
  RelevanceInspectorProps,
  buildRelevanceInspector,
} from './headless-relevance-inspector';

export * from './headless-relevance-inspector';

/**
 * @alpha
 */
export const defineRelevanceInspector = (
  props?: RelevanceInspectorProps
): ControllerDefinitionWithoutProps<SearchEngine, RelevanceInspector> => ({
  build: (engine) => buildRelevanceInspector(engine, props),
});
