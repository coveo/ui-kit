import externalCartService from '@/external-services/external-cart-service';
import {
  getVisitorIdSetCookieHeader,
  shouldCapture,
} from '@/lib/client-id.server';
import {
  SearchEngineDefinition,
  SearchStaticState,
  StandaloneEngineDefinition,
  StandaloneStaticState,
} from '@/lib/commerce-engine';
import {
  getBaseFetchStaticStateConfiguration,
  getEngineDefinition,
} from '@/lib/commerce-engine.server';
import {getNavigatorContext} from '@/lib/navigator-context';
import {
  buildParameterSerializer,
  NavigatorContext,
  SolutionType,
} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs, MetaFunction} from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import Header from './components/header';
import ParameterManager from './components/parameter-manager';
import {
  SearchProvider,
  StandaloneProvider,
} from './components/providers/providers';
import SearchBox from './components/search-box';
import StandaloneSearchBox from './components/standalone-search-box';
import QueryTrigger from './components/triggers/query-trigger';
import useClientId from './hooks/use-client-id';

export const meta: MetaFunction = () => {
  return [
    {title: 'Coveo Commerce SSR + Remix'},
    {name: 'description', content: 'Coveo Headless Commerce React SSR + Remix'},
  ];
};

export const loader = async ({request}: LoaderFunctionArgs) => {
  const navigatorContext = await getNavigatorContext(request);

  const url = new URL(request.url);
  const isSearchPage = url.pathname === '/search';

  const engineDefinition = isSearchPage
    ? await getEngineDefinition(navigatorContext, request, SolutionType.search)
    : await getEngineDefinition(
        navigatorContext,
        request,
        SolutionType.standalone
      );

  let staticState: SearchStaticState | StandaloneStaticState;

  const baseFetchStaticStateConfiguration =
    await getBaseFetchStaticStateConfiguration(url.pathname);

  if (isSearchPage) {
    const {deserialize} = buildParameterSerializer();
    const parameters = deserialize(url.searchParams);

    staticState = await (
      engineDefinition as SearchEngineDefinition
    ).fetchStaticState({
      controllers: {
        ...baseFetchStaticStateConfiguration.controllers,
        parameterManager: {
          initialState: {
            parameters: parameters,
          },
        },
      },
    });
  } else {
    staticState = await (
      engineDefinition as StandaloneEngineDefinition
    ).fetchStaticState({
      ...baseFetchStaticStateConfiguration,
    });
  }

  const totalItemsInCart = await externalCartService.getTotalCount();

  const setCookieHeader = (await shouldCapture(request))
    ? await getVisitorIdSetCookieHeader(navigatorContext.clientId)
    : undefined;

  return Response.json(
    {
      staticState,
      navigatorContext,
      totalItemsInCart,
    },
    setCookieHeader && {headers: {...setCookieHeader}}
  );
};

export function Layout({children}: {children: React.ReactNode}) {
  const {staticState, navigatorContext, totalItemsInCart} = useLoaderData<{
    staticState: SearchStaticState | StandaloneStaticState;
    navigatorContext: NavigatorContext;
    totalItemsInCart: number;
  }>();

  useClientId();

  const isSearchStaticState = (
    staticState: SearchStaticState | StandaloneStaticState
  ): staticState is SearchStaticState => {
    return staticState.searchActions.length > 0;
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body>
        {isSearchStaticState(staticState) ? (
          <SearchProvider
            navigatorContext={navigatorContext}
            staticState={staticState}
          >
            <ParameterManager url={navigatorContext.location} />
            <QueryTrigger />
            <Header totalItemsInCart={totalItemsInCart}>
              <SearchBox />
            </Header>
            {children}
          </SearchProvider>
        ) : (
          <>
            <Header totalItemsInCart={totalItemsInCart}>
              <StandaloneProvider
                navigatorContext={navigatorContext}
                staticState={staticState}
              >
                <StandaloneSearchBox />
              </StandaloneProvider>
            </Header>
            {children}
          </>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
