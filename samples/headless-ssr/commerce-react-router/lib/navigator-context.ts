import type {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {getAnalyticsContext} from './client-id.server.js';

export const getNavigatorContext = async (
  request: Request,
  url: URL
): Promise<NavigatorContext> => {
  const {clientId, capture} = await getAnalyticsContext(request);

  return {
    clientId,
    referrer: request.headers.get('Referer') ?? '',
    userAgent: request.headers.get('User-Agent') ?? '',
    location: url.href,
    capture: capture && clientId !== '',
    forwardedFor: request.headers.get('x-forwarded-for') ?? '',
  };
};
