/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端 API 基址（公开追溯接口前缀拼 /djs/public/trace/{code}） */
  readonly VITE_SERVER_BASEURL: string;
  /** 部署 base 路径（默认 '/'，子目录部署时覆盖） */
  readonly VITE_APP_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
