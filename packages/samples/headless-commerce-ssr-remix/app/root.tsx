import externalCartService from '@/external-services/external-cart-service';
import {canTrackUser} from '@/lib/navigator-context';
import {LoaderFunctionArgs, MetaFunction} from '@remix-run/node';
import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import {randomUUID} from 'crypto';
import {coveo_visitorId} from './cookies.server';

export const meta: MetaFunction = () => {
  return [
    {title: 'Coveo Commerce SSR + Remix'},
    {name: 'description', content: 'Coveo Headless Commerce React SSR + Remix'},
  ];
};

export const loader = async ({request}: LoaderFunctionArgs) => {
  const totalItemsInCart = await externalCartService.getTotalCount();

  const headers = new Headers();

  if (await canTrackUser(request)) {
    const cookie = await coveo_visitorId.parse(request.headers.get('Cookie'));

    headers.append(
      'Set-Cookie',
      await coveo_visitorId.serialize(cookie ?? randomUUID(), {
        encode: (value) => atob(value).replaceAll('"', ''),
        maxAge: 60 * 24 * 365,
      })
    );
  }

  return Response.json({totalItemsInCart}, {headers});
};

export function Layout({children}: {children: React.ReactNode}) {
  const {totalItemsInCart} = useLoaderData<typeof loader>();
  const routes = [
    {to: '/search', name: 'Search'},
    {to: '/listings/surf-accessories', name: 'Surf Accessories'},
    {to: '/listings/paddleboards', name: 'Paddleboards'},
    {to: '/listings/toys', name: 'Toys'},
  ];

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Coveo Commerce SSR + Remix</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          {routes.map((route) => (
            // Avoid prefetching Coveo-powered pages to prevent unnecessary queries and disjointed Coveo analytics data.
            <NavLink key={route.to} to={route.to} prefetch="none">
              {route.name}
            </NavLink>
          ))}
          <NavLink to="/cart" prefetch="none">
            Cart{totalItemsInCart ? ` (${totalItemsInCart})` : ''}
          </NavLink>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
