import {getSampleCommerceEngineConfiguration} from '@coveo/headless-react/ssr-commerce';

export const fetchToken = async (apiKeyAuthentication = false) => {
  return apiKeyAuthentication
    ? getSampleCommerceEngineConfiguration().accessToken
    : (await (await fetch('http://localhost:5173/token')).json()).token;
};
