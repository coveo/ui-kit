'use client';

import {useParameterManager} from '@/lib/commerce-engine';
import {useAppHistoryRouter} from '@coveo/headless-react/ssr-commerce';
import {buildSSRCommerceSearchParameterSerializer} from '@coveo/headless/ssr-commerce';
import {useEffect, useMemo} from 'react';

export default function ParameterManager() {
  const historyRouter = useAppHistoryRouter();

  const {state, controller} = useParameterManager();

  useEffect(() => {
    if (!controller || !historyRouter.url?.searchParams) {
      return;
    }
    const {toCommerceSearchParameters} =
      buildSSRCommerceSearchParameterSerializer();
    const searchParameters = toCommerceSearchParameters(
      historyRouter.url.searchParams
    );
    return controller.synchronize(searchParameters);
  }, [historyRouter.url?.searchParams, controller]);

  const correctedUrl = useMemo(() => {
    if (!historyRouter.url) {
      return null;
    }
    const newURL = new URL(historyRouter.url);
    const {serialize} = buildSSRCommerceSearchParameterSerializer();

    return serialize(state.parameters, newURL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.parameters]);

  useEffect(() => {
    if (!correctedUrl || document.location.href === correctedUrl) {
      return;
    }

    const {pathname} = new URL(correctedUrl);
    if (pathname !== document.location.pathname) {
      return;
    }
    const isStaticState = controller === undefined;

    historyRouter[isStaticState ? 'replace' : 'push'](correctedUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, correctedUrl]);

  return <></>;
}
