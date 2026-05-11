import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Playground } from "./playground";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <Playground>{children}</Playground>
        </MantineProvider>
      </body>
    </html>
  );
}
