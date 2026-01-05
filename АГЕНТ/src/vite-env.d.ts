/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OPENROUTER_API_KEY: string;
    readonly VITE_OPENROUTER_PROXY_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
