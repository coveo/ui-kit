---
title: Introduction
category: Server-side rendering
group: Usage
slug: usage/server-side-rendering/index
---
# Server-side rendering
This approach is particularly useful when developing with the [Coveo Headless](https://docs.coveo.com/en/lcdf0493/) framework because it enables faster initial loading times and better SEO.
By rendering the HTML on the server, the client can receive a fully formed page which is ready to be displayed as soon as it’s received.

The [`@coveo/headless-react`](https://www.npmjs.com/package/@coveo/headless-react) package includes utilities for [React](https://react.dev/) which are compatible with [Next.js](https://nextjs.org/) in the `@coveo/headless-react/ssr` sub-package.
These utilities enable SSR with the [Headless](https://docs.coveo.com/en/lcdf0493/) framework.

<dl><dt><strong>📌 Note</strong></dt><dd>

For a Coveo Commerce implementation, see [Headless for Commerce: Server-side rendering](https://docs.coveo.com/en/obif0156/).
</dd></dl>

## Prerequisites

* You should know how to use [Headless](https://docs.coveo.com/en/lcdf0493/) engines and controllers.
You can refer to the [Headless](https://docs.coveo.com/en/lcdf0493/) [usage documentation](https://docs.coveo.com/en/headless/latest/usage/) for more information.
* You should also be familiar with React and Next.js.
Although you can read this documentation without an understanding of either framework, details which are specific to them won’t be explained.

## Overview

The goal is to achieve a general structure for SSR which involves executing a search and rendering the page on the server.
Then, on the client side, the page is [hydrated](https://en.wikipedia.org/wiki/Hydration_(web_development)), which means attaching interactivity and updating the page.

The following sequence diagram illustrates the general process:

![General server-side rendering sequence diagram](https://docs.coveo.com/en/assets/images/headless/general-ssr-sequence.png)

## Server-side rendering and hydration with Headless

The utilities for SSR use three core concepts:

1. **Static state**

   This is the initial state of the application, which is generated on the server and sent to the client.
   This initial state typically contains the data that’s required for the initial render of the app without interactivity, such as the initial state of each [Headless controller](https://docs.coveo.com/en/headless/latest/usage#use-headless-controllers).

   The static state is used to pre-populate (hydrate) the components with data.
   This lets the app load with pre-rendered content on the first request, rather than waiting for the client-side rendering to fetch and display the data.
2. **Hydrated state**

   This is the state after it’s sent from the server to the client and then hydrated on the client side.
   It contains [Headless controllers](https://docs.coveo.com/en/headless/latest/usage#use-headless-controllers) which you can use to interact with the state of the [Headless](https://docs.coveo.com/en/lcdf0493/) engine.
   It also includes the [Headless](https://docs.coveo.com/en/lcdf0493/) engine.

   Synchronizing the state ensures that the behavior of the client-side application is consistent with what was initially rendered on the server.
3. **Engine definition**

   The engine definition specifies the configuration of the search engine.
   This includes the list of controllers and their settings that should be included in the application.

   It returns methods to fetch the static state of the engine and to generate the hydrated state from a given static state.
   The engine definition may also provide some additional utilities or helper functions that can be used in the application.

The following updated sequence diagram illustrates how SSR and hydration are implemented with [Headless](https://docs.coveo.com/en/lcdf0493/):

![Updated server-side rendering sequence diagram](https://docs.coveo.com/en/assets/images/headless/updated-ssr-sequence.png)

## What's next?

To implement server-side rendering in your [Headless](https://docs.coveo.com/en/lcdf0493/) [search interface](https://docs.coveo.com/en/2741/), refer to the [SSR usage documentation](https://docs.coveo.com/en/headless/latest/usage/headless-server-side-rendering/headless-implement-ssr/).