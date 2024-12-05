'use client';

import {useParameterManager} from '@/lib/commerce-engine';
import {buildParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {usePathname, useSearchParams} from 'next/navigation';
import {useEffect, useRef} from 'react';

export default function ParameterManager({url}: {url: string | null}) {
  const {state, methods} = useParameterManager();

  const searchParams = useSearchParams();
  const pathName = usePathname();

  const {serialize, deserialize} = buildParameterSerializer();

  const baseUrl = new URL(url ?? location.href);

  const previousUrl = useRef(baseUrl.href);

  const flag = useRef(false);
  const fullyRendered = useRef(false);

  useEffect(() => {
    if (methods === undefined) {
      return;
    }

    if (flag.current) {
      flag.current = false;
      return;
    }

    const newCommerceParams = deserialize(searchParams);

    const newUrl = serialize(
      newCommerceParams,
      new URL(`${baseUrl.origin}${pathName}${baseUrl.search}`)
    );

    if (newUrl !== previousUrl.current) {
      flag.current = true;
      previousUrl.current = newUrl;
      methods.synchronize(newCommerceParams);
    }
  }, [
    baseUrl.origin,
    baseUrl.search,
    methods,
    pathName,
    searchParams,
    serialize,
    deserialize,
  ]);

  useEffect(() => {
    if (methods === undefined) {
      return;
    }

    if (flag.current) {
      flag.current = false;
      return;
    }

    if (!fullyRendered.current) {
      fullyRendered.current = true;
      return;
    }

    const newUrl = serialize(
      state.parameters,
      new URL(`${baseUrl.origin}${pathName}${baseUrl.search}`)
    );

    if (
      previousUrl.current !== newUrl &&
      (new URL(newUrl).searchParams.size > 0 || fullyRendered.current)
    ) {
      flag.current = true;
      previousUrl.current = newUrl;
      history.pushState(null, document.title, newUrl);
    }
  }, [
    baseUrl.origin,
    baseUrl.search,
    methods,
    pathName,
    serialize,
    state.parameters,
  ]);

  return null;
}
