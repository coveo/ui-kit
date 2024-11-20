'use client';

import {useParameterManager} from '@/lib/commerce-engine';
import {difference, symmetricDifference} from '@/utils/set';
import {buildSSRCommerceSearchParameterSerializer} from '@coveo/headless-react/ssr-commerce';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useCallback, useEffect, useRef} from 'react';

export default function ParameterManager({initialUrl}: {initialUrl: string}) {
  const {state, controller} = useParameterManager();

  const searchParams = useSearchParams();
  const pathName = usePathname();

  // const isHistoryNavigation = useRef(false);
  const isSynchronizing = useRef(false);
  const previousSearchParams = useRef('');
  const taskQueue = useRef(Promise.resolve());
  const didInit = useRef(false);

  const counter = useRef(0);

  const {serialize, toCommerceSearchParameters} = useCallback(() => {
    return buildSSRCommerceSearchParameterSerializer();
  }, [])();

  const router = useRouter();

  // useEffect(() => {
  //   const popstateHandler = () => {
  //     console.log('popstate');
  //     console.log('pathName', pathName);
  //     console.log('location.pathname', location.pathname);
  //     console.log('lastPathName.current', lastPathName.current);
  //     if (location.pathname !== pathName) {
  //       console.log('refresh');
  //       lastPathName.current = location.pathname;
  //       router.replace(lastPathName.current);
  //       isHistoryNavigation.current = true;
  //     }
  //   };

  //   console.log('add popstate');
  //   window.addEventListener('popstate', popstateHandler);
  //   return () => {
  //     console.log('remove popstate');
  //     window.removeEventListener('popstate', popstateHandler);
  //   };
  // }, []);

  useEffect(() => {
    const copiedCounter = counter.current++;
    taskQueue.current.then(() => {
      console.log(copiedCounter);

      const locationCommerceParams = toCommerceSearchParameters(searchParams);

      const currentCommerceParamsInUrl = new Set(
        new URL(
          serialize(
            locationCommerceParams,
            new URL(`${location.origin}${location.pathname}`)
          )
        ).search.split('&')
      );

      const currentCommerceParamsInState = new Set(
        new URL(
          serialize(
            state.parameters,
            new URL(`${location.origin}${location.pathname}`)
          )
        ).search.split('&')
      );

      console.log('currentCommerceParamsInUrl', currentCommerceParamsInUrl);
      console.log('currentCommerceParamsInState', currentCommerceParamsInState);

      console.log('searchParams', searchParams.toString());
      console.log('location.search', location.search);
      if (
        symmetricDifference(
          currentCommerceParamsInState,
          currentCommerceParamsInUrl
        ).size > 0 &&
        didInit.current
      ) {
        console.log('synchronize');
        controller?.synchronize(toCommerceSearchParameters(searchParams));
      }
      isSynchronizing.current = true;
    });
  }, [controller, searchParams, serialize, toCommerceSearchParameters]);

  const resetUrl = useRef(serialize(state.parameters, new URL(initialUrl)));

  const initializeSearchParams = () => {
    if (typeof window !== 'undefined') {
      const locationCommerceParams = toCommerceSearchParameters(searchParams);

      // TODO: create utils to create sets from search params

      const originalCommerceParams = new Set(
        new URL(
          serialize(state.parameters, new URL(initialUrl.split('?')[0]))
        ).search.split('&')
      );

      const currentCommerceParams = new Set(
        new URL(
          serialize(
            locationCommerceParams,
            new URL(`${location.origin}${location.pathname}`)
          )
        ).search.split('&')
      );

      if (difference(originalCommerceParams, currentCommerceParams).size > 0) {
        const replaceUrl = `${resetUrl.current}${location.hash}`;
        previousSearchParams.current = new URL(replaceUrl).search.split('?')[1];
        console.log('replace state');

        router.replace(replaceUrl);
      }
    }
  };

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      const copiedCounter = counter.current++;
      taskQueue.current.then(() => {
        console.log(copiedCounter);
        initializeSearchParams();
      });
    }
  }, []);

  const currentSearchParams = useRef('');

  useEffect(() => {
    console.log('document.referrer', document.referrer);
    const copiedCounter = counter.current++;
    taskQueue.current.then(() => {
      console.log(copiedCounter);
      currentSearchParams.current = searchParams.toString();
      const currentUrl = new URL(pathName, initialUrl);
      currentUrl.hash = location.hash;
      currentUrl.search = searchParams.toString();

      const newUrl = serialize(state.parameters, currentUrl);

      if (
        (currentSearchParams.current === searchParams.toString() &&
          previousSearchParams.current ===
            new URL(newUrl).search.split('?')[1]) ||
        isSynchronizing.current
      ) {
        isSynchronizing.current = false;
        return;
      }

      if (newUrl !== currentUrl.toString()) {
        previousSearchParams.current = new URL(newUrl).search.split('?')[1];
        console.log('push state');
        history.pushState(window.history.state, document.title, newUrl);
      }
    });
  }, [initialUrl, pathName, searchParams, serialize, state.parameters]);

  return null;
}
