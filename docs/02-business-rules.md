# Personal Finance Manager

# V1 Business Rules

## BR-001 金额

核心财务金额必须使用 Decimal。

禁止依赖 JavaScript Number 进行核心金额累计和余额计算。

数据库金额必须使用明确 Decimal precision。

---

## BR-002 用户数据隔离

所有用户拥有的数据必须绑定当前用户。

任何读取、修改、删除操作必须确认数据属于当前登录用户。

不得信任客户端提交的 userId。

---

# Account

## BR-101 Account 可配置

具体账户由用户创建。

业务代码不得依赖具体银行、信用卡或钱包名称。

---

## BR-102 Account Type

Account Type：

BANK
CREDIT_CARD
CASH
WALLET
INVESTMENT
PENSION
OTHER

---

## BR-103 Account 停用

存在历史交易的 Account 不应直接物理删除。

用户不再使用账户时：

isActive = false

历史数据仍必须正常显示。

---

## BR-104 是否计入净资产

Account 应支持：

includeInNetWorth

用于决定是否参与净资产统计。

---

# Transaction

## BR-201 Transaction 类型

Transaction 仅包括：

INCOME
EXPENSE

Transfer 不属于 Transaction 类型。

---

## BR-202 Income

Income 增加资产账户余额。

例如：

工资 ¥450,000

进入 BANK Account。

---

## BR-203 Expense

Expense 表示真正发生的消费或费用。

例如：

使用 PayPay 支付餐饮 ¥1,000。

该金额计入：

本月支出
Category 支出统计。

---

## BR-204 Category

Transaction 必须关联对应类型 Category。

INCOME Transaction 不得使用 EXPENSE Category。

EXPENSE Transaction 不得使用 INCOME Category。

---

# Transfer

## BR-301 Transfer

Transfer 表示两个 Account 之间的资金移动。

---

## BR-302 Transfer 不计入收支

Transfer：

不得增加 Income。
不得增加 Expense。

---

## BR-303 Transfer 不改变净资产

如果两个 Account 都计入净资产：

Transfer 前后的总净资产必须相同。

例如：

银行 A：¥100,000
银行 B：¥0

转账 ¥30,000 后：

银行 A：¥70,000
银行 B：¥30,000

总资产仍然：

¥100,000

---

## BR-304 Transfer Account

fromAccountId 与 toAccountId 不得相同。

---

## BR-305 Transfer Amount

Transfer amount 必须 > 0。

---

# Credit Card

## BR-401 信用卡属于 Account

信用卡必须首先创建：

Account.type = CREDIT_CARD

CreditCardProfile 只保存信用卡特有配置。

---

## BR-402 信用卡消费

使用信用卡购买商品属于 Expense。

例如：

信用卡购买商品 ¥10,000

本月 Expense：

+¥10,000

信用卡负债：

+¥10,000

---

## BR-403 信用卡还款

信用卡还款不得再次计入 Expense。

因为消费已经在刷卡时统计过。

例如：

7月信用卡消费：

¥100,000

8月银行还款：

¥100,000

整个过程真正消费仍然只有：

¥100,000

不得统计为：

¥200,000

---

## BR-404 信用卡余额

信用卡负债基本关系：

# 期末欠款

期初欠款

- 本期新增消费
- 利息
- 手续费

* 实际还款
* 退款/冲正

---

## BR-405 信用卡还款账户

信用卡可以设置默认 paymentAccount。

用户仍可以在实际还款时选择其他 Account。

---

## BR-406 信用额度

Credit Limit 用于：

- 显示额度
- 计算额度使用率

不直接影响净资产计算。

---

# Monthly Plan

## BR-501 Monthly Plan 唯一性

一个用户原则上一个年月只有一个主 Monthly Plan。

例如：

user A + 2026 + 8

只能存在一个有效主计划。

---

## BR-502 Monthly Plan 是计划

Monthly Plan 不代表真实资金已经发生变化。

创建：

计划投资 ¥100,000

不能直接改变账户余额。

只有实际 Transaction / Transfer 等真实业务发生时才影响实际数据。

---

## BR-503 预计剩余

基础计算：

# 预计剩余资金

计划可用收入

- 计划真实支出
- 计划投资/储蓄等资金安排

具体 UI 可以进一步区分：

消费
还款
投资
储蓄
账户调拨

账户之间单纯 Transfer 不应被误认为消费。

---

## BR-504 Copy Previous Month

复制上个月计划时：

创建新的 Monthly Plan 和 MonthlyPlanItems。

不得让两个月份共享同一条可修改记录。

---

# Recurring Rule

## BR-601 Recurring Rule

Recurring Rule 是生成计划项目的规则。

本身不代表真实 Expense 已经发生。

---

## BR-602 自动生成

生成某月份 Monthly Plan 时：

符合日期条件的 Recurring Rule 可以生成对应 MonthlyPlanItem。

---

## BR-603 生成后独立

Recurring Rule 生成 MonthlyPlanItem 后：

修改当月计划不得反向修改原 Recurring Rule。

---

# Assets

## BR-701 总资产

总资产根据计入资产统计的 Account 和资产数据计算。

---

## BR-702 总负债

至少包括：

信用卡负债。

未来可以扩展：

贷款
其他债务。

---

## BR-703 净资产

净资产：

总资产 - 总负债

---

## BR-704 Asset Snapshot

Asset Snapshot 用于保存某个时间点的资产状态。

历史 Snapshot 不应因为今天账户余额变化而自动改变。

---

# Dashboard

## BR-801 Dashboard 数据

Dashboard 禁止使用硬编码金额。

必须由真实业务数据聚合。

---

## BR-802 本月收入

只统计当前月份 INCOME Transaction。

Transfer 不包含在内。

---

## BR-803 本月支出

只统计当前月份 EXPENSE Transaction。

信用卡还款不得重复作为 Expense。

Transfer 不包含在内。

---

## BR-804 净资产趋势

净资产趋势应基于历史 Snapshot 或可靠历史计算数据。

不得使用随机 Mock 数据作为生产逻辑。

---

# Security

## BR-901 Server Authorization

所有 Server Action / Route Handler 在执行敏感操作前必须验证当前登录用户。

---

## BR-902 Ownership

例如修改 Transaction：

不仅要知道 transactionId，

还必须验证：

transaction.userId == currentUser.id

Account、Category、MonthlyPlan 等同理。

---

# Data Integrity

## BR-1001 历史引用

已经被历史数据引用的 Account、Category 等配置项，应优先停用而不是删除。

---

## BR-1002 时间

业务记录保存明确 occurredAt。

createdAt 仅表示数据库创建时间。

不得使用 createdAt 替代真实业务日期。

---

## BR-1003 修改

修改历史 Transaction 后，相关 Dashboard、余额和统计结果必须反映修改后的真实数据。
