import {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Coveo Headless NextJS Demo',
    default: 'Coveo Headless NextJS Demo',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
