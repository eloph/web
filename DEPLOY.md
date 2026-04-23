# 旅行心情日记 - 部署指南

本指南将帮助你将旅行心情日记项目部署到 Cloudflare 平台。

## 前提条件

- Cloudflare 账户
- Node.js 16+ 环境
- npm 或 pnpm 包管理器
- Wrangler CLI（Cloudflare Workers 命令行工具）

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或使用 pnpm
pnpm add -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置项目

编辑 `wrangler.toml` 文件，填写你的 Cloudflare 账户信息：

```toml
name = "travel-diary"
type = "workers-script"

account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
route = "travel-diary.YOUR_SUBDOMAIN.workers.dev"

[[d1_databases]]
binding = "DB"
database_name = "travel-diary-db"
database_id = "YOUR_D1_DATABASE_ID"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "travel-diary-photos"

[vars]
JWT_SECRET = "YOUR_JWT_SECRET_KEY"
R2_PUBLIC_URL = "https://YOUR_R2_PUBLIC_URL"
CLOUDFLARE_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
```

### 4. 创建 D1 数据库

```bash
wrangler d1 create travel-diary-db
```

### 5. 初始化数据库

```bash
wrangler d1 execute travel-diary-db --file=database.sql
```

### 6. 创建 R2 存储桶

```bash
wrangler r2 bucket create travel-diary-photos
```

### 7. 构建前端项目

```bash
npm run build
# 或使用 pnpm
pnpm run build
```

### 8. 部署到 Cloudflare

```bash
wrangler deploy
```

## 配置说明

### 环境变量

- `JWT_SECRET`：JWT 签名密钥，用于生成和验证用户令牌
- `R2_PUBLIC_URL`：R2 存储桶的公共访问 URL
- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账户 ID

### R2 存储桶配置

1. 在 Cloudflare 控制台中，找到你的 R2 存储桶
2. 启用公共访问
3. 配置 CORS 规则，允许前端应用访问
4. 启用 Image Resizing 功能，用于生成缩略图

### D1 数据库配置

- 数据库名称：`travel-diary-db`
- 数据库绑定：`DB`

## 本地开发

### 启动前端开发服务器

```bash
npm run dev
# 或使用 pnpm
pnpm run dev
```

### 启动 Worker 开发服务器

```bash
cd src/worker
npm run dev
# 或使用 pnpm
pnpm run dev
```

## 项目结构

- `src/`：前端代码
  - `components/`：React 组件
  - `pages/`：页面组件
  - `store/`：状态管理
  - `worker/`：Cloudflare Worker 代码
- `public/`：静态资源
- `database.sql`：数据库初始化脚本
- `wrangler.toml`：Cloudflare Workers 配置

## 技术栈

- 前端：React + TypeScript + Tailwind CSS + Vite + PWA
- 后端：Cloudflare Workers
- 数据库：Cloudflare D1
- 存储：Cloudflare R2
- 地图：Leaflet + OpenStreetMap
- 认证：JWT

## 注意事项

- 确保所有环境变量都已正确配置
- 确保 R2 存储桶已正确设置公共访问和 CORS 规则
- 确保 D1 数据库已正确初始化
- 项目默认使用 Cloudflare 免费计划，确保不超出免费额度

## 故障排查

### 常见问题

1. **部署失败**：检查 `wrangler.toml` 配置是否正确
2. **数据库连接失败**：检查 D1 数据库 ID 是否正确
3. **照片上传失败**：检查 R2 存储桶配置是否正确，确保公共访问已启用
4. **地图加载失败**：检查 Leaflet 依赖是否正确安装

### 日志查看

```bash
wrangler tail
```

## 联系支持

如果遇到部署问题，请参考 Cloudflare 文档或联系 Cloudflare 支持。
