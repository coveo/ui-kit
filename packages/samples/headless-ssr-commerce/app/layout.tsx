import NavBar from './_components/nav-bar';
import {standaloneEngineDefinition} from './_lib/commerce-engine';

export const metadata = {
  title: 'Headless SSR examples',
  description:
    'Examples of using framework agnostic @coveo/headless/ssr-commerce',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staticState = await standaloneEngineDefinition.fetchStaticState();

  return (
    <html lang="en">
      <body>
        <h1>Coveo Headless Commerce Next.js</h1>
        <NavBar staticState={staticState} />
        {children}
      </body>
    </html>
  );
}
