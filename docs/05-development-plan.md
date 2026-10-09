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

---

# 22. 2026-10-10 V1 架构同步与 DEV Task 修订（优先于冲突的旧排期）

本节根据 `02-business-rules.md` BR-451～455、BR-551～555、BR-751～759 以及更新的 `03-data-model.md` 制定。保留 DEV-001～DEV-014 既有任务编号与非冲突 Scope；新增模块纳入 V1，不能继续视为 V2。所有任务沿用 `AGENTS.md`：一个 Task 一个 feature branch、PR 审查后 squash merge、服务端 Session 权限验证、Decimal、Zod、Vitest，完成时 `npm run lint && npm run test && npm run build` 全部通过。文档更新阶段禁止应用代码、Schema、Migration、数据库操作。

## 22.1 开发前架构门禁（DOC-ARCH）

- 更新 `03-data-model.md`，确定统一资金影响机制、信用卡负债正数口径、应收资产、预留与篮球实体。
- 确认 `02-business-rules.md` 优先；`01-requirements.md` 的早期“专项账本后续”不能覆盖篮球 V1 明确规则。
- `04-ui-spec.md` 在 Stitch 关键页面确认后补齐，作为相应 UI Task 的启动门禁；不要求在纯后端模型讨论前先实现 UI。
- 在 DEV-005 前最终冻结 `AccountMovement` 的权威计算方式（持久化规范化流水或只读投影，二选一）、历史修改与冲正策略、信用卡欠款符号；在 DEV-008 前明确 REVOLVING/INSTALLMENT 计划与历史债务导入表示方式。未冻结不得声称财务核心验收完成。

## 22.2 推荐依赖拓扑（不是必须串行的日期表）

1. DEV-001 Bootstrap → DEV-002 Auth → DEV-003 Account / DEV-004 Category。
2. DEV-005 Transaction + 统一账户资金影响计算基础 → DEV-006 Transfer；补齐 Refund/Reversal、BalanceAdjustment 及用户隔离的基础测试，作为后续资金模块共同依赖（可作为 DEV-005/006 的明确子任务，不得遗漏）。
3. DEV-007 Monthly Plan 可在 Account/Category 稳定后并行推进；DEV-008 Credit Cards 依赖 DEV-005/006 资金机制；DEV-009 Recurring Rules 依赖 DEV-007；DEV-010 Assets 依赖余额/估值快照规则。
4. 新增 DEV-015 Receivables 依赖 DEV-005/006 和必要的 DEV-008 信用卡代付能力；可先实现现金账户代付，但最终验收必须包含信用卡代付。
5. 新增 DEV-016 Reserved Funds 依赖 AccountBalanceService、DEV-007 的计划关联及 DEV-008 信用卡预计还款（纯手动功能可提前开发；正式验收需覆盖手动覆盖与还款释放）。
6. 新增 DEV-017 Basketball Activity 依赖 DEV-003/004/005，独立于 DEV-015/016，可并行实施。
7. DEV-011 Dashboard 需在 DEV-008、DEV-010、DEV-015、DEV-016、DEV-017 的报表契约稳定后做最终聚合验收；DEV-012 PWA 可与非财务开发并行；DEV-013 Excel Import 在核心功能稳定后执行，旧リボ/分期及应收历史数据按可解释期初数据映射；DEV-014 Final QA 必须在新增模块完成后进行最终 V1 回归。

## 22.3 DEV-015 Receivables / Shared Payment

Branch: `feature/receivables`。Scope: SharedPayment、Receivable、ReceivableSettlement 的 Prisma 模型及 migration、Repository、Service、Zod、Server Actions、UI、应收列表/明细、部分结算、冲正、同一用户数据隔离、Dashboard 应收资产数据接口。付款与收款必须由统一资金机制处理，混合支付本人 Expense 与他人 Receivable 分开；信用卡代付完整债务只记一次。Out of scope: 贷款合同、催收、利息、篮球 AA。

验收：支付 ¥12,000，本人 Expense ¥4,000，应收 ¥8,000，实际资产/信用卡负债变化 ¥12,000；收回 ¥3,000 后应收 ¥5,000 且 Income 不变；再收回 ¥5,000 结清；超收拒绝或明确拆分；并发收款不超额；重复请求不重复入账；冲正恢复资金及应收；净资产在代付和本金回收时只因本人真实 Expense 等经济变化而变化；跨用户关联拒绝。

## 22.4 DEV-016 Reserved Funds

Branch: `feature/reserved-funds`。Scope: ReservedFund、ReservedFundEvent 的 Prisma 模型及 migration、Service、Repository、Zod、Server Actions、账户预留列表、手动创建/调整/取消/部分释放、关联 MonthlyPlan/信用卡预计还款、自动建议与手动覆盖、可用余额查询、审计历史。Out of scope: 外部银行 API、自动扣款。

验收：实际余额 ¥100,000，预留 ¥30,000 后可用 ¥70,000，实际余额和净资产不变；另一独立预留 ¥20,000 后可用 ¥50,000；同一义务手动覆盖为 ¥40,000 时不能同时计算原 ¥30,000；实际付款与释放保持一致且重试幂等；允许可用余额为负；取消与部分释放保留事件历史；跨用户账户禁止引用。

## 22.5 DEV-017 Basketball Activity

Branch: `feature/basketball-activity`。Scope: BasketballVenue、BasketballGroup、BasketballActivity 模型及 migration、Repository、Service、Zod、Server Actions、活动明细/创建/编辑/状态管理、场馆与群组复用/停用、活动 Expense 关联、按月/年/场馆/群组统计、移动端录入。活动日期必填、起止时间可选，允许仅开始时间；跨午夜明确结束日期。Out of scope: 多人 AA 结算、复杂场馆预约。

验收：同一日期/场馆/群组多场均可保存；无时间活动可保存；免费 ATTENDED 计参加次数但不生成 Expense；已付款 ABSENT 保留费用与参加状态；取消不自动抹掉已发生费用；活动日期与付款日期跨月时两种报表口径各自正确；场馆和群组可独立选择并保留停用历史；Expense 只记一次且改动必须一致；跨用户关联拒绝。

## 22.6 原任务补充验收

- DEV-005/006：资产账户余额 `opening + income - expense + transferIn - transferOut + adjustments + other effective movements`；Refund/Reversal 不计普通 Income，BalanceAdjustment 不计收支；同一来源资金影响只算一次。
- DEV-008：信用卡欠款 `opening + purchases/advance principal + interest + fees - principal repayment - refunds/reversals + debt adjustments`，正数表示欠款；NORMAL/REVOLVING/INSTALLMENT 的本金重分类不新增 Expense；利息/手续费是新 Expense；历史欠款可用 Opening Balance/Legacy Debt，不伪造历史消费。
- DEV-010：INVESTMENT/PENSION 以历史时点 Snapshot 估值，资金流与市场盈亏分离；应收净资产口径需与历史趋势一致。
- DEV-011：显示账户实际余额、预留后可用余额、有效应收资产、信用卡负债、普通收入支出、篮球活动统计（活动统计可由独立页面承载，Dashboard 至少不误算）；严禁硬编码金额或重复聚合。
- DEV-013：历史导入须 Parse → Preview → Mapping → Validate → Confirm → Import；旧 Excel 关联不完整时明确标注 Legacy 例外；不得未经确认直接入库。
- DEV-014：必须增加混合 AA/信用卡代付、部分收款/并发/冲正、预留覆盖与付款释放、篮球同日多场/免费/未参加/跨月付款、历史资产估值、权限隔离的回归用例。

## 22.7 发布阻塞与非阻塞项

P0 发布前必须解决：资金影响权威来源及幂等键；信用卡债务符号与期初迁移；Receivable 历史净资产一致性；混合支付原子性；预留自动覆盖去重；关联 Expense 修改与冲正一致性；所有模块同用户外键隔离。P1：完善 UI Spec、移动端交互、Excel 迁移映射细节。未完成上述 P0 时可以推进互不依赖的 Bootstrap/UI 设计，但不得验收财务核心模块或宣称 V1 完成。
