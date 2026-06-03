import {useEffect} from 'react';
import {
  isUserTrackingAllowedByClient,
  retrieveOrGenerateClientId,
} from '@/lib/client-id.client';
import {removeCookie, setCookie} from '@/utils/cookie-utils.client';

/**
 * This hook sets the `coveo_visitorId` and the `coveo_capture` cookies if the client allows Coveo requests to capture
 * analytics data, or removes the `coveo_capture` cookie otherwise.
 *
 * The `coveo_capture` cookie would be considered strictly necessary in this implementation, as it is a persistent way
 * to communicate to the server whether the client allows Coveo requests to capture analytics data, thus enabling the
 * server to honor the user's privacy settings when performing Coveo requests (for example, to fetch the static state).
 */

const useClientId = () =>
  useEffect(() => {
    if (!isUserTrackingAllowedByClient()) {
      removeCookie('coveo_capture');
      return;
    }
    setCookie('coveo_capture', '1');
    setCookie('coveo_visitorId', retrieveOrGenerateClientId());
  }, []);

export default useClientId;
