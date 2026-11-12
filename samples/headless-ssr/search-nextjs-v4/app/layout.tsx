export const metadata = {
  title: 'Headless SSR search examples',
  description: 'Server-side rendered search pages built with Coveo Headless v4 and Next.js',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
