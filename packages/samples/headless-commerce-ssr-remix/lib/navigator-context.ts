import {coveo_visitorId} from '@/app/cookies.server';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {randomUUID} from 'crypto';

export const getNavigatorContext = async (
  request: Request
): Promise<NavigatorContext> => {
  const clientIdCookie = await coveo_visitorId.parse(
    request.headers.get('Cookie')
  );
  const clientId = clientIdCookie ?? randomUUID();
  return {
    clientId,
    referrer: request.headers.get('Referer') ?? '',
    userAgent: request.headers.get('User-Agent') ?? '',
    location: request.url,
  };
};
