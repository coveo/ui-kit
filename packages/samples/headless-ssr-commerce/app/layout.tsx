import Link from 'next/link';

export const metadata = {
  title: 'Headless SSR examples',
  description: 'Examples of using framework @coveo/headless-react/ssr-commerce',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <h1>Coveo Headless Commerce Next.js</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <Link href={'/search'}>Search Page</Link>
          <Link href={'/surf-accessories'}>Listing Page Surf</Link>
          <Link href={'/accessories-towels'}>Listing Page Towels</Link>
          <Link href={'/clothing-pants'}>Listing Page Pants</Link>
          <Link href={'/cart'}>Cart Page</Link>
        </div>
        {children}
      </body>
    </html>
  );
}
