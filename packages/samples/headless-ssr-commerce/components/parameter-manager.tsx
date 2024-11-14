'use client';

import {useParameterManager} from '@/lib/commerce-engine';
import {buildSSRCommerceSearchParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect, useRef} from 'react';

export default function ParameterManager({
  initialUrl,
  referrer,
}: {
  initialUrl: string;
  referrer: string | null;
}) {
  const {state, controller} = useParameterManager();

  const serializer = useCallback(() => {
    return buildSSRCommerceSearchParameterSerializer();
  }, []);

  const router = useRouter();
  const rendered = useRef(false);

  const {serialize, toCommerceSearchParameters} = serializer();

  const originalCommerceParams = useRef(
    new Set(
      new URL(
        serialize(state.parameters, new URL(initialUrl.split('?')[0]))
      ).search.split('&')
    )
  );

  useEffect(() => {
    if (controller) {
      return;
    }
    if (!rendered.current) {
      rendered.current = true;
      console.log('refresh');
      router.refresh();
    }
  }, []);

  const resetUrl = useRef(serialize(state.parameters, new URL(initialUrl)));

  useEffect(() => {
    if (!controller) {
      return;
    }
    const popStateHandler = () => {
      console.log('popstate');
      const params = toCommerceSearchParameters(
        new URL(location.href).searchParams
      );
      controller.synchronize(params);
      rendered.current = true;
      console.log('synchronize', params);
    };
    window.addEventListener('popstate', popStateHandler);
    return () => window.removeEventListener('popstate', popStateHandler);
  }, [controller, toCommerceSearchParameters]);

  useEffect(() => {
    if (!controller) {
      return;
    }

    const locationCommerceParams = toCommerceSearchParameters(
      new URL(location.href).searchParams
    );

    const currentCommerceParams = new Set(
      new URL(
        serialize(
          locationCommerceParams,
          new URL(`${location.origin}${location.pathname}`)
        )
      ).search.split('&')
    );

    if (
      originalCommerceParams.current.difference(currentCommerceParams).size >
        0 &&
      !rendered.current
    ) {
      console.log('replace state (a)', `${resetUrl.current}${location.hash}`);
      history.replaceState(
        {},
        document.title,
        `${resetUrl.current}${location.hash}`
      );
      rendered.current = true;
    } else {
      const newUrl = serialize(state.parameters, new URL(location.href));

      if (newUrl !== location.href) {
        if (newUrl !== resetUrl.current) {
          console.log('push state', newUrl);

          history.pushState({url: newUrl}, document.title, newUrl);
        } else if (rendered.current) {
          console.log('push state (b)', newUrl);
          history.pushState({url: newUrl}, document.title, newUrl); //used to be replaceState but caused an issue
        }
      }
    }
  }, [
    controller,
    initialUrl,
    referrer,
    serialize,
    state.parameters,
    toCommerceSearchParameters,
  ]);

  return null;
}

// TODO fix issue with hash
// TODO fix issue when
