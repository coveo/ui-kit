/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly  VITE_IS_CDN: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}