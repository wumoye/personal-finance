# Personal Finance Manager

# V1 Development Plan

## 1. 开发目标

V1 的开发目标：

实现一个可实际长期使用的个人资金管理 Web/PWA。

成功标准：

用户可以连续一个月不再依赖原 Excel 完成核心资金管理。

开发采用：

一个 Task

→ 一个 Feature Branch

→ 开发

→ 测试

→ Pull Request

→ Squash Merge

的方式推进。

---

# 2. 开发前置条件

在正式开发开始前必须具备：

- AGENTS.md
- 01-requirements.md
- 02-business-rules.md
- 03-data-model.md
- 04-ui-spec.md
- 05-development-plan.md

其中 UI Spec 在 Stitch 核心设计确认后完成。

---

# 3. DEV-001 Project Bootstrap

Branch：

feature/bootstrap

## Scope

初始化：

- Next.js
- React
- TypeScript strict
- MUI
- ESLint
- Prettier
- Vitest
- Prisma
- Supabase 基础配置
- 项目目录结构
- 环境变量模板

创建基础目录：

src/app

src/components

src/modules

src/lib

src/types

prisma

tests

## Out of Scope

- 登录业务
- Account
- Transaction
- Dashboard

## Acceptance Criteria

以下命令全部成功：

npm run dev

npm run lint

npm run test

npm run build

项目首页能够正常打开。

---

# 4. DEV-002 Authentication

Branch：

feature/auth

## Scope

实现：

- Supabase Auth
- 登录
- 登出
- Session
- Protected Routes
- 服务端获取当前用户
- 未登录跳转登录页

## Security

不得信任客户端 userId。

## Acceptance Criteria

未登录无法进入业务页面。

登录后可以进入应用。

退出后 Session 清除。

服务端能够取得当前用户身份。

---

# 5. DEV-003 Account Management

Branch：

feature/accounts

## Scope

实现：

Account Prisma Model

Migration

Repository

Service

Validation

Server Action

账户列表

新增账户

编辑账户

停用账户

账户排序基础能力

Responsive UI

## Supported Types

BANK

CREDIT_CARD

CASH

WALLET

INVESTMENT

PENSION

OTHER

## Acceptance Criteria

用户能够自由创建任意名称账户。

代码中不得硬编码银行名称。

用户 A 不得访问用户 B 的账户。

存在历史数据的账户可以停用。

---

# 6. DEV-004 Category Management

Branch：

feature/categories

## Scope

实现：

收入分类

支出分类

CRUD

停用

排序

默认分类 Seed

## Acceptance Criteria

用户可以新增自定义分类。

收入分类和支出分类严格区分。

业务代码不得依赖具体分类名称。

---

# 7. DEV-005 Transactions

Branch：

feature/transactions

## Scope

实现：

收入记录

支出记录

新增

编辑

删除

列表

月份筛选

账户筛选

分类筛选

类型筛选

关键词检索

Responsive UI

Quick Entry 基础组件

## Acceptance Criteria

收入正确计入收入统计。

支出正确计入支出统计。

金额验证正确。

Category Type 必须匹配 Transaction Type。

不同用户数据完全隔离。

---

# 8. DEV-006 Transfers

Branch：

feature/transfers

## Scope

实现：

账户间转账

新增 Transfer

编辑 Transfer

删除 Transfer

Transfer 列表显示

## Acceptance Criteria

fromAccount != toAccount。

amount > 0。

Transfer：

不增加收入。

不增加支出。

两个净资产账户之间转账不得改变净资产。

必须增加对应业务测试。

---

# 9. DEV-007 Monthly Plan

Branch：

feature/monthly-plan

## Scope

实现：

创建月份

MonthlyPlan

MonthlyPlanItem

计划收入

计划支出

计划投资

计划储蓄

信用卡还款计划

账户调拨计划

预计剩余资金

编辑

删除

排序

复制上个月计划

## Acceptance Criteria

Monthly Plan 不直接改变真实账户余额。

复制上个月必须生成独立记录。

能够清楚显示：

计划收入

计划支出

计划投资

信用卡还款

预计剩余

这是 V1 的核心验收模块。

---

# 10. DEV-008 Credit Cards

Branch：

feature/credit-cards

## Scope

实现：

CreditCardProfile

CreditCardStatement

CreditCardPayment

信用额度

结账日

还款日

默认还款账户

账期汇总

当前欠款

新增消费

利息

手续费

退款

实际还款

预计期末欠款

额度使用率

## Acceptance Criteria

信用卡消费计入 Expense。

信用卡还款不得再次计入 Expense。

还款后：

资产减少。

负债减少。

净资产逻辑必须正确。

必须为核心金额计算编写测试。

---

# 11. DEV-009 Recurring Rules

Branch：

feature/recurring-rules

## Scope

实现：

固定项目列表

新增

编辑

停用

MONTHLY 周期

生成 MonthlyPlan 时自动加入符合条件的规则

## Acceptance Criteria

RecurringRule 本身不影响真实余额。

生成 MonthlyPlanItem 后两者独立。

修改当月计划不得反向修改 RecurringRule。

---

# 12. DEV-010 Asset Management

Branch：

feature/assets

## Scope

实现：

AssetSnapshot

资产账户列表

当前资产汇总

投资/Pension 手动估值更新

资产构成基础数据

## Acceptance Criteria

BANK/CASH/WALLET 等可以参与现金资产统计。

INVESTMENT/PENSION 可以使用最新 Snapshot。

CREDIT_CARD 不计入资产。

---

# 13. DEV-011 Dashboard

Branch：

feature/dashboard

## Scope

实现：

净资产

总资产

总负债

本月收入

本月支出

本月投资

预计月底余额

信用卡总欠款

最近 12 个月净资产趋势

资产构成

主要消费分类

快捷操作入口

## Acceptance Criteria

不得使用生产 Mock 数据。

所有金额来自真实业务数据。

Transfer 不得污染收支统计。

信用卡还款不得造成支出重复。

Desktop 与 Mobile 符合 UI Spec。

---

# 14. DEV-012 PWA

Branch：

feature/pwa

## Scope

实现：

Web Manifest

App Icon

安装支持

Mobile viewport

基础离线 Application Shell

PWA 基础体验

## Acceptance Criteria

Android/iPhone 可通过浏览器正常使用。

支持添加到主屏幕的基础配置。

离线功能不得导致财务数据错误。

---

# 15. DEV-013 Excel Import

Branch：

feature/excel-import

优先级：

V1 核心功能稳定后实施。

## Scope

上传 Excel

解析

Preview

账户 Mapping

分类 Mapping

数据 Validation

用户确认

Import

Import Result

## 强制流程

Excel

→ Parse

→ Preview

→ Mapping

→ Validate

→ Confirm

→ Import

禁止上传后立即写入数据库。

## Acceptance Criteria

导入前用户可以查看结果。

无法映射的数据必须提示。

导入失败不得留下不可识别的半完成状态。

---

# 16. DEV-014 Final V1 QA

Branch：

test/v1-regression

## Scope

不新增业务功能。

进行：

关键业务回归

权限检查

金额计算检查

Responsive 检查

异常输入检查

Build 检查

## 重点场景

工资收入

现金支出

信用卡消费

信用卡还款

银行转账

月度计划

复制月计划

固定支出生成

投资估值

Dashboard 聚合

---

# 17. 每个 DEV Task 的标准流程

开发开始：

main

→ pull latest

→ 创建 Feature Branch

→ 阅读 AGENTS.md

→ 阅读相关 docs

→ 实现当前 Task

→ 测试

→ lint

→ build

→ 修复问题

→ Commit

→ Push

→ Pull Request

→ CI

→ 人工业务验收

→ Squash Merge

→ 删除 Branch

---

# 18. 标准 Codex Task Prompt

每次执行任务时使用类似：

执行 DEV-XXX。

开始前阅读：

- AGENTS.md
- docs/01-requirements.md
- docs/02-business-rules.md
- docs/03-data-model.md
- docs/04-ui-spec.md
- docs/05-development-plan.md

严格限制在 DEV-XXX Scope 内。

不要提前实现后续 DEV Task。

请：

1. 检查当前代码结构。
2. 完成实现。
3. 增加必要测试。
4. 执行 npm run lint。
5. 执行 npm run test。
6. 执行 npm run build。
7. 修复所有当前任务造成的问题。

完成后汇报：

- 修改文件
- Migration
- 主要实现
- 测试
- 验证结果
- 未解决问题

---

# 19. Git 策略

main：

始终保持可构建状态。

Feature：

feature/xxx

Bug：

fix/xxx

Tests：

test/xxx

推荐：

Squash Merge

Commit：

Conventional Commits

---

# 20. V1 明确禁止自行扩展

除非明确建立新的 DEV Task，否则不得主动加入：

- Spring Boot
- Python Backend
- Redis
- Kafka
- GraphQL
- 微服务
- React Native
- Expo
- OCR
- AI Chat
- AI 自动记账
- 股票实时 API
- 银行自动同步
- SaaS 收费
- 家庭共享

发现潜在需求：

记录建议。

不要在当前 Task 自行实现。

---

# 21. V1 完成定义

满足以下条件时 V1 可以认为完成：

用户能够：

自由创建账户

自由创建分类

记录收入

记录支出

进行账户转账

建立月度资金计划

管理信用卡负债及还款

管理固定项目

记录资产估值

查看 Dashboard

在 Desktop 和 Mobile 使用

并且：

核心业务测试通过

lint 通过

test 通过

build 通过

用户能够实际使用一个月，不依赖原 Excel 完成核心资金管理。
