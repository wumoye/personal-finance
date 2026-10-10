# Personal Finance Manager

DEV-001 项目基础初始化与 DEV-002 Authentication。提供最小首页、邮箱密码登录和受保护的认证状态页；财务业务功能按后续 DEV Task 实现。

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

`npm run db:generate` 仅生成 Prisma Client，不连接数据库。DEV-001 无业务模型或数据库调用，因此安装和构建不自动生成客户端。后续模型任务增加 Repository 与服务端客户端封装时，再接入生成步骤。Prisma CLI 首次执行需要访问官方 `binaries.prisma.sh` 下载 Schema Engine；受限环境需允许该域名。`npm run db:validate` 验证基础 Schema，需提供 `DIRECT_URL`（可用模板占位 URL 做离线验证）。Schema 没有业务模型，DEV-001 没有 migration；不要运行生产 migration。DEV-002 使用 Supabase Auth 管理登录、Cookie 和 Session，不需要数据库连接或 migration。

## 目录与架构

```text
src/app/          App Router：首页、登录页及受保护认证状态页
src/components/   MUI / App Router Providers
src/modules/      后续业务模块（DEV-001 留空）
src/lib/          Auth、Supabase 客户端及 Cookie / Session 处理
src/types/        共享类型（DEV-001 留空）
src/generated/    自动生成的 Prisma Client（不提交）
prisma/           PostgreSQL 基础 Schema
tests/            首页、环境配置、认证、Cookie 与受保护路由测试
```

后续调用关系：UI → Server Action / Route Handler → Service → Repository → Prisma → PostgreSQL。后续 Prisma 客户端封装必须限制在服务端；UI 不得直接调用 Prisma；用户隔离、Decimal 和业务测试须遵循 `AGENTS.md` 与 `docs/`。

MUI 已接入 App Router SSR 样式缓存。ECharts 已安装并通过 SVG 渲染集成测试，不在首页增加 Dashboard 或示例财务数据。

## DEV-002 认证验收

在独立开发用 Supabase 项目中启用邮箱密码登录，创建并确认测试用户。在 `.env.local` 设置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`，然后运行 `npm run dev`。不要提交 `.env.local`、测试密码或 secret/service_role key。

访问 `/login` 登录；登录后进入 `/private`，该页仅显示服务端核验的当前用户和退出按钮。匿名访问 `/private` 会跳转登录页；登录页的 `next` 参数仅允许当前受保护路径。退出会清理本项目的本机认证 Cookie；远端注销失败时会显示未确认提示。未配置 Supabase 时登录页仍可访问，但登录不可用，受保护页面拒绝访问。

Proxy 使用 `auth.getUser()` 核验和刷新 Session，认证响应禁止缓存。受保护布局及页面再次执行服务端身份检查，不接受客户端传入的 userId。后续新增 Server Action / Route Handler 时仍须各自核验当前用户，不能仅依赖页面布局。

认证自动化测试使用真实 Supabase SSR SDK 和模拟 Auth HTTP 响应，覆盖登录、登出、过期刷新、Cookie 清理、身份校验和路由保护；不连接真实 Supabase 项目。真实帐号的登录、刷新及退出须由总控在独立测试环境验收。
