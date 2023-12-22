"use client";

import { Button, Code, Space, Title } from "@mantine/core";
import { dedent } from "ts-dedent";
import { relay } from "../relay";

export default function Page() {
  const [major] = relay.version.split(".");

  const snippet = dedent`
    <html>
      <head>
        <script type="module">
          import {createRelay} from "${process.env["NEXT_PUBLIC_CDN_HOST"]}/relay/v${major}/relay.min.js";
          
          window.relay = createRelay({
            url: "${process.env["NEXT_PUBLIC_URL"]}",
            token: "${process.env["NEXT_PUBLIC_TOKEN"]}",
            trackingId: "${process.env["NEXT_PUBLIC_TRACKING_ID"]}",
          })
        </script>
      </head>
    </html>
  `;

  function run() {
    const iframe = createInvisibleIframe();

    document.body.appendChild(iframe);

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(snippet);
    iframe.contentWindow.document.close();
  }

  function createInvisibleIframe() {
    const iframe = document.createElement("iframe");
    iframe.style.display = "block";
    iframe.style.border = "0";
    iframe.width = "0";
    iframe.height = "0";
    return iframe;
  }

  return (
    <>
      <Title order={4}>Initialize relay via CDN</Title>
      <Space h="md" />
      <Code block>{snippet}</Code>
      <Space h="md" />
      <Button onClick={() => run()}>Run</Button>
    </>
  );
}
