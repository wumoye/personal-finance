# Stitch Task

## Desktop Dashboard Concept Design

请基于 Personal Finance Manager 的 Product Design Brief，建立第一版完整 UI 视觉方向。

当前任务：

**只设计 Desktop Dashboard。**

暂时不要设计其他页面。

---

# 1. Dashboard 目标

这是一个个人资金管理系统，而不是普通消费记账 App。

用户进入 Dashboard 后，应当能够立即回答：

1. 我的净资产是多少？
2. 我的总资产是多少？
3. 我的总负债是多少？
4. 本月收入多少？
5. 本月支出多少？
6. 本月投资多少？
7. 本月资金计划执行情况如何？
8. 本月底预计还能剩多少钱？
9. 信用卡总共欠多少钱？
10. 最近一年净资产如何变化？

---

# 2. Desktop Layout

采用现代 SaaS Dashboard Layout。

建议结构：

Left Sidebar

-

Top Header

-

Main Dashboard Content

---

# 3. Sidebar

建议包含：

- Dashboard
- 月度计划
- 收支记录
- 信用卡
- 账户
- 资产
- 设置

当前：

Dashboard

处于 Active 状态。

Sidebar 应简洁，不需要复杂二级菜单。

---

# 4. Top Header

顶部区域可以包含：

- 当前月份
- 快速新增
- 用户区域

例如：

2026年8月

＋ 新增

User Avatar

不要让 Header 占据过多纵向空间。

---

# 5. 第一视觉层：净资产

Dashboard 最重要的数据：

净资产。

示例数据：

净资产

¥7,530,000

+3.2% vs 上月

它应该拥有整个 Dashboard 中最高的视觉权重。

同时显示：

总资产

¥8,650,000

总负债

¥1,120,000

用户应该在几秒内理解自己的整体财务状态。

---

# 6. 第二视觉层：本月现金流

显示：

本月收入

¥450,000

本月支出

¥185,000

本月投资

¥100,000

预计月底可用余额

¥165,000

其中：

**预计月底可用余额**

应该具有较高视觉权重。

因为这是本产品区别于普通记账 App 的重要数据。

---

# 7. 月度计划状态

Dashboard 应提供本月资金计划的简要执行状态。

例如：

本月计划

计划支出 ¥200,000

实际支出 ¥185,000

剩余 ¥15,000

可以使用：

Progress Bar

或其他非常直观的表现方式。

不要让这个区域变成复杂预算表。

完整计划在“月度计划”页面查看。

---

# 8. 净资产趋势

显示：

最近 12 个月净资产变化。

推荐：

Line Chart

用户应该能够快速看出：

净资产整体是在增加、下降还是保持稳定。

可以预留：

6个月

12个月

全部

的时间范围切换。

---

# 9. 资产构成

显示主要资产类别，例如：

- 银行 / 现金
- 投资
- Pension / iDeCo
- 其他

可以使用：

Donut Chart

或者其他简洁的资产配置图。

不要让图表占据过多页面空间。

---

# 10. 信用卡负债

需要有明显但不过度警示的信用卡负债区域。

显示：

信用卡总负债

¥1,120,000

以及多张信用卡的简要信息。

例如：

乐天信用卡

当前欠款 ¥520,000

本月计划还款 ¥80,000

还款日 8月27日

---

PayPay Card

当前欠款 ¥200,000

本月计划还款 ¥50,000

还款日 8月27日

用户应该可以从这里进入完整信用卡管理页面。

---

# 11. 本月主要支出

显示几个主要消费分类即可。

例如：

餐饮

房租

交通

娱乐

其他

这个区域属于辅助信息。

不要让消费分类图成为 Dashboard 的核心视觉。

---

# 12. 快捷操作

Dashboard 提供：

- 记一笔
- 转账
- 月度计划
- 信用卡还款

快捷操作应该容易找到，但不要抢过核心财务数据。

---

# 13. Visual Direction

整体风格：

Modern

Clean

Minimal

Financial

Data-driven

Professional but personal

Light Mode

---

# 14. 避免

避免：

- Traditional Banking Dashboard
- Enterprise ERP
- Accounting Software Style
- Game-like UI
- Heavy Gradients
- Excessive Shadows
- Excessive Rounded Cards
- Excessive Colors
- Decorative Charts
- Information Overload

---

# 15. Color

整体使用中性色背景。

主品牌色可以考虑：

- Blue
- Indigo
- Blue Violet
- 其他偏冷的现代 Finance 色系

语义颜色：

Income：
柔和绿色

Liability：
柔和橙红

Transfer：
蓝色

Investment：
紫色 / 蓝紫色

颜色用于表达信息，而不是单纯装饰。

---

# 16. Component Language

请在这个 Dashboard 中建立后续页面能够继续复用的组件语言：

- Sidebar
- Top Navigation
- Metric Card
- Financial Summary Card
- Chart Card
- Credit Card Summary
- Action Button
- Filter / Selector
- Progress Indicator
- Typography
- Spacing
- Border Radius
- Shadow

---

# 17. Responsive Thinking

当前只输出：

**Desktop Dashboard**

但建立的 Design System 必须能够继续适配：

- Mobile Dashboard
- Mobile Quick Entry
- Desktop Monthly Financial Plan
- Desktop Credit Card Management

不要采用只能在 Desktop 成立的特殊视觉方案。

---

# 18. 当前输出

请生成：

**一个完整、高保真的 Desktop Dashboard 概念设计。**

本次重点确定：

- Layout
- Design System
- Color System
- Typography
- Card Style
- Chart Style
- Financial Data Hierarchy
- Navigation Style

暂时不要生成其他页面。

不要把产品重新设计成普通消费记账应用。
