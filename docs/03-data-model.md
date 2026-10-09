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

closingBalance = openingBalance + newCharges + interest + fees - refunds - actualPayment（均为负债正数口径；本金重分类不重复增加债务）

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

+ 收入

- 支出

+ 转入

- 转出

+ Balance Adjustment 及其他已确认的账户资金影响

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

---

# 22. V1 架构修订（2026-10-10；优先于上文冲突的旧描述）

本节与 `02-business-rules.md` BR-001～1004 一致。上文第 20 节的“暂不建立”不适用于篮球活动；BasketballActivity、BasketballVenue、BasketballGroup 属于 V1 必需实体。以下为逻辑模型，非已实施 Prisma Schema。

## 22.1 统一资金影响与核算边界

- Transaction 仅 INCOME / EXPENSE；Transfer、CreditCardPayment、Refund、Reversal、BalanceAdjustment、ReceivableSettlement、SharedPayment 的代付部分、AssetSnapshot 与 ReservedFund 不得伪装为 Transaction。
- 建议在 Service 层统一构建不可重复的 `AccountMovement`（规范化资金影响记录/计算投影），包含 `id,userId,accountId,sourceType,sourceId,component,amountDelta,occurredAt`；`(userId,sourceType,sourceId,accountId,component)` 唯一，重试使用业务幂等键。`amountDelta` 为有符号 Decimal：资产账户正数表示增加；信用卡以负债正数单独核算，不把信用卡消费作为资产流入。可通过统一只读投影或持久化流水实现，但只能选一种权威来源；不得同时累加业务表与投影。所有业务事实在同一 Prisma 事务中提交。是否持久化 Movement 在 DEV-005 前冻结。
- 资产账户实际余额 = 期初资产余额 + 有效 INCOME - 有效 EXPENSE + Transfer 转入 - Transfer 转出 + 有效 Refund/Reversal + BalanceAdjustment + 应收代付付款的资金减少 + 应收本金收回的资金增加 + 信用卡还款的资金减少 + 其他已核准资金影响。混合支付本人 Expense 与他人 Receivable 份额合计等于实际扣款；不得再对完整付款重复扣款。对 CREDIT_CARD 不使用资产余额公式。
- 信用卡欠款（负债正数）= 期初欠款 + 新增信用卡消费/代付本金 + 利息 + 手续费 - 本金还款 - 有效退款/冲正 + 经审计债务调整。NORMAL / REVOLVING / INSTALLMENT 是债务偿还方式；本金转换不增加新 Expense 或债务。利息与手续费各计一次 Expense 和一次债务增加。Statement 汇总是可重算的账期视图/冻结快照，不可与原始业务事实重复累加。CreditCardPayment 还款本金减少银行资产和卡负债，绝不新增 Expense。
- Refund 和 Reversal 保留原业务引用、实际发生日期及有效状态；历史无原交易的 Legacy Refund 作为受控例外。BalanceAdjustment 独立记录 reason、occurredAt，不进入收入支出。投资/PENSION 估值用对应时间点 AssetSnapshot；资金投入/取出为 Transfer，未实现估值盈亏不属于 Income/Expense。
- 净资产 = 纳入统计的资产账户价值 + 纳入统计的有效应收本金 - 信用卡及其他已定义负债。若账户 includeInNetWorth=false，关联应收资产是否纳入仍按应收本身的纳入规则明确列示，避免以付款账户标记隐式丢失资产。历史估值和应收口径按同一时间点计算，不用当前余额覆盖历史。
- 金额统一 Decimal(18,2)；金额、汇总与校验禁止 JS Number 浮点累计。默认 JPY、Asia/Tokyo；财务发生日期 `occurredAt` 与 `createdAt` 分离。所有外键必须验证同一 userId，所有写操作服务端取 Session，不能信任客户端 userId。

## 22.2 Reserved Funds（BR-451～455）

`ReservedFund`: `id,userId,accountId,purpose,amount,appliesOn?,status(ACTIVE|RELEASED|CANCELLED),sourceType(MANUAL|INTERNAL),sourceKey?,plannedPaymentId?,overrideOfId?,createdAt,updatedAt`；`amount >= 0`，仅允许支持预留的资产 Account。可选关联 CreditCard 预计还款或 MonthlyPlanItem；`sourceKey`/付款义务 ID 标识同一预期付款，手动覆盖同一义务时只保留一个有效金额，不叠加自动值。独立用途允许累加。

`ReservedFundEvent`: `id,userId,reservedFundId,eventType(CREATED|ADJUSTED|OVERRIDDEN|PARTIALLY_RELEASED|RELEASED|CANCELLED),amountDelta,sourcePaymentType?,sourcePaymentId?,occurredAt,note?`；记录审计及部分释放；释放不得超过有效预留，支付/还款的重复通知不得重复释放。当前有效预留为经事件确认的未释放金额；`ReservedFund.amount` 作为确认的目标金额，不能与事件重复相加。账户可用余额 = 实际资产账户余额 - 当前有效预留总额，允许负数；预留创建/调整/释放不改变实际余额、Income、Expense、Transfer 或净资产。与真实付款绑定的释放必须幂等、事务一致。

关系：User 1:N ReservedFund；Account 1:N ReservedFund；ReservedFund 1:N ReservedFundEvent；计划/还款义务可选关联。索引 `(userId,accountId,status)`、`(userId,sourceKey)`；同一义务生效唯一性需由部分唯一索引或事务约束实现，不能仅靠 UI。

## 22.3 Receivables / Shared Payment（BR-551～555）

`SharedPayment`: `id,userId,paymentAccountId,occurredAt,totalAmount,ownExpenseAmount,expenseTransactionId?,note?,idempotencyKey`；总额 > 0，本人份额 >= 0，`totalAmount = ownExpenseAmount + sum(关联应收本金)`；本人份额 > 0 时关联且仅关联对应 EXPENSE，不能把全部付款同时记作 Expense。信用卡付款时增加完整卡负债但只把本人份额计入 Expense。

`Receivable`: `id,userId,sharedPaymentId?,counterpartyName?,purpose?,principalAmount,occurredAt,status(OPEN|SETTLED|CANCELLED),includeInNetWorth(default true),note?,createdAt,updatedAt`；`principalAmount > 0`。允许独立借出本金或代付，不强制 SharedPayment；独立创建时也必须绑定真实付款账户及其唯一资金影响来源。余额为本金减有效结算本金，不能为负；状态应与余额一致。

`ReceivableSettlement`: `id,userId,receivableId,receiptAccountId,principalAmount,occurredAt,status(ACTIVE|REVERSED),reversalOfId?,idempotencyKey,note?`；收回本金增加指定 BANK/WALLET/CASH 等资产账户余额、减少应收资产，不属于 Income，也不减少本人 Expense。允许部分、多次结算；在事务中锁定/条件更新未收回本金以防并发超收，超出本金的金额必须另行分类。冲正恢复应收和资金影响，保留历史。

资产确认：有效应收余额作为单独的应收资产计入净资产，付款时现金减少/应收增加；收回时现金增加/应收减少；不得把应收余额再计入现金账户或再生成 Income。历史净资产按截至历史日期的有效本金、结算和冲正计算。允许将来扩展坏账/减值，但 V1 不自动计息或催收。

关系：SharedPayment 1:N Receivable；Receivable 1:N ReceivableSettlement；SharedPayment 可选 1:1 Transaction(EXPENSE)；Account 1:N 付款/收款。索引 `(userId,occurredAt)`、`(userId,status)`、`(userId,receivableId,occurredAt)`；幂等键用户范围唯一。

## 22.4 Basketball Activity（BR-751～759）

`BasketballVenue`: `id,userId,name,isActive,createdAt,updatedAt`；`BasketballGroup`: `id,userId,name,isActive,createdAt,updatedAt`。两者独立 ID，可复用、停用但保留历史引用；不建立场馆与群组的一对一约束。

`BasketballActivity`: `id,userId,activityDate,venueId,groupId,attendanceStatus(PLANNED|ATTENDED|CANCELLED|ABSENT),startTime?,endTime?,endDate?,feeAmount(default 0),paymentStatus(UNPAID|PAID|REFUNDED|PARTIAL_REFUND),paymentAccountId?,paymentOccurredAt?,expenseTransactionId?,note?,createdAt,updatedAt`。日期必填、时间均选填；只填开始时间合法；同时有起止时间时校验先后，跨日必须明确 endDate。`feeAmount >= 0`，每场 V1 一个付款 Account，零费用不生成 Expense；发生实际费用时 Expense 金额/账户/付款日期必须匹配真实支付，活动费用不得二次扣款。活动取消或未参加不自动撤销真实费用，退款须走 Refund/Reversal 规则。活动编辑与关联 Expense 的一致性由 Service 同事务维护或拒绝冲突操作。

`activityId` 是唯一活动身份；严禁按 `(userId,activityDate,venueId,groupId)` 或时间建立唯一约束，同日同地点同群组多场活动必须可存。参加次数只按 ATTENDED 统计，其他状态独立显示；活动费用按 activityDate，账本 Expense 按 paymentOccurredAt 分别归属月份；星期从日期推导不持久化。V1 不要求篮球 AA 流程。

关系：User 1:N Activity/Venue/Group；Venue 1:N Activity；Group 1:N Activity；Activity 可选 1:1 Expense；索引 `(userId,activityDate)`、`(userId,venueId,activityDate)`、`(userId,groupId,activityDate)`、`(userId,attendanceStatus,activityDate)`。`expenseTransactionId` 在用户范围唯一（非空时），防止同一笔费用被重复认领。

## 22.5 设计冻结与待实现事项

本文件是逻辑设计，不代表已建表。DEV-005 前需在架构评审中冻结 Movement 是持久化流水还是确定性只读投影；两者均必须支持历史修改重算、信用卡及应收的原子性和幂等性。V1 不引入 Redis、微服务、证券行情 API、复杂多币种换算、篮球多人 AA。任何数据模型变更均通过独立 DEV Task 的 Prisma migration 与测试执行，本文档修订本身不运行数据库操作。
