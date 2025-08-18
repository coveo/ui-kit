import {Schema} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {BuildConfig, SearchBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

export const requiredDefinition = {
  language: contextDefinition.language,
  country: contextDefinition.country,
  currency: contextDefinition.currency,
  url: requiredNonEmptyString,
};

export const listingDefinition = {
  ...requiredDefinition,
};

export const searchDefinition = {
  ...requiredDefinition,
  query: requiredEmptyAllowedString,
};

export const recommendationsDefinition = {
  ...requiredDefinition,
  // recommendation:  // TODO: KIT-4619: support array of recommendations
};

export const listingDefinitionSchema = new Schema(listingDefinition);
export const searchDefinitionSchema = new Schema(searchDefinition);
export const recommendationsDefinitionSchema = new Schema(
  recommendationsDefinition
);

export function wireControllerParams<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  solutionType: SolutionType,
  controllerDefinitions: TControllerDefinitions,
  buildConfig: BuildConfig<SolutionType> & {
    controllers?: ControllersPropsMap;
  }
): InferControllerPropsMapFromDefinitions<TControllerDefinitions> {
  switch (solutionType) {
    case SolutionType.listing:
      listingDefinitionSchema.validate(buildConfig);
      break;
    case SolutionType.search:
      searchDefinitionSchema.validate(buildConfig);
      break;
    case SolutionType.recommendation:
      recommendationsDefinitionSchema.validate(buildConfig);
      break;
  }

  const controllerProps: ControllersPropsMap = buildConfig.controllers ?? {};

  const wireParameterManager = (query?: string) => {
    const {searchParams} = buildConfig;
    if (controllerDefinitions?.parameterManager) {
      controllerProps.parameterManager = {
        initialState: {
          parameters: {
            ...(query && {q: query}),
            ...(searchParams && typeof searchParams === 'object'
              ? searchParams
              : {}),
          },
        },
      };
    }
  };

  const wireContext = () => {
    const {language, country, currency, url} = buildConfig;
    if (controllerDefinitions?.context) {
      controllerProps.context = {
        initialState: {
          view: {url},
          language,
          country,
          currency,
        },
      };
    }
  };

  const wireCart = () => {
    const {cart} = buildConfig;
    if (controllerDefinitions?.cart && cart) {
      controllerProps.cart = {initialState: cart};
    }
  };

  const wireRecommendations = () => {
    // TODO: KIT-4619: wire recommendations
  };

  // Common wiring for all solution types
  const wireCommon = () => {
    wireCart();
    wireContext();
  };

  switch (solutionType) {
    case SolutionType.search: {
      const {query} = buildConfig as SearchBuildConfig;
      wireCommon();
      if (typeof query === 'string') {
        wireParameterManager(query);
      }
      console.log('*********************');
      console.log(controllerProps);
      console.log('*********************');

      break;
    }

    case SolutionType.listing: {
      wireCommon();
      wireParameterManager();
      break;
    }

    case SolutionType.recommendation: {
      wireCommon();
      wireRecommendations();
      break;
    }

    case SolutionType.standalone:
      wireCommon();
      break;
  }

  return controllerProps as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
