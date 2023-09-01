import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RelevanceInspector,
  RelevanceInspectorProps,
  buildRelevanceInspector,
} from './headless-relevance-inspector';

export type {
  RelevanceInspectorInitialState,
  RelevanceInspectorProps,
  RelevanceInspectorState,
  RelevanceInspector,
  DocumentWeights,
  ExecutionReport,
  ExecutionStep,
  QueryExpressions,
  QueryRankingExpressionWeights,
  QueryRankingExpression,
  ResultRankingInformation,
  RankingInformation,
  TermWeightReport,
  SecurityIdentity,
} from './headless-relevance-inspector';

/**
 * @internal
 */
export const defineRelevanceInspector = (
  props?: RelevanceInspectorProps
): ControllerDefinitionWithoutProps<SearchEngine, RelevanceInspector> => ({
  build: (engine) => buildRelevanceInspector(engine, props),
});
