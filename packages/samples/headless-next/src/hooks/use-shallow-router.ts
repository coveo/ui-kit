'use client';

import {useCallback, useEffect, useState} from 'react';
import {AnySearchParams} from '@/utils/types';

export interface ShallowRouter {
  replace(href: string): void;
  push(href: string): void;
  pathname: string;
  searchParams: AnySearchParams;
}

export interface ShallowRouterProps {
  initialPathname: string;
  initialSearchParams: AnySearchParams;
}

/**
 * Simulates Next.js' `useRouter` with the `shallow: true` option.
 */
export function useShallowRouter({
  initialPathname,
  initialSearchParams,
}: ShallowRouterProps): ShallowRouter {
  const [location, setLocation] = useState({
    pathname: initialPathname,
    searchParams: initialSearchParams,
  });

  const setHref = useCallback((href: string) => {
    const {pathname, searchParams} = new URL(href, document.location.href);
    setLocation({pathname, searchParams});
  }, []);

  useEffect(() => {
    const listener = () => {
      const {pathname, searchParams} = new URL(document.location.href);
      setLocation({pathname, searchParams});
    };
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);

  return {
    replace(href: string) {
      history.replaceState(null, document.title, href);
      setHref(href);
    },
    push(href: string) {
      history.pushState(null, document.title, href);
      setHref(href);
    },
    pathname: location.pathname,
    searchParams: location.searchParams,
  };
}
