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
import type {
  CommonFetchConfig,
  FetchStaticStateOptions,
} from '../types/fetch-static-state.js';

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
  // recommendation:  // TODO: required array or not
};

export const listingDefinitionSchema = new Schema(listingDefinition);
export const searchDefinitionSchema = new Schema(searchDefinition);
export const recommendationsDefinitionSchema = new Schema(
  recommendationsDefinition
);

// TODO: test this function as it is crucial
export function wireControllerParams<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  solutionType: SolutionType,
  controllerDefinitions: TControllerDefinitions,
  params: FetchStaticStateParameters<TControllerDefinitions>
): void {
  if (!(params.length > 0 && params[0])) {
    return;
  }

  switch (solutionType) {
    case SolutionType.listing:
      listingDefinitionSchema.validate(params[0]);
      break;
    case SolutionType.search:
      searchDefinitionSchema.validate(params[0]);
      break;
    case SolutionType.recommendation:
      recommendationsDefinitionSchema.validate(params[0]);
      break;
  }

  // TODO: find a way to wire the typings
  params[0].controllers = params[0].controllers ?? {};

  const controllers = params[0].controllers as ControllersPropsMap;

  const wireParameterManager = (query?: string) => {
    const {searchParams} = params[0] as CommonFetchConfig;
    if (controllerDefinitions && 'parameterManager' in controllerDefinitions) {
      controllers.parameterManager = {
        initialState: {
          parameters: {
            ...(query && {q: query}),
            ...searchParams,
          },
        },
      };
    }
  };

  const wireContext = () => {
    const {language, country, currency, url} = params[0] as CommonFetchConfig;
    if (controllerDefinitions && 'context' in controllerDefinitions) {
      controllers.context = {
        initialState: {
          view: {url},
          language: language,
          country: country,
          currency: currency,
        },
      };
    }
  };

  const wireCart = () => {
    const {cart} = params[0] as CommonFetchConfig;
    if (controllerDefinitions && 'cart' in controllerDefinitions && cart) {
      controllers.cart = {initialState: cart};
    }
  };

  const wireRecommendations = () => {
    // TODO: to implement
  };

  switch (solutionType) {
    case SolutionType.search: {
      const {query} = params[0] as FetchStaticStateOptions<SolutionType.search>;
      wireCart();
      wireContext();
      wireParameterManager(query);
      break;
    }

    case SolutionType.listing: {
      wireCart();
      wireContext();
      wireParameterManager();
      break;
    }

    case SolutionType.recommendation: {
      wireCart();
      wireContext();
      wireRecommendations();
      break;
    }

    case SolutionType.standalone:
      wireCart();
      wireContext();
      break;
  }
}
