import engineDefinitionOptions from '@/lib/commerce-engine-config';
import {isExpired, parseJwt} from '@/lib/jwt-utils';
import {getOrganizationEndpoint} from '@coveo/headless-react/ssr-commerce';
import {LoaderFunctionArgs} from '@remix-run/node';
import {coveo_accessToken} from '../cookies.server';

export const loader = async ({request}: LoaderFunctionArgs) => {
  const accessTokenCookie = await coveo_accessToken.parse(
    request.headers.get('Cookie')
  );

  if (!isExpired(accessTokenCookie)) {
    return Response.json({token: accessTokenCookie});
  }

  const endpoint = getOrganizationEndpoint(
    engineDefinitionOptions.configuration.organizationId
  );

  const res = await fetch(`${endpoint}/rest/search/v2/token`, {
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

  if (res.status !== 200) {
    return Response.json(
      {message: 'Failed to fetch access token from Coveo Search API'},
      {status: res.status}
    );
  }

  const responseData = await res.json();

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
