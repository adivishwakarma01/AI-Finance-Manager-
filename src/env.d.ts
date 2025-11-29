/// <reference path="../.astro/types.d.ts" />
/// <reference types="vite/client" />

declare global {
  interface SDKTypeMode {
    strict: true;
  }
}

interface ImportMetaEnv {
  readonly BASE_NAME?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_ADVISOR_URL?: string;
  readonly VITE_API_PREFIX?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
