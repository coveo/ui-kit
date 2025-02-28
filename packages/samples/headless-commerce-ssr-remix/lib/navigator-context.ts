import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {getAnalyticsContext, SetCookieHeader} from './client-id.server';

export const getNavigatorContext = async (
  request: Request
): Promise<{
  navigatorContext: NavigatorContext;
  setCookieHeader: SetCookieHeader;
}> => {
  const {clientId, capture, setCookieHeader} =
    await getAnalyticsContext(request);

  return {
    navigatorContext: {
      clientId,
      referrer: request.headers.get('Referer') ?? '',
      userAgent: request.headers.get('User-Agent') ?? '',
      location: request.url,
      capture: capture && clientId !== '',
    },
    setCookieHeader,
  };
};
