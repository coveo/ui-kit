import {
  type NavigatorContext,
  SolutionType,
} from '@coveo/headless-react/ssr-commerce';
import {coveo_accessToken} from '@/app/cookies.server';
import externalCartService from '@/external-services/external-cart-service';
import externalContextService from '@/external-services/external-context-service';
import {
  toCoveoCartItems,
  toCoveoCurrency,
} from '@/utils/external-api-conversions';
import {isExpired} from '../utils/access-token-utils.js';
import {
  _listingEngineDefinition,
  _recommendationEngineDefinition,
  _searchEngineDefinition,
  _standaloneEngineDefinition,
  type ListingEngineDefinition,
  type RecommendationEngineDefinition,
  type SearchEngineDefinition,
  type StandaloneEngineDefinition,
} from './commerce-engine.js';
import {fetchToken} from './fetch-token.js';

type MappedEngineDefinition<T extends SolutionType> =
  T extends SolutionType.listing
    ? ListingEngineDefinition
    : T extends SolutionType.recommendation
      ? RecommendationEngineDefinition
      : T extends SolutionType.search
        ? SearchEngineDefinition
        : T extends SolutionType.standalone
          ? StandaloneEngineDefinition
          : never;

export async function getEngineDefinition<T extends SolutionType>(
  navigatorContext: NavigatorContext,
  request: Request,
  solutionType: T
): Promise<MappedEngineDefinition<T>> {
  let engineDefinition:
    | ListingEngineDefinition
    | RecommendationEngineDefinition
    | StandaloneEngineDefinition
    | SearchEngineDefinition;

  switch (solutionType) {
    case SolutionType.listing:
      engineDefinition = _listingEngineDefinition;
      break;
    case SolutionType.recommendation:
      engineDefinition = _recommendationEngineDefinition;
      break;
    case SolutionType.standalone:
      engineDefinition = _standaloneEngineDefinition;
      break;
    case SolutionType.search:
      engineDefinition = _searchEngineDefinition;
      break;
    default:
      throw new Error(`Unknown solution type: ${solutionType}`);
  }

  if (isExpired(engineDefinition.getAccessToken())) {
    const accessTokenCookie = await coveo_accessToken.parse(
      request.headers.get('Cookie')
    );

    const accessToken = isExpired(accessTokenCookie)
      ? await fetchToken()
      : accessTokenCookie;

    engineDefinition.setAccessToken(accessToken);
  }

  engineDefinition.setNavigatorContextProvider(() => navigatorContext);

  return engineDefinition as MappedEngineDefinition<T>;
}

export const getBaseFetchStaticStateConfiguration = async (
  pathname: string
) => {
  const items = await externalCartService.getItems();
  const context = await externalContextService.getContextInformation();

  const {language, country, currency} = context;
  return {
    controllers: {
      cart: {
        initialState: {
          items: toCoveoCartItems(items),
        },
      },
      context: {
        language,
        country,
        currency: toCoveoCurrency(currency),
        view: {
          url: `https://sports.barca.group${pathname}`,
        },
      },
    },
  };
};
