import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

// 独立追溯结果页：极简 Vite + Vue3 单页应用，部署到 trace.dongjiaoshan.com。
// base 可经 VITE_APP_BASE 覆盖（默认 '/'，配合 Nginx try_files 走 history 模式）。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: env.VITE_APP_BASE || '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: true,
      port: 5180,
      // 本地 E2E 可显式指定独立后端，避免误连默认开发端口。
      proxy: env.E2E_PROXY_TARGET
        ? { '/dev-api': { target: env.E2E_PROXY_TARGET, changeOrigin: true, rewrite: (path) => path.replace(/^\/dev-api/, '') } }
        : undefined
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // 单页结果页体量小，无需手动分包；保留 vendor 默认分割即可。
      chunkSizeWarningLimit: 800
    }
  };
});
