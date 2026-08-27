import type {ReactNode} from 'react';
import Header from '@/components/header';
import {MOCK_API_URL_GLOBAL} from '@/lib/mock-api-url';
import './globals.css';

export const metadata = {
  title: 'Coveo Headless Commerce SSR (Next.js)',
  description:
    'Commerce server-side rendering with @coveo/headless-react/ssr-commerce and the Next.js App Router',
  icons: {icon: '/favicon.svg'},
};

export default function RootLayout({children}: {children: ReactNode}) {
  const mockApiUrl = process.env.MOCK_API_URL;

  return (
    <html lang="en">
      <body>
        {/*
          Used internally in https://github.com/coveo/ui-kit for testing purposes,
          not needed in your own implementation. Hands the mock API server URL to
          the browser at runtime so the commerce engine can route client-side calls
          through it. Runs before the app bundle, which is when the engine
          configuration is evaluated.
        */}
        {mockApiUrl && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window[${JSON.stringify(MOCK_API_URL_GLOBAL)}]=${JSON.stringify(mockApiUrl)}`,
            }}
          />
        )}
        <div className="Layout">
          <Header />
          <main className="Page">{children}</main>
        </div>
      </body>
    </html>
  );
}
