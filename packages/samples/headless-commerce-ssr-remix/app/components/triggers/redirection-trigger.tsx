import {useRedirectionTrigger} from '@/lib/commerce-engine';
import {useCallback, useEffect} from 'react';

// The redirection trigger query example in the searchuisamples org is 'redirect me'.
export default function RedirectionTrigger() {
  const {state} = useRedirectionTrigger();

  const redirect = useCallback(() => {
    if (state.redirectTo) {
      window.location.replace(state.redirectTo);
    }
  }, [state.redirectTo]);

  useEffect(() => {
    redirect();
  }, [redirect]);

  return null;
}
