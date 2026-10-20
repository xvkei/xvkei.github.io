/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_USERNAME?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}