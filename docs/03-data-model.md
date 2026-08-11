# Personal Finance Manager

# V1 Data Model

## 1. 设计目标

数据模型必须满足以下原则：

- 用户可以自由添加账户。
- 用户可以自由添加分类。
- 不硬编码任何银行、信用卡、电子钱包或证券账户。
- 收入、支出与转账明确区分。
- 信用卡消费与信用卡还款不得重复计算支出。
- 月度计划与实际发生的数据明确区分。
- 历史数据可长期保留。
- 数据模型为未来 Excel 导入、专项账本、OCR、AI 自动分类等功能保留扩展空间。

---

# 2. 核心实体关系

V1 核心实体：

User

Account

Category

Transaction

Transfer

MonthlyPlan

MonthlyPlanItem

CreditCardProfile

CreditCardStatement

CreditCardPayment

RecurringRule

AssetSnapshot

主要关系：

User
→ Account

User
→ Category

User
→ Transaction

User
→ Transfer

User
→ MonthlyPlan

Account
→ Transaction

Account
→ Transfer

Account(CREDIT_CARD)
→ CreditCardProfile

Account(CREDIT_CARD)
→ CreditCardStatement

MonthlyPlan
→ MonthlyPlanItem

RecurringRule
→ MonthlyPlanItem（生成关系，不强制长期引用）

---

# 3. User

用户身份主要由 Supabase Auth 管理。

业务数据库中可以保存必要的 Profile 信息。

建议字段：

- id
- authUserId
- displayName
- defaultCurrency
- timezone
- createdAt
- updatedAt

V1 默认：

defaultCurrency = JPY

timezone = Asia/Tokyo

业务表统一通过 userId 隔离。

---

# 4. Account

所有资金载体统一为 Account。

## 字段

- id
- userId
- name
- type
- currency
- initialBalance
- includeInNetWorth
- sortOrder
- isActive
- createdAt
- updatedAt

## AccountType

- BANK
- CREDIT_CARD
- CASH
- WALLET
- INVESTMENT
- PENSION
- OTHER

## 示例

名称：

三井住友

类型：

BANK

---

名称：

PayPay

类型：

WALLET

---

名称：

乐天信用卡

类型：

CREDIT_CARD

具体名称只属于数据，不属于代码结构。

---

# 5. Category

用于收入和支出分类。

## 字段

- id
- userId
- name
- type
- parentId（可选）
- icon（可选）
- color（可选）
- sortOrder
- isActive
- createdAt
- updatedAt

## CategoryType

- INCOME
- EXPENSE

V1 可以支持一级分类。

parentId 保留未来子分类能力。

---

# 6. Transaction

表示实际发生的收入或支出。

## 字段

- id
- userId
- accountId
- categoryId
- type
- amount
- occurredAt
- description
- note
- createdAt
- updatedAt

## TransactionType

- INCOME
- EXPENSE

Transfer 不使用 Transaction 表示。

---

# 7. Transfer

表示两个账户之间实际发生的资金移动。

## 字段

- id
- userId
- fromAccountId
- toAccountId
- amount
- occurredAt
- note
- createdAt
- updatedAt

## 规则

fromAccountId != toAccountId

amount > 0

Transfer 不计入收入。

Transfer 不计入支出。

如果两个账户都属于净资产统计范围，Transfer 不改变净资产。

---

# 8. MonthlyPlan

表示某一个年月的资金规划。

## 字段

- id
- userId
- year
- month
- status
- note
- createdAt
- updatedAt

## 唯一约束

userId + year + month

原则上一个用户一个年月只有一个主计划。

## PlanStatus

- DRAFT
- ACTIVE
- CLOSED

V1 可以主要使用 DRAFT / ACTIVE。

---

# 9. MonthlyPlanItem

表示 MonthlyPlan 中的一项资金安排。

## 字段

- id
- monthlyPlanId
- type
- name
- sourceAccountId（可选）
- targetAccountId（可选）
- categoryId（可选）
- plannedAmount
- sortOrder
- note
- createdAt
- updatedAt

## MonthlyPlanItemType

- INCOME
- EXPENSE
- TRANSFER
- CREDIT_CARD_PAYMENT
- INVESTMENT
- SAVING
- RESERVE

## 示例

工资

type = INCOME

plannedAmount = 450000

---

房租

type = EXPENSE

plannedAmount = 108600

---

乐天信用卡还款

type = CREDIT_CARD_PAYMENT

plannedAmount = 80000

---

投资

type = INVESTMENT

plannedAmount = 100000

---

# 10. CreditCardProfile

只有 Account.type = CREDIT_CARD 的账户可以拥有 CreditCardProfile。

## 字段

- id
- userId
- accountId
- paymentAccountId（可选）
- closingDay（可选）
- paymentDay（可选）
- creditLimit（可选）
- createdAt
- updatedAt

accountId 应唯一。

paymentAccountId 指默认还款账户。

---

# 11. CreditCardStatement

表示一张信用卡某个账期的汇总。

## 字段

- id
- userId
- creditCardAccountId
- year
- month
- openingBalance
- newCharges
- interest
- fees
- refunds
- actualPayment
- closingBalance
- status
- createdAt
- updatedAt

## StatementStatus

- OPEN
- CLOSED
- PAID

## 基本关系

closingBalance

=

openingBalance

- newCharges

- interest

- fees

* refunds

* actualPayment

userId + creditCardAccountId + year + month 应建立唯一约束。

---

# 12. CreditCardPayment

保存信用卡实际还款记录。

## 字段

- id
- userId
- creditCardAccountId
- paymentAccountId
- statementId（可选）
- amount
- occurredAt
- note
- createdAt
- updatedAt

信用卡还款本身不得再次成为 Expense。

它表示：

银行等资产账户余额下降

同时：

信用卡负债下降。

---

# 13. RecurringRule

表示周期性计划规则。

## 字段

- id
- userId
- name
- type
- accountId（可选）
- categoryId（可选）
- targetAccountId（可选）
- amount
- frequency
- startDate
- endDate（可选）
- dayOfMonth（可选）
- isActive
- createdAt
- updatedAt

## Frequency

V1：

- MONTHLY

未来可以增加：

- WEEKLY
- YEARLY
- CUSTOM

## RecurringType

可以与 MonthlyPlanItemType 对应：

- INCOME
- EXPENSE
- TRANSFER
- CREDIT_CARD_PAYMENT
- INVESTMENT
- SAVING

---

# 14. AssetSnapshot

保存某个时间点的资产状态。

## 字段

- id
- userId
- accountId
- snapshotDate
- amount
- note
- createdAt

适用于：

- 银行余额历史
- 投资账户市值
- iDeCo
- 其他非流水直接能够完全推导的资产

历史 Snapshot 创建以后原则上不随当前余额变化而改变。

---

# 15. 余额计算

V1 不建议把 currentBalance 作为所有账户唯一真实来源直接保存并随每一笔交易修改。

优先采用：

初始余额

-

收入

-

支出

-

转入

-

转出

结合必要的 AssetSnapshot

计算账户状态。

对于 INVESTMENT、PENSION 等不能仅靠流水反映市场价值的账户：

优先使用最近 AssetSnapshot 作为当前估值。

---

# 16. 信用卡的特殊余额

信用卡属于负债账户。

信用卡余额的含义与 BANK Account 不同。

信用卡：

消费增加负债。

还款减少负债。

Dashboard 聚合时必须根据 AccountType 正确区分资产与负债。

禁止把 CREDIT_CARD 当作普通正余额资产账户处理。

---

# 17. 删除策略

以下实体存在历史引用后，应优先软删除/停用：

- Account
- Category
- RecurringRule

Transaction 和 Transfer 可以允许用户删除，但删除属于真实业务数据修改，应进行服务端权限验证。

---

# 18. 索引建议

至少为以下查询场景建立索引：

Transaction：

- userId + occurredAt
- userId + accountId + occurredAt
- userId + categoryId + occurredAt

Transfer：

- userId + occurredAt
- userId + fromAccountId
- userId + toAccountId

MonthlyPlan：

- userId + year + month

CreditCardStatement：

- userId + creditCardAccountId + year + month

AssetSnapshot：

- userId + accountId + snapshotDate

---

# 19. Decimal

所有货币金额字段统一使用 Decimal。

建议初期：

Decimal(18, 2)

即使第一版主要使用 JPY，也不要因为日元通常无小数就把数据结构限制死。

---

# 20. V1 暂不建立的模型

暂不加入：

Budget

Tag

Attachment

Receipt

AIClassification

StockHolding

StockPrice

SpecialLedger

BasketballRecord

SharedAccount

Loan

这些未来按实际需求增加。

---

# 21. Prisma Schema 实现原则

实际创建 schema.prisma 时：

- 使用明确 enum
- 建立必要 relation
- 建立唯一约束
- 建立查询索引
- 所有用户拥有的数据必须有 userId
- 金额使用 Decimal
- 不允许具体银行名称成为字段
- 不允许具体信用卡名称成为字段

schema.prisma 的最终实现必须符合：

docs/02-business-rules.md
