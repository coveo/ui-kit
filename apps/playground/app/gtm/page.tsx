"use client";

import { useEffect } from "react";
import { Button, Space, Title, Box, List, Image } from "@mantine/core";
import { ecCartAction, ecProductView } from "../sandbox/events";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

interface EventPayload {
  type: string;
  payload: unknown;
}

export default function Page() {
  const gtmId = "GTM-T5KQN3PF";

  function initializeGTM(gtmTag: string) {
    const gtmHeadScript = document.createElement("script");
    gtmHeadScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer', '${gtmTag}');
    `;
    const headFirstScript = document.head.firstChild;
    document.head.insertBefore(gtmHeadScript, headFirstScript);

    const gtmBodyScript = document.createElement("noscript");
    gtmBodyScript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmTag}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;
    const bodyFirstScript = document.body.firstChild;
    document.body.insertBefore(gtmBodyScript, bodyFirstScript);
  }

  useEffect(() => {
    initializeGTM(gtmId);
    send(ecProductView);
  }, []);

  function send(payload: EventPayload) {
    window.dataLayer.push({
      event: payload.type,
      eventProps: payload.payload,
      page: {
        url: location,
        title: Title,
      },
    });
  }

  return (
    <>
      <Title order={4}>Send events using Google Tag Manager</Title>
      <Box style={{ marginTop: "1rem" }}>
        <p>
          The page represents a basic PDP and is integrated with GTM. The GTM
          container used is:{" "}
          <a href="https://tagmanager.google.com/#/container/accounts/6216759964/containers/177262508">
            {gtmId}
          </a>
        </p>
        <List type="unordered">
          <List.Item>
            When this page is loaded, the GTM initializes Relay and sends an
            <b>ec.productView</b> event. You can resend it by reloading the
            page.
          </List.Item>
          <List.Item>
            You can additionally send the <b>ec.cartAction</b> event by clicking
            the "Add to basket" button.
          </List.Item>
        </List>
      </Box>
      <Box>
        <Space h="md" />
        <Title order={5}>A generic ski</Title>
        <Image
          src="/assets/ski.png"
          alt="A drawing of a shoe"
          style={{ width: "300px" }}
        />
        <Button onClick={() => send(ecCartAction)}>Add to basket</Button>
      </Box>
      <Box style={{ marginTop: "1rem" }}>
        <Title order={4}>Test results</Title>
        <List type="unordered">
          Check the Network tab to see if there are successful requests:
          <List.Item>GTM initialization request</List.Item>
          <List.Item>relay.min.js request</List.Item>
          <List.Item>
            request that sends the event to the Coveo backend
          </List.Item>
        </List>
      </Box>
    </>
  );
}
