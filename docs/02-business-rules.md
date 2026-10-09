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

业务代码不得依赖具体银行、信用卡、证券公司或钱包名称。

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

Transfer、Balance Adjustment、资产估值变化不属于 Transaction 类型。

---

## BR-202 Income

Income 表示真实收入，并增加对应资产账户余额。

例如：

工资 ¥450,000

进入 BANK Account。

资金流入某个 Account 本身不能自动判断为 Income，必须根据真实业务性质确定。

---

## BR-203 Expense

Expense 表示真正发生的消费或费用。

例如：

使用 PayPay 支付餐饮 ¥1,000。

该金额计入：

本月支出
Category 支出统计。

资金流出某个 Account 本身不能自动判断为 Expense。

---

## BR-204 Category

Transaction 必须关联对应类型 Category。

INCOME Transaction 不得使用 EXPENSE Category。

EXPENSE Transaction 不得使用 INCOME Category。

---

# Refund / Reversal

## BR-251 Refund

Refund 表示对已经发生的 Expense 的全部或部分退款。

Refund 不属于新的 Income。

正常情况下 Refund 应关联原 Expense。

---

## BR-252 Partial Refund

必须支持部分退款和多次部分退款。

正常情况下，累计有效退款金额不得超过原 Expense 可退款金额。

---

## BR-253 Refund 统计

Refund 应减少对应消费的净支出，但不得增加 Income。

跨月退款必须保留退款实际发生日期，同时保留与原 Expense 的关联，使系统能够分别表达：

- 当月实际发生的退款资金活动
- 原消费最终的净支出

---

## BR-254 Reversal

Reversal 用于表示交易撤销、重复扣款纠正、支付失败恢复等对原业务事实的冲正。

Reversal 不应被统计为新的 Income 或 Expense。

---

## BR-255 Legacy Refund

历史数据导入时，如果无法可靠找到原 Expense，可以允许未关联原交易的 Legacy Refund。

该情况属于历史兼容例外，不应作为正常录入流程的默认方式。

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

## BR-306 资金方向不决定业务性质

资金进入或离开 Account 只描述资金方向，不能单独决定该业务属于 Income、Expense 或 Transfer。

例如外部人员向 WALLET 转入资金时，应根据真实业务性质判断是退款、AA 收款、借款、收入或其他业务。

---

# Balance Adjustment / Reconciliation

## BR-351 Balance Adjustment

Balance Adjustment 用于在系统账面余额与外部账户确认余额不一致时进行对账修正。

Balance Adjustment 不属于 Income、Expense 或 Transfer。

---

## BR-352 Adjustment 对统计的影响

Balance Adjustment：

- 改变对应 Account 的余额
- 如果该 Account 计入净资产，则相应影响净资产
- 不增加 Income
- 不增加 Expense
- 不进入 Category 收支统计

---

## BR-353 Adjustment 可追溯

Balance Adjustment 必须保存明确 occurredAt。

应支持 reason / note，用于记录调整原因。

不得通过直接覆盖 Account 当前余额的方式隐藏差异来源。

历史 Adjustment 必须可追溯。

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

期末欠款 = 期初欠款 + 本期新增消费 + 利息 + 手续费 - 实际还款 - 退款/冲正

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

## BR-407 信用卡偿还方式

业务模型应能够表达至少以下信用卡债务偿还方式：

NORMAL
REVOLVING
INSTALLMENT

偿还方式描述债务如何偿还，不属于 Transaction Type。

将已有信用卡债务转换为 REVOLVING 或 INSTALLMENT 不得重复产生 Expense。

---

## BR-408 本金与融资成本

信用卡本金偿还不属于新的 Expense。

信用卡产生的利息和手续费属于新的真实费用，应计入 Expense，并增加相应信用卡负债。

系统应能够区分：

principal
interest
fee
repayment
refund / reversal

---

## BR-409 历史信用卡债务迁移

历史数据迁移时，应允许通过 Opening Balance / Legacy Debt 表达迁移时点已经存在的信用卡欠款、REVOLVING 或 INSTALLMENT 剩余债务。

历史债务导入不得为了补齐数据而伪造新的 Expense。

如果旧数据无法恢复每笔历史消费与每期本金、利息、手续费的完整对应关系，应允许保留可解释的期初债务余额。

---

# Reserved Funds / 预留资金

## BR-451 预留资金定义

Reserved Funds 表示用户为未来确定或预计的支付用途，在某个资产 Account 中标记暂不自由使用的资金。

预留不代表资金已经转出，也不属于 Income、Expense 或 Transfer；创建、修改和释放预留不得改变账户实际余额或净资产。

---

## BR-452 账户级预留与可用余额

每笔预留必须关联所属资产 accountId，记录非负金额、用途及适用日期；可选关联信用卡或预计还款计划。

账户可用余额 = 账户实际余额 - 当前有效预留资金总额。

可用余额是资金安排指标，不等于银行实际余额，也不用于重复扣减净资产。可用余额允许为负，以提示预留不足。

---

## BR-453 多来源与手动优先

V1 必须支持完全手动预留；也可根据系统内部已记录的信用卡预计还款、计划等数据建议或生成预留。

支持纯手动、内部计算、混合添加以及手动覆盖计算结果。外部银行或信用卡 API 不是 V1 前置依赖。

来源、计算依据及覆盖情况应可追溯；用户确认的手动覆盖值优先于原计算值。

---

## BR-454 防止重复预留

同一笔预期支付不得因手动与自动来源并存而重复计入有效预留。

覆盖自动预留时，应替代原有效金额，而不是在原金额上叠加；独立用途的其他预留可以累加。

---

## BR-455 预留生命周期

预留应支持创建、调整、取消和释放，并保留可追溯记录。

实际支付或信用卡还款发生时，应根据关联关系释放或减少对应预留，避免已支付金额继续占用可用余额。

真实支付仍按 Transaction 或信用卡还款等既有业务规则入账，不由预留记录自动替代。

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

只有实际 Transaction / Transfer / Balance Adjustment 等真实业务发生时才影响实际数据。

---

## BR-503 预计剩余

基础计算：

预计剩余资金 = 计划可用收入 - 计划真实支出 - 计划投资/储蓄等资金安排

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

# Receivables / 代付与 AA 分摊

## BR-551 代付与个人消费分离

为他人垫付的金额属于待收回往来款，不属于用户自己的 Expense。混合支付时，应区分本人承担份额和他人应承担份额；本人份额按 Expense 处理。

代付记录必须保留实际付款账户、发生日期及金额；可选记录对方名称、用途和备注。不得因资金流出就自动归为 Expense。

---

## BR-552 应收款余额

系统应支持轻量级 Receivable，记录应收本金、已收回本金和未收回余额。

未收回余额 = 应收本金 - 累计有效本金收回金额。

应支持多次部分收回、已结清状态及收款日期。累计有效收回本金原则上不得超过应收本金；多收部分必须另行分类，不得默认为 Income。

---

## BR-553 收回款项

朋友归还代付、AA 分摊或借出本金时，实际收款增加指定资产 Account 余额，并减少对应应收款；本金收回不属于 Income，也不得重复抵减本人 Expense。

收回款可通过 BANK、WALLET、CASH 等账户完成，且应可关联原应收记录。

---

## BR-554 AA 分摊

多人共同消费时，用户的个人净消费仅包含自己最终承担的部分。

系统应能够表达一笔对外支付同时包含本人 Expense 与对他人的 Receivable；不得把他人返还的分摊款误统计为普通 Income。

---

## BR-555 往来款范围与净资产

V1 聚焦个人代付、AA 分摊和借出本金的应收及结算，不要求复杂借贷合同、利率或催收管理。

应收款与现金账户余额须分别表示。净资产统计应避免在付款时错误计作个人消费，或在收回本金时重复确认资产；应收款是否计入净资产及历史估值口径须保持一致且可解释。

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

# Investment / Pension

## BR-651 投资资金流与估值分离

INVESTMENT / PENSION Account 必须区分：

- 实际资金投入和取出
- 某时间点的资产估值
- 由市场变化产生的估值盈亏

三者不得混为普通 Income / Expense。

---

## BR-652 投资与养老金投入

如果 BANK、INVESTMENT、PENSION 等相关账户均属于用户自己的账户，资金投入或取出原则上属于 Transfer。

例如：

BANK → INVESTMENT ¥100,000

BANK → PENSION ¥23,000

该资金移动本身不属于普通 Expense。

---

## BR-653 估值变化

投资或养老金资产因市场价格变化产生的未实现盈亏：

- 影响资产价值和净资产
- 不属于普通 INCOME Transaction
- 不属于普通 EXPENSE Transaction

不得通过伪造 Income / Expense 的方式使账户余额匹配市场价值。

---

## BR-654 V1 估值录入

V1 允许用户手工录入 INVESTMENT / PENSION Account 在某时间点的确认市值。

V1 不要求接入证券实时行情 API，也不要求管理单只证券的完整持仓、成本价或实时价格。

---

## BR-655 投资盈亏计算

系统计算期间投资估值变化时，必须排除期间实际资金净投入或净取出造成的资产变化。

例如：

月初市值 ¥1,000,000
本月净投入 ¥100,000
月末市值 ¥1,150,000

则本月估值变化约为：

¥50,000

该 ¥50,000 不属于普通 Income。

---

# Basketball Activity / 篮球活动

## BR-751 V1 活动明细

V1 应支持篮球活动明细，至少包含活动日期、场馆、群组、每次活动费用，并可记录支付账户、备注等信息。

篮球活动目前不需要多人分摊或 AA 结算流程。

---

## BR-752 财务记录关联

篮球活动产生的个人费用属于 Expense，应与主账本中的对应 Expense 关联，不能因为记录活动明细而重复确认支出。

活动数据与财务数据应保持一致；修改或取消活动费用时，须明确处理相关 Expense 的同步或关联关系。

---

## BR-753 场馆与群组配置

场馆与群组应支持配置和复用，不得硬编码具体名称。历史活动关联的场馆、群组停用后仍应能够正确展示。

---

## BR-754 活动统计

V1 支持按月份、年份、场馆、群组统计活动次数与个人费用，并能查看逐次明细。

日期对应的星期应从活动日期推导，不要求重复持久化；统计汇总应基于活动明细与关联财务记录生成。

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

Asset Snapshot 用于保存某个时间点的资产状态或确认估值。

历史 Snapshot 不应因为今天账户余额或市场价值变化而自动改变。

对于 INVESTMENT / PENSION 等无法仅依靠资金流水推导当前市值的资产，可以通过 Asset Snapshot 保存用户确认的时间点估值。

V1 以手工确认估值为主。

---

# Dashboard

## BR-801 Dashboard 数据

Dashboard 禁止使用硬编码金额。

必须由真实业务数据聚合。

---

## BR-802 本月收入

只统计当前月份 INCOME Transaction。

Transfer、Refund、Balance Adjustment、投资估值上涨不包含在普通 Income 中。

---

## BR-803 本月支出

只统计当前月份 EXPENSE Transaction，并正确考虑 Refund / Reversal 对净支出的影响。

信用卡还款本金不得重复作为 Expense。

Transfer、Balance Adjustment、投资本金投入不包含在普通 Expense 中。

信用卡利息和手续费属于真实费用，可以计入 Expense。

---

## BR-804 净资产趋势

净资产趋势应基于历史 Snapshot 或可靠历史计算数据。

不得使用随机 Mock 数据作为生产逻辑。

投资和养老金的历史估值应使用对应时间点已确认的 Snapshot，不得使用今天的市值反向覆盖历史。

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

Account、Category、MonthlyPlan、Transfer、Adjustment、Snapshot 等同理。

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

修改历史 Transaction、Transfer、Refund、Balance Adjustment 或 Asset Snapshot 后，相关 Dashboard、余额和统计结果必须反映修改后的真实数据。

---

## BR-1004 派生数据

能够根据原始业务事实可靠推导的数据，应优先通过计算获得，不应为了复制旧 Excel 结构而重复保存。

例如：

- 日期对应的星期
- 月度合计
- 环比变化
- 信用额度使用率

需要冻结历史状态或保存用户确认估值的 Snapshot 除外。

---

# Future / V2 Candidates

以下能力不是 V1 Business Rules 的强制实现范围，但当前模型不应阻碍未来扩展：

- 从证券、银行或养老金 App 截图识别资产总额，经用户确认后生成 Asset Snapshot
- 通用 Tag / Project 等跨 Category 专项消费分析（篮球活动的 V1 明细和统计已由 BR-751～754 覆盖）
- 更细粒度的证券 Holding / Security / Cost Basis / Realized Gain / Unrealized Gain 管理
- 可选证券或金融数据 API 集成

截图识别结果不得未经用户确认直接改变正式财务数据。
