import {Schema} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  CommerceControllerDefinitionsMap,
  FetchStaticStateParameters,
} from '../types/engine.js';

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
  params: FetchStaticStateParameters<TControllerDefinitions>
): void {
  if (
    !Array.isArray(params) ||
    params.length === 0 ||
    typeof params[0] !== 'object'
  ) {
    return;
  }

  const paramsObject = params[0] as Record<string, unknown>;

  switch (solutionType) {
    case SolutionType.listing:
      listingDefinitionSchema.validate(paramsObject);
      break;
    case SolutionType.search:
      searchDefinitionSchema.validate(paramsObject);
      break;
    case SolutionType.recommendation:
      recommendationsDefinitionSchema.validate(paramsObject);
      break;
  }

  paramsObject.controllers ??= {};
  const controllers = paramsObject.controllers as ControllersPropsMap;

  const wireParameterManager = (query?: string) => {
    const {searchParams} = paramsObject;
    if (controllerDefinitions?.parameterManager) {
      controllers.parameterManager = {
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
    const {language, country, currency, url} = paramsObject;
    if (controllerDefinitions?.context) {
      controllers.context = {
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
    const {cart} = paramsObject;
    if (controllerDefinitions?.cart && cart) {
      controllers.cart = {initialState: cart};
    }
  };

  const wireRecommendations = () => {
    const {recommendations} = paramsObject;
    controllers.recommendations = recommendations || [];
  };

  // Common wiring for all solution types
  const wireCommon = () => {
    wireCart();
    wireContext();
  };

  switch (solutionType) {
    case SolutionType.search: {
      const {query} = paramsObject;
      wireCommon();
      if (typeof query === 'string') wireParameterManager(query);
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
}
