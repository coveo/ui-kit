import {getSampleCommerceEngineConfiguration} from '@coveo/headless-react/ssr-commerce';

export const fetchToken = async (apiKeyAuthentication = false) => {
  return apiKeyAuthentication
    ? getSampleCommerceEngineConfiguration().accessToken
    : (await (await fetch('/token')).json()).token;
};
