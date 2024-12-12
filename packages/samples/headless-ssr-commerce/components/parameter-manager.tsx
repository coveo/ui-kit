'use client';

import {useParameterManager} from '@/lib/commerce-engine';
import {buildParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {useSearchParams} from 'next/navigation';
import {useEffect, useMemo, useRef} from 'react';

export default function ParameterManager({url}: {url: string | null}) {
  const {state, methods} = useParameterManager();

  const searchParams = useSearchParams();

  const {serialize, deserialize} = buildParameterSerializer();

  const baseUrl = useMemo(() => new URL(url ?? location.href), [url]);

  const previousUrl = useRef(baseUrl.href);

  const flag = useRef(true);

  useEffect(() => {
    if (methods === undefined) {
      return;
    }

    if (flag.current) {
      flag.current = false;
      return;
    }

    const newCommerceParams = deserialize(searchParams);

    const newUrl = serialize(newCommerceParams, new URL(previousUrl.current));

    if (newUrl !== previousUrl.current) {
      flag.current = true;
      previousUrl.current = newUrl;
      methods.synchronize(newCommerceParams);
    }
  }, [deserialize, methods, searchParams, serialize]);

  useEffect(() => {
    if (methods === undefined) {
      return;
    }

    if (flag.current) {
      flag.current = false;
      return;
    }

    const newUrl = serialize(state.parameters, new URL(previousUrl.current));

    if (previousUrl.current !== newUrl) {
      flag.current = true;
      previousUrl.current = newUrl;
      history.pushState(null, document.title, newUrl);
    }
  }, [methods, serialize, state.parameters]);

  return null;
}
