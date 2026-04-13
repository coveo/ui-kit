interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_AGENT_MODE?: 'local' | 'coveo-dev';
  readonly VITE_AGENT_URL?: string;
  readonly VITE_ORG_ID?: string;
  readonly VITE_ACCESS_TOKEN?: string;
  readonly VITE_PLATFORM_URL?: string;
  readonly VITE_TRACKING_ID?: string;
  readonly VITE_LANGUAGE?: string;
  readonly VITE_COUNTRY?: string;
  readonly VITE_CURRENCY?: string;
  readonly VITE_TIMEZONE?: string;
  readonly VITE_CLIENT_ID?: string;
  readonly VITE_CONTEXT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
