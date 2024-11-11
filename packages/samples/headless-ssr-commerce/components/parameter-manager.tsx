'use client';

import {useParameterManager} from '@/lib/commerce-engine';
import {buildSSRCommerceSearchParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect, useRef} from 'react';

export default function ParameterManager({initialUrl}: {initialUrl: string}) {
  const {state} = useParameterManager();
  const router = useRouter();

  const serializer = useCallback(() => {
    return buildSSRCommerceSearchParameterSerializer();
  }, []);

  const {serialize, removeCommerceParameters, toCommerceSearchParameters} =
    serializer();

  const resetUrl = useRef(removeCommerceParameters(initialUrl));

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
    if (!hasCommerceParameters(initialUrl)) {
      resetUrl.current = serialize(state.parameters, new URL(initialUrl));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newUrl = serialize(state.parameters, new URL(location.href));
    if (
      newUrl !== resetUrl.current &&
      (hasCommerceParameters(resetUrl.current) ||
        hasCommerceParameters(location.href))
    ) {
      router.push(newUrl);
    } else {
      router.push(removeCommerceParameters(resetUrl.current));
    }
  }, [
    hasCommerceParameters,
    initialUrl,
    removeCommerceParameters,
    router,
    serialize,
    state.parameters,
  ]);

  return <></>;
}
