# Atomic

This project was generated with [@coveo/create-atomic](https://npmjs.com/package/@coveo/create-atomic).

## Setup environment

The root folder should contain a `.env` file. Replace all placeholder variables (`<...>`) by the proper information for your organization. Consult the example configuration file named `.env.example` as needed. For more involved configurations, you can modify the request parameters used in the `lambda/functions/token/token.ts` file.

### CDN

By default, the project installs the latest major Atomic version, v3, to allow types and more advanced customizations. [Coveo Headless](https://www.npmjs.com/package/@coveo/headless) is also installed with Atomic and accessible at `@coveo/headless`.

When running, the app will use the bundled Atomic, but using the CDN is a viable option, just make sure you're using the same minor version of Atomic as the one bundled. It could cause issues with your custom components if the minor version differs.
E.g., if you have @coveo/atomic@2.0.0 installed, use the following CDN link at path [https://static.cloud.coveo.com/atomic/v3.0/](https://static.cloud.coveo.com/atomic/v2.0/atomic.esm.js).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.

### `npm run build`

Builds the [Stencil](https://stenciljs.com/docs/cli) project for production.

### `npm run deploy`

Builds the app for production and manually deploys the search page using the [Coveo CLI deploy command](https://docs.coveo.com/en/cli/#coveo-uideploy).

## Learn More

To learn more about Atomic, check out the [Atomic documentation](https://docs.coveo.com/en/atomic/latest/).
