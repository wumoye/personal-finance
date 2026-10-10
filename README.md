# Personal Finance Manager

DEV-001 项目基础初始化。仅提供最小首页和开发基础设施，业务功能按后续 DEV Task 实现。

## 本地运行

需要 Node.js 22.12+（推荐 Node.js 24 LTS）和 npm。

```bash
npm ci
npm run dev
```

访问 http://localhost:3000。首页、测试、lint 和 build 不需要 Supabase 密钥或数据库连接。

```bash
npm run lint
npm run test
npm run build
npm run start
```

`npm run lint` 同时检查 ESLint 和 Prettier；`npm run format` 格式化代码；`npm run typecheck` 检查 TypeScript。

## 环境变量与数据库

需要连接开发数据库时，复制 `.env.example` 为 `.env.local`，填入自己的 Supabase 设置。模板中的值均为占位符，不是真实凭证。Next.js 和 Prisma CLI 都读取 `.env.local`，Prisma CLI 也读取 `.env`；外部环境变量优先。

- `DATABASE_URL`：服务端 Prisma 运行时连接，可使用 Supabase transaction pooler（6543）。
- `DIRECT_URL`：Prisma CLI 的 session pooler（5432）或 direct connection，避免迁移使用 transaction pooler。
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`：公开项目 URL 与 publishable key。数据库密码及 service_role/secret key 不得使用 `NEXT_PUBLIC_` 前缀。

`npm run db:generate` 仅生成 Prisma Client，不连接数据库。DEV-001 无业务模型或数据库调用，因此安装和构建不自动生成客户端。后续模型任务增加 Repository 与服务端客户端封装时，再接入生成步骤。Prisma CLI 首次执行需要访问官方 `binaries.prisma.sh` 下载 Schema Engine；受限环境需允许该域名。`npm run db:validate` 验证基础 Schema，需提供 `DIRECT_URL`（可用模板占位 URL 做离线验证）。Schema 没有业务模型，DEV-001 没有 migration；不要运行生产 migration。Supabase 基础工厂不管理登录、Cookie 或 Session；这些属于 DEV-002。

## 目录与架构

```text
src/app/          App Router 布局与最小首页
src/components/   MUI / App Router Providers
src/modules/      后续业务模块（DEV-001 留空）
src/lib/          Supabase 基础配置
src/types/        共享类型（DEV-001 留空）
src/generated/    自动生成的 Prisma Client（不提交）
prisma/           PostgreSQL 基础 Schema
tests/            首页、ECharts 集成与环境配置测试
```

后续调用关系：UI → Server Action / Route Handler → Service → Repository → Prisma → PostgreSQL。后续 Prisma 客户端封装必须限制在服务端；UI 不得直接调用 Prisma；用户隔离、Decimal 和业务测试须遵循 `AGENTS.md` 与 `docs/`。

MUI 已接入 App Router SSR 样式缓存。ECharts 已安装并通过 SVG 渲染集成测试，不在首页增加 Dashboard 或示例财务数据。
