'use client';

import {useRouter} from 'next/router';
import {useCallback, useEffect, useMemo, useReducer} from 'react';

function getUrl() {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URL(document.location.href);
}

/**
 * Custom hook for managing browser history and URL updates.
 * To be used with App router. Use the {@link usePagesHistoryRouter} instead if your application is using The Next.js Pages Router paradigm.
 * @returns An object containing the current URL, replace function, and push function.
 */
export function useAppHistoryRouter() {
  const [url, updateUrl] = useReducer(() => getUrl(), getUrl());
  useEffect(() => {
    window.addEventListener('popstate', updateUrl);
    return () => window.removeEventListener('popstate', updateUrl);
  }, []);
  const replace = useCallback(
    (href: string) => window.history.replaceState(null, document.title, href),
    []
  );
  const push = useCallback(
    (href: string) => window.history.pushState(null, document.title, href),
    []
  );
  return useMemo(() => ({url, replace, push}), [url, replace, push]);
}

/**
 * Custom hook for managing browser history and URL updates.
 * To be used with Pages router. Use the {@link useAppHistoryRouter} instead if your application is using The Next.js App Router paradigm.
 * @returns An object containing the current URL, replace function, and push function.
 */
export function usePagesHistoryRouter() {
  const router = useRouter();
  const [url, updateUrl] = useReducer(() => getUrl(), getUrl());
  useEffect(() => {
    window.addEventListener('popstate', updateUrl);
    return () => window.removeEventListener('popstate', updateUrl);
  }, []);
  const replace = useCallback(
    (href: string) => router.replace(href, undefined, {shallow: true}),
    [router]
  );
  const push = useCallback(
    (href: string) => router.push(href, undefined, {shallow: true}),
    [router]
  );
  return useMemo(() => ({url, replace, push}), [url, replace, push]);
}
