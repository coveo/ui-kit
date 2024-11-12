'use client';

import {useParameterManager} from '@/lib/commerce-engine';
import {buildSSRCommerceSearchParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {useCallback, useEffect, useRef} from 'react';

export default function ParameterManager({initialUrl}: {initialUrl: string}) {
  const {state, controller} = useParameterManager();

  const serializer = useCallback(() => {
    return buildSSRCommerceSearchParameterSerializer();
  }, []);

  const {serialize, toCommerceSearchParameters} = serializer();

  const resetUrl = useRef(serialize(state.parameters, new URL(initialUrl)));

  const hasCommerceParameters = useCallback(
    (url: string) => {
      return (
        Object.keys(toCommerceSearchParameters(new URL(url).searchParams))
          .length > 0
      );
    },
    [toCommerceSearchParameters]
  );

  useEffect(() => {
    const popStateHandler = () => {
      if (!controller) {
        return;
      }
      const params = toCommerceSearchParameters(
        new URL(location.href).searchParams
      );
      controller.synchronize(params);
    };
    window.addEventListener('popstate', popStateHandler);
    return () => window.removeEventListener('popstate', popStateHandler);
  }, [controller, toCommerceSearchParameters]);

  useEffect(() => {
    const newUrl = serialize(state.parameters, new URL(location.href));
    if (
      newUrl !== location.href &&
      newUrl !== resetUrl.current &&
      (hasCommerceParameters(resetUrl.current) ||
        hasCommerceParameters(location.href))
    ) {
      history.pushState({}, document.title, newUrl);
    } else if (newUrl === resetUrl.current && !hasCommerceParameters(newUrl)) {
      history.replaceState({}, document.title, initialUrl);
    } else if (
      controller &&
      hasCommerceParameters(location.href) &&
      location.href !== resetUrl.current &&
      location.href !== newUrl
    ) {
      controller.synchronize(
        toCommerceSearchParameters(new URL(location.href).searchParams)
      );
      history.replaceState({}, document.title, location.href);
    }
  }, [
    controller,
    hasCommerceParameters,
    initialUrl,
    serialize,
    state.parameters,
    toCommerceSearchParameters,
  ]);

  return <></>;
}
