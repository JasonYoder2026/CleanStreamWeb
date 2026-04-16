declare module '*.css';
declare module "*.svg";

/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_SUPABASE_SERVICE_ROLE_KEY: any;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_ANON_KEY: string;
  readonly VITE_GEOCODEMAPS_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}