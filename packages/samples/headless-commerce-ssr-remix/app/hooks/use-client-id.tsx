import {
  isUserTrackingAllowedByClient,
  retrieveOrGenerateClientId,
} from '@/lib/client-id.client';
import {removeCookie, setCookie} from '@/utils/cookie-utils.client';
import {useEffect} from 'react';

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
