/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly  VITE_IS_CDN: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
