import {coveo_visitorId} from '@/app/cookies.server';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';

export const getNavigatorContext = async (
  request: Request
): Promise<NavigatorContext> => {
  const clientId = await getClientId(request);

  return {
    clientId,
    referrer: request.headers.get('Referer') ?? '',
    userAgent: request.headers.get('User-Agent') ?? '',
    location: request.url,
    capture: clientId !== '',
  };
};

const getClientId = async (request: Request): Promise<string> => {
  if (!(await canTrackUser(request))) {
    return '';
  }

  return (await coveo_visitorId.parse(request.headers.get('Cookie'))) ?? '';
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const canTrackUser = async (request: Request): Promise<boolean> => {
  // Verify whether the user has indicated they do not wish to be tracked (e.g., by rejecting the category of cookies
  // the `coveo_visitorId` is categorized in).

  return true;
};
