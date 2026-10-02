/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module '*.css' {
  const content: { [key: string]: string };
  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    ANTHROPIC_API_KEY: string;
    NEXT_PUBLIC_DEMO_MODE?: string;
  }
}
