import type {SearchEngine} from '@coveo/headless';
import {
  buildRelevanceInspector,
  type RelevanceInspector,
  type RelevanceInspectorProps,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type DocumentWeights,
  type ExecutionReport,
  type ExecutionStep,
  type QueryRankingExpression,
  type QueryRankingExpressionWeights,
  type RankingInformation,
  type SecurityIdentity,
  type TermWeightReport,
  type RelevanceInspectorProps,
  type RelevanceInspectorInitialState,
  type RelevanceInspector,
  type RelevanceInspectorState,
  type ResultRankingInformation,
  type QueryExpressions,
} from '@coveo/headless';

export interface RelevanceInspectorDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  RelevanceInspector
> {}

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
