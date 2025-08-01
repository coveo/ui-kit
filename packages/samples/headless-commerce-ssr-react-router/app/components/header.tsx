import {NavLink} from 'react-router';

export default function Header({
  totalItemsInCart,
  children,
}: {
  totalItemsInCart: number;
  children: React.ReactNode;
}) {
  const routes = [
    {to: '/search', name: 'Search'},
    {to: '/listings/surf-accessories', name: 'Surf Accessories'},
    {to: '/listings/paddleboards', name: 'Paddleboards'},
    {to: '/listings/toys', name: 'Toys'},
  ];

  return (
    <header>
      <h1>Coveo Commerce SSR + React Router</h1>
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
      <div>{children}</div>
    </header>
  );
}
