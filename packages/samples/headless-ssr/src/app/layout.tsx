export const metadata = {
  title: 'Headless SSR example',
  description: 'Example of using @coveo/headless/ssr utils',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
