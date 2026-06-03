import {getOrganizationEndpoint} from '@coveo/headless-react/ssr-commerce';
import type {LoaderFunctionArgs} from 'react-router';
import engineDefinitionOptions from '@/lib/commerce-engine-config';
import {isExpired, parseJwt} from '@/utils/access-token-utils';
import {coveo_accessToken} from '../cookies.server.js';

export const loader = async ({request}: LoaderFunctionArgs) => {
  // In an SSR scenario, we recommend storing the search token in a cookie to minimize the number of network requests.
  // This is not mandatory, but it can help improve the performance of your application.
  const accessTokenCookie = await coveo_accessToken.parse(
    request.headers.get('Cookie')
  );

  if (!isExpired(accessTokenCookie)) {
    return Response.json({token: accessTokenCookie});
  }

  const organizationEndpoint = getOrganizationEndpoint(
    engineDefinitionOptions.configuration.organizationId
  );

  // This example focuses on demonstrating the Coveo search token authentication flow in an SSR scenario. For the sake
  // of simplicity, it only generates anonymous search tokens.
  //
  // If you use search token authentication in a real-world scenario, you will likely want to generate tokens for
  // authenticated users.
  //
  // The specific implementation details for this use case will vary based on the requirements of your application and
  // the way it handles user authentication.
  const response = await fetch(`${organizationEndpoint}/rest/search/v2/token`, {
    method: 'POST',
    body: JSON.stringify({
      userIds: [
        {
          name: 'anonymous',
          type: 'User',
          provider: 'Email Security Provider',
          infos: {},
          authCookie: '',
        },
      ],
    }),
    headers: {
      Authorization: 'Bearer <API_KEY_WITH_IMPERSONATE_PRIVILEGE>',
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    return Response.json(
      {message: 'Failed to fetch access token from Coveo Search API'},
      {status: response.status}
    );
  }

  const responseData = await response.json();

  const parsedToken = parseJwt(responseData.token);

  if (!parsedToken) {
    return Response.json(
      {
        message:
          'The access token returned by the Coveo Search API could not be parsed',
      },
      {status: 500}
    );
  }

  const cookieExpiration = parsedToken.exp * 1000;

  return Response.json(responseData, {
    headers: {
      'Set-Cookie': await coveo_accessToken.serialize(responseData.token, {
        encode: (value) => atob(value).replaceAll('"', ''),
        secure: true,
        expires: new Date(cookieExpiration),
      }),
    },
  });
};
