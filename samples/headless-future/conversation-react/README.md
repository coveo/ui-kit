# Headless Future Conversation Sample (React + Vite)

This sample bootstraps a React app with Vite and initializes a Headless Future Engine from environment variables.

## Setup

1. Create your local env file:

cp .env.example .env.local

2. Fill in your Coveo values in .env.local.

3. Start the sample:

pnpm dev

## Required environment variables

- VITE_COVEO_ORGANIZATION_ID
- VITE_COVEO_ACCESS_TOKEN
- VITE_COVEO_TRACKING_ID
- VITE_COVEO_LANGUAGE
- VITE_COVEO_COUNTRY
- VITE_COVEO_CURRENCY

## Scripts

- pnpm dev
- pnpm build
- pnpm preview
- pnpm test
- pnpm e2e
- pnpm e2e:watch
