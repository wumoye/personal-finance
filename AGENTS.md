# Personal Finance Manager - AI 开发规则

## 1. 项目目标

本项目是一个个人资金管理系统。

核心目标不是单纯记录消费，而是管理：

- 收入与支出
- 多账户资金
- 账户间转账
- 月度资金分配
- 信用卡负债与还款
- 固定支出
- 投资资产
- 总资产、总负债和净资产

V1 的首要目标是替代现有 Excel 记账与资金规划方式。

---

## 2. 技术栈

V1 固定使用：

- Next.js
- React
- TypeScript
- MUI
- Prisma
- Supabase PostgreSQL
- Supabase Auth
- ECharts
- Vitest

第一阶段使用 Responsive Web + PWA。

未经明确批准，不得引入其他主要框架。

禁止自行增加：

- Spring Boot
- Python Backend
- GraphQL
- Redis
- Kafka
- 微服务
- React Native
- Expo

---

## 3. 架构原则

采用模块化业务结构。

推荐调用关系：

UI
→ Server Action / Route Handler
→ Service
→ Repository
→ Prisma
→ PostgreSQL

### UI

React Component 负责：

- 展示
- 用户交互
- 表单

React Component 不得直接访问 Prisma。

### Service

Service 负责：

- 业务规则
- 金额计算
- 权限相关业务判断
- 跨 Repository 操作

不得把核心业务规则写在 React Component 中。

### Repository

Repository 负责：

- Prisma 查询
- 数据创建
- 数据更新
- 数据删除/停用

---

## 4. 数据驱动原则

禁止硬编码用户实际使用的：

- 银行名称
- 信用卡名称
- 证券账户名称
- 钱包名称
- 支出分类
- 收入分类

禁止出现类似：

rakutenBalance
paypayAmount
mizuhoAccount

业务代码必须使用：

accountId
categoryId

具体账户和分类由数据库管理。

---

## 5. 账户规则

所有资金载体统一抽象为 Account。

账户类型包括：

- BANK
- CREDIT_CARD
- CASH
- WALLET
- INVESTMENT
- PENSION
- OTHER

用户可以自由创建账户。

历史账户原则上不得物理删除。

不再使用的账户应使用：

isActive = false

进行停用。

---

## 6. 金额规则

所有核心金额必须使用 Decimal。

禁止使用 JavaScript 浮点数承担核心财务计算。

金额数据库字段必须具有明确 precision 和 scale。

---

## 7. Transaction 与 Transfer

Transaction 用于：

- INCOME
- EXPENSE

Transfer 用于账户之间资金移动。

Transfer：

- 不属于 Income
- 不属于 Expense
- 不改变净资产
- 转出账户余额减少
- 转入账户余额增加

禁止为了方便把 Transfer 保存成普通 Expense + Income。

---

## 8. 信用卡规则

信用卡首先是 Account：

type = CREDIT_CARD

信用卡额外属性由 CreditCardProfile 管理。

信用卡消费属于 Expense。

信用卡还款是资产账户与信用卡负债之间的资金结算。

信用卡还款不得再次计入消费支出，否则会造成重复统计。

---

## 9. 用户隔离

所有属于用户的数据必须按当前登录用户隔离。

不得信任客户端传入的 userId。

Server Action / Route Handler 必须从服务端 Session 获取当前用户。

所有读取、修改和删除操作必须验证数据归属。

---

## 10. Validation

外部输入必须进行验证。

表单和 Server Action 输入优先使用 Zod。

不得仅依赖前端表单验证。

---

## 11. Prisma

修改 Prisma Schema 时：

1. 更新 schema.prisma
2. 创建 migration
3. 检查 migration
4. 更新相关测试

不得绕过 Migration 手工修改生产数据库结构。

---

## 12. 测试

新增业务功能必须覆盖关键业务规则。

尤其优先测试：

- 金额计算
- Transfer
- Credit Card
- Monthly Plan
- 用户数据隔离

测试重点是业务结果，而不是单纯提高覆盖率。

---

## 13. 完成条件

开发任务完成前必须执行：

npm run lint
npm run test
npm run build

如果存在失败：

不得宣称任务完成。

必须修复或明确报告无法解决的原因。

---

## 14. Git

main 必须保持稳定和可构建。

禁止直接在 main 上开发业务功能。

原则：

1 DEV Task = 1 Branch

例如：

feature/accounts
feature/transactions
feature/monthly-plan

Bug 使用：

fix/xxx

Commit 使用 Conventional Commits，例如：

feat: add account management
fix: exclude transfers from expense totals
test: add transfer service tests
docs: update credit card rules

禁止使用无意义 Commit：

update
fix
changes
test

一个 PR 原则上只处理一个 DEV Task。

推荐使用 Squash Merge。

---

## 15. Scope 控制

执行 DEV Task 时，只实现该 Task Scope。

不得擅自提前开发后续 Phase。

发现未来可能需要的功能时：

记录建议，但不要自行扩大当前实现范围。

---

## 16. 文档优先级

开发前根据任务读取：

- docs/01-requirements.md
- docs/02-business-rules.md
- docs/03-data-model.md
- docs/04-ui-spec.md
- docs/05-development-plan.md

如果代码实现与业务规则存在冲突，应优先检查需求和业务规则，而不是自行猜测。

存在重大歧义时应报告，而不是自行创造业务规则。
