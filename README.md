# trace-h5 — 东角山追溯码扫码结果页（独立轻量 H5）

C 端顾客扫码落地页，从 plus-ui(admin) 拆出的独立静态前端工程。独立域名 `trace.dongjiaoshan.com`，
不加载整个 admin SPA，加载快。

- 技术栈：Vite + Vue3 + TS + vue-router（history 模式）+ axios。**不引 Element Plus / Pinia / i18n**（单语中文 C 端页，保持轻量）。
- 路由：`/trace/:type/:code`（`type` = `pork` | `veg` | `grow` | `cert` | `plot-records`）。
- 数据：`GET {VITE_SERVER_BASEURL}/djs/public/trace/{code}`（后端 `@SaIgnore` 免登，Redis ~10min 缓存）。
- 包管理：pnpm，Node 20。

## 本地开发

```bash
pnpm install
pnpm dev                  # vite serve --mode development，默认 :5180，连本机后端 :8080
```

## 构建

```bash
pnpm build:dev            # mode=development
pnpm build:staging        # mode=staging  → CI deploy-staging.yml 使用
pnpm build:prod           # mode=production → CI deploy-prod.yml 使用
```

产物输出 `dist/`。

## 环境变量

| 文件 | VITE_SERVER_BASEURL | 用途 |
|---|---|---|
| `.env.development` | `http://127.0.0.1:8080` | 本地 `pnpm dev` |
| `.env.staging` | `https://api.dongjiaoshan.com` | staging 构建 |
| `.env.production` | `https://api.dongjiaoshan.com` | 生产构建 |

`VITE_APP_BASE` 默认 `/`，子目录部署时覆盖（同时同步 Nginx location）。

## 部署（CI）

- `.github/workflows/deploy-staging.yml`：push `staging` 分支触发 → `pnpm build:staging` → SSH 清空目标目录 → SCP 上传 `dist/*`。目标 `/www/wwwroot/trace.dongjiaoshan.com/`。
- `.github/workflows/deploy-prod.yml`：push `main` 分支触发 → `pnpm build:prod` → 同上。
- 复用 plus-ui 同名 secrets：`SSH_HOST_STAGING` / `SSH_HOST_PROD` / `SSH_PRIVATE_KEY_STAGING` / `SSH_PRIVATE_KEY_PROD`。

> `pnpm install --frozen-lockfile` 需要提交 `pnpm-lock.yaml`（本地首次 `pnpm install` 后 commit）。

## Nginx（宝塔站点配置，history 模式必需）

history 路由刷新 / 直接访问深链需回退到 `index.html`：

```nginx
server {
    listen 443 ssl;
    server_name trace.dongjiaoshan.com;
    root /www/wwwroot/trace.dongjiaoshan.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存（hash 文件名，可长缓存）
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

> 后端公开接口跨域已由 `ruoyi-common-web` 全局 CorsFilter 放行（`allowedOriginPattern("*")` on `/**`），独立域名跨源调用无需额外配置。
