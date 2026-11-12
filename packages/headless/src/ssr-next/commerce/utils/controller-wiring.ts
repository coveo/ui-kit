import {ArrayValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema.js';
import {nonEmptyString, nonRequiredEmptyAllowedString} from '../../../utils/validate-payload.js';
import type {CommonBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import {getRecommendationDefinitions} from './recommendation-filter.js';

const commonDefinition = (recommendationNames: string[]) => ({
  context: new RecordValue({
    options: {required: true},
    values: contextDefinition,
  }),
  recommendations: new ArrayValue({
    each: new StringValue({
      required: true,
      constrainTo: recommendationNames,
      emptyAllowed: false,
    }),
    required: false,
  }),
  productId: nonEmptyString,
});

const listingDefinition = (recommendationNames: string[]) => ({
  ...commonDefinition(recommendationNames),
  searchParams: new RecordValue({
    values: parametersDefinition,
  }),
});

const standaloneDefinition = (recommendationNames: string[]) => ({
  ...commonDefinition(recommendationNames),
});

const searchDefinition = (recommendationNames: string[]) => ({
  ...commonDefinition(recommendationNames),
  searchParams: new RecordValue({
    options: {required: false},
    values: {q: nonRequiredEmptyAllowedString, ...parametersDefinition},
  }),
});

export const listingDefinitionSchema = (recommendationNames: string[]) =>
  new Schema(listingDefinition(recommendationNames));
export const searchDefinitionSchema = (recommendationNames: string[]) =>
  new Schema(searchDefinition(recommendationNames));
export const standaloneDefinitionSchema = (recommendationNames: string[]) =>
  new Schema(standaloneDefinition(recommendationNames));

/**
 * Validates the page facts passed to `fetchStaticState()` against the schema of the kind of page,
 * naming the engine definition they belong to.
 */
export function validateBuildConfig(
  solutionType: SolutionType,
  controllerDefinitions: CommerceControllerDefinitionsMap,
  buildConfig: CommonBuildConfig
): void {
  const recommendationNames = Object.keys(getRecommendationDefinitions(controllerDefinitions));
  const validationMap: Record<SolutionType, Schema<object>> = {
    [SolutionType.listing]: listingDefinitionSchema(recommendationNames),
    [SolutionType.search]: searchDefinitionSchema(recommendationNames),
    [SolutionType.standalone]: standaloneDefinitionSchema(recommendationNames),
  };

  validationMap[solutionType].validate(
    buildConfig,
    `Check the options passed to fetchStaticState() of the ${solutionType} engine definition.`
  );
}
