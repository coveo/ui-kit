'use client';

import {useCallback, useEffect, useMemo, useReducer} from 'react';

function getUrl() {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URL(document.location.href);
}

export function useHistoryRouter() {
  const [url, updateUrl] = useReducer(() => getUrl(), getUrl());
  useEffect(() => {
    window.addEventListener('popstate', updateUrl);
    return () => window.removeEventListener('popstate', updateUrl);
  }, []);
  const replace = useCallback(
    (href: string) => history.replaceState(null, document.title, href),
    []
  );
  const push = useCallback(
    (href: string) => history.pushState(null, document.title, href),
    []
  );
  return useMemo(() => ({url, replace, push}), [url, replace, push]);
}
