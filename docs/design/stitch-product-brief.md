# Personal Finance Manager

## Product Design Brief

### 1. 产品定位

这是一个个人资金管理应用。

它不是单纯记录“今天花了多少钱”的普通消费记账 App，而是帮助用户管理完整的个人资金状态和月度资金安排。

产品需要帮助用户快速回答：

- 我的钱现在在哪里？
- 我目前拥有多少资产？
- 我目前有多少负债？
- 我的净资产是多少？
- 这个月收入和支出分别是多少？
- 每个月的钱应该如何分配？
- 每张信用卡欠多少钱？
- 这个月准备还多少钱？
- 还款以后还剩多少负债？
- 本月底预计还能剩多少钱？
- 净资产长期如何变化？

核心概念：

- Personal Wealth
- Cash Flow
- Debt Management
- Monthly Planning
- Financial Clarity

---

## 2. 核心功能

V1 包括：

- Dashboard
- 收入 / 支出记录
- 快速记账
- 账户间转账
- 账户管理
- 分类管理
- 月度资金计划
- 信用卡管理
- 固定周期项目
- 资产管理

---

## 3. Account 设计理念

所有具体资金账户均由用户自由创建。

例如用户可以创建：

- 银行账户
- 信用卡
- 现金
- 电子钱包
- 证券账户
- 养老金账户
- 其他资金账户

产品设计不得围绕某一家具体银行、信用卡或支付平台展开。

Account Types：

- BANK
- CREDIT_CARD
- CASH
- WALLET
- INVESTMENT
- PENSION
- OTHER

UI 应允许用户未来增加任意数量的账户。

---

## 4. Category 设计理念

收入和支出分类同样允许用户自行管理。

系统可以提供默认分类，但 UI 不应假定分类永远固定。

用户需要能够：

- 新增
- 修改
- 停用
- 排序

---

## 5. 核心使用场景

### Scene 1：查看整体财务状态

用户打开应用。

应该能够立即知道：

- 净资产
- 总资产
- 总负债
- 本月收入
- 本月支出
- 本月投资
- 预计月底余额

---

### Scene 2：月初规划资金

用户知道本月工资和现有资金以后，需要规划：

- 房租
- 生活费
- 信用卡还款
- 投资
- 储蓄
- 固定费用
- 其他资金安排

规划完成后，需要非常清楚地看到：

预计月底还能剩多少钱。

“月度资金计划”是本产品区别于普通记账 App 的核心功能之一。

---

### Scene 3：日常快速记账

用户在手机上记录日常消费。

目标：

常规情况下尽量在 5～10 秒完成一笔记录。

主要操作：

- 输入金额
- 选择账户
- 选择分类
- 确认日期
- 可选填写备注
- 保存

---

### Scene 4：账户间转账

用户可以记录：

Account A
→
Account B

这种操作只表示资金位置发生变化。

UI 应明确区别：

- 收入
- 支出
- 转账

避免让用户误以为转账属于消费。

---

### Scene 5：信用卡管理

用户可能同时拥有多张信用卡。

需要快速知道：

- 每张卡当前欠款
- 本月新增消费
- 本月计划还款
- 本月实际还款
- 利息 / 手续费
- 还款日期
- 信用额度使用情况
- 还款后的预计剩余欠款

信用卡负债管理是本产品另一个重要核心。

---

### Scene 6：资产管理

用户可能拥有：

- 银行现金
- 现金
- 电子钱包余额
- 股票
- 证券账户
- iDeCo / Pension
- 其他资产

系统需要帮助用户了解：

- 总资产
- 资产构成
- 历史资产变化
- 净资产变化

---

## 6. Design Direction

整体希望：

- Modern
- Clean
- Minimal
- Financial
- Data-driven
- Professional
- Personal

产品应该具有现代 Personal Finance / SaaS Dashboard 的感觉。

但不要过于 Corporate。

---

## 7. 避免的视觉方向

避免：

- 传统银行后台
- 企业 ERP
- 复杂会计软件
- 儿童化
- 游戏化
- 过度鲜艳
- 大面积渐变
- 大量装饰元素
- 每个区域都使用不同颜色
- 过多阴影
- 过度圆角

财务数据本身应该成为页面视觉主体。

---

## 8. 视觉信息优先级

整个产品的信息优先级：

### Priority 1

净资产

### Priority 2

月度预计剩余资金

### Priority 3

信用卡负债

### Priority 4

本月现金流

### Priority 5

资产长期变化

### Priority 6

消费分析

不要让普通的“支出分类饼图”成为整个产品最重要的视觉元素。

---

## 9. Desktop

Desktop 建议采用：

- Left Sidebar
- Top Header
- Main Content
- Responsive Grid
- Metric Cards
- Financial Summary Cards
- Charts
- Data Tables
- Lists

Desktop 应充分利用横向空间，但避免信息过度拥挤。

---

## 10. Mobile

Mobile 应重新组织页面，而不是简单缩小 Desktop。

建议使用：

- Bottom Navigation
- Cards
- Lists
- Bottom Sheets
- Full-screen Quick Entry
- Large touch targets

建议底部导航：

- 首页
- 账本
- ＋记账
- 计划
- 我的

“＋记账”应该是手机端最容易触达的主要操作之一。

---

## 11. Design System

所有页面必须共享统一 Design System：

- Color Tokens
- Typography
- Spacing
- Border Radius
- Shadow
- Cards
- Buttons
- Inputs
- Navigation
- Dialog / Bottom Sheet
- Tables
- Lists
- Charts
- Status Colors

第一批页面确定的视觉语言应该能够继续复用到后续页面。

---

## 12. Financial Color Semantics

颜色主要用于表达业务语义，而不是装饰。

建议：

- Income：柔和绿色
- Expense：中性深色或柔和红色
- Transfer：蓝色
- Investment：紫色 / 蓝紫色
- Liability：橙色 / 柔和橙红
- Net Worth：品牌主色

背景以中性色为主。

Light Mode 优先。

---

## 13. 第一批核心设计

第一阶段不要一次设计完整产品。

优先建立以下页面：

1. Desktop Dashboard
2. Mobile Dashboard
3. Mobile Quick Entry
4. Desktop Monthly Financial Plan
5. Desktop Credit Card Management

这五个页面用于确定整个产品的：

- Layout
- Navigation
- Color System
- Typography
- Card Style
- Chart Style
- Form Style
- Financial Data Hierarchy

设计语言确定后，再扩展其他页面。

---

## 14. 后续页面

Design System 确定以后再设计：

- Transactions
- Accounts
- Assets
- Recurring Rules
- Category Management
- Settings
- Excel Import

---

## 15. 产品核心

设计过程中始终保持以下产品定位：

这个产品的核心不是：

“我今天花了多少钱？”

而是：

“我的钱在哪里、我欠多少钱、这个月的钱应该怎么分、月底预计还能剩多少、我的净资产正在如何变化。”
