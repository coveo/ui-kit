'use client';

import {NavigateOptions} from 'next/dist/shared/lib/app-router-context';
import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect} from 'react';
import {useSearchParameters} from '../common/engine';

export default function SearchParameters() {
  const {push, replace} = useRouter();
  const searchParams = useSearchParams();
  const {state, methods} = useSearchParameters();

  // Update the search interface.
  useEffect(
    () => {
      if (!methods) {
        return;
      }
      if (searchParams === null) {
        return;
      }
      methods.synchronize(searchParams.toString());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  // Update the URL.
  useEffect(() => {
    if (state.fragment === searchParams.toString()) {
      return;
    }
    const isInitialState = methods === undefined;
    if (isInitialState) {
      replace('?' + state.fragment, {shallow: true} as NavigateOptions);
    } else {
      push('?' + state.fragment, {shallow: true} as NavigateOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fragment]);

  return <></>;
}
