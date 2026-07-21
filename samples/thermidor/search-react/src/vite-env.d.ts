/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COVEO_ORGANIZATION_ID: string;
  readonly VITE_COVEO_ACCESS_TOKEN: string;
  readonly VITE_COVEO_TRACKING_ID: string;
  readonly VITE_COVEO_LANGUAGE: string;
  readonly VITE_COVEO_COUNTRY: string;
  readonly VITE_COVEO_CURRENCY: string;
  readonly VITE_COVEO_PLATFORM_ENVIRONMENT?: string;
  readonly VITE_COVEO_ENDPOINT?: string;
  readonly VITE_COVEO_USE_VITE_PROXY?: string;
}
