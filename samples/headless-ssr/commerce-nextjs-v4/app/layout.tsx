import Link from 'next/link';

export const metadata = {
  title: 'Headless SSR examples',
  description: 'Examples of using @coveo/headless-react/ssr-commerce',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <h1>Coveo Headless Commerce Next.js</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <Link href={'/search'}>Search</Link>
          <Link href={'/surf-accessories'}>Surf Accessories</Link>
          <Link href={'/paddleboards'}>Paddleboards</Link>
          <Link href={'/toys'}>Toys</Link>
          <Link href={'/cart'}>Cart</Link>
        </div>
        {children}
      </body>
    </html>
  );
}
