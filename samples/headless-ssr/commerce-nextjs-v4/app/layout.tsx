import {cookies} from 'next/headers';
import Link from 'next/link';
import AnalyticsConsentBanner from '@/components/analytics-consent-banner';
import {ANALYTICS_CONSENT_COOKIE_NAME} from '@/lib/analytics-consent';

export const metadata = {
  title: 'Headless SSR examples',
  description: 'Examples of using @coveo/headless-react/ssr-commerce-next',
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const hasAnswered = (await cookies()).has(ANALYTICS_CONSENT_COOKIE_NAME);

  return (
    <html lang="en">
      <body>
        {!hasAnswered && <AnalyticsConsentBanner />}
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
