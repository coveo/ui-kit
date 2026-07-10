import type {ReactNode} from 'react';
import Header from '@/components/header';
import './globals.css';

export const metadata = {
  title: 'Coveo Headless Commerce SSR (Next.js)',
  description:
    'Commerce server-side rendering with @coveo/headless-react/ssr-commerce and the Next.js App Router',
  icons: {icon: '/favicon.svg'},
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>
        <div className="Layout">
          <Header />
          <main className="Page">{children}</main>
        </div>
      </body>
    </html>
  );
}
