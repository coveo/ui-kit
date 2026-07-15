/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly CHROMATIC_ALL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
