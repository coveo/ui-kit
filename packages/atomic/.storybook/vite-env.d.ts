/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
