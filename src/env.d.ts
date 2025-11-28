/// <reference path="../.astro/types.d.ts" />

declare global {
  interface SDKTypeMode {
    strict: true;
  }
}

interface ImportMetaEnv {
  readonly BASE_NAME?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_ADVISOR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
