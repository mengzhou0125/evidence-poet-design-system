# SVG 视觉规范 · DNA1 图表

本规范是 DNA1（Evidence Poet）设计语言在 SVG 图表上的应用，确保生成的图表与 DNA1 视觉语言一致。

> **Token canonical**: 所有 color / font / spacing 值来自 DNA1 spec（§0 JSON）—— 下表是这些 token 的 SVG-specific 应用；冲突时以 spec 为准。

---

## 色彩系统

提供两套主题，默认使用 Portfolio 主题。用户可在对话中通过 "用黑白灰风格" 或 "用作品集风格" 切换。

### Theme A：Portfolio（作品集风格，默认）

源自 DNA1 色彩系统，保留暖白纸感基调和金色强调线。

| 层级 | Token | 色值 | SVG 用途 |
|------|-------|------|----------|
| 画布底色 | `--bg-primary` | `#F8F7F3` | SVG 背景 `<rect>` fill |
| 主要元素 | `--text-primary` | `#1A1A18` | 标题文字、主要连接线、箭头 fill |
| 正文描述 | `--text-body` | `#555` | 节点内说明文字、流程步骤描述 |
| 次要元素 | `--text-secondary` | `#555` | 副标题、项目映射标注文字 |
| 标签文字 | `--text-muted` | `#888` | 坐标轴标签、分类标签（Courier New） |
| 最弱注释 | `--text-label` | `#717171` | 来源标注、脚注 |
| 强调线 | `--accent-gold` | `#C8A84B` | 关键路径强调线（3px）、项目映射标注框边线 |
| 辅助强调 | `--accent-blue` | `#527590` | 可选：次要路径强调、CTA 关联标注 |
| 区域填充 | `--surface-card` | `#FFFFFF` | 节点框/区块背景 fill |
| 边框分隔 | `--border` | `#EDE9E2` | 节点边框 stroke、区域分隔线 |
| 占位区域 | `--surface-placeholder` | `#D8D5D0` | 空白占位区域背景 |

**Portfolio 主题特有规则：**
- 项目映射标注使用 `#C8A84B`（金色）虚线框 + `#555` 斜体文字，替代黑白灰主题的灰色虚线框
- 关键路径（论文核心贡献链条）可使用 `#C8A84B` 3px 实线强调，与普通连接线形成视觉层级
- 强调线仅用于 1-2 条最重要的路径，不可滥用

### Theme B：Monochrome（黑白灰风格）

纯黑白灰学术风格，适用于正式学术场景或需要嵌入纯文本语境时。

| 层级 | Token | 色值 | SVG 用途 |
|------|-------|------|----------|
| 画布底色 | — | `#FFFFFF` | SVG 背景 |
| 主要元素 | — | `#1A1A18` | 标题文字、主连接线、箭头 |
| 正文描述 | — | `#444` | 节点内说明文字 |
| 次要元素 | — | `#555` | 副标题、项目映射标注文字及虚线框 |
| 标签文字 | — | `#888` | 坐标轴标签、分类标签 |
| 最弱注释 | — | `#999` | 来源标注、脚注 |
| 区域填充 | — | `#F5F5F3` | 节点框/区块背景 |
| 边框分隔 | — | `#E0DDD8` | 节点边框、区域分隔线 |

**Monochrome 主题特有规则：**
- 项目映射标注使用 `#555` 虚线框 + `#555` 斜体文字
- 无强调色，所有路径统一使用 `#1A1A18` 实线
- 通过线宽变化（1px vs 1.5px vs 2px）建立层级，而非颜色

---

## 字体系统

SVG 中字体需内嵌引用或使用系统 fallback。三级字体体系映射自 DNA1：

### 标题 — 衬线字体

```
font-family: 'Playfair Display', Georgia, serif
```

| 场景 | 字号 | 字重 | 颜色(Portfolio) | 颜色(Mono) |
|------|------|------|----------------|------------|
| 图表主标题 | 15-16px | 700 | `#1A1A18` | `#1A1A18` |
| 图表副标题 | 13px | 400 | `#555` | `#555` |

#### Serif 大数字 · lining + tabular figures（强制）

**规则**：任何 SVG `<text>` 用 Playfair Display（或其他衬线字体）渲染 **≥24px** 的**数字**，且与字母 / 符号 / 单位（`pp` / `M` / `%` / `×` 等）**同行混排**时，**必须**启用 lining figures + tabular figures。

**原因**：Playfair Display 默认使用 **oldstyle figures**（旧式数字 · 有 ascender / descender，如 3 7 9 下伸、6 8 上伸），与字母 baseline 不齐，大字号下"高低不齐"视觉非常突出。Lining figures 让所有数字共享 cap-height baseline，与混排字母对齐；tabular figures 让数字等宽（不同 digit 占同样 horizontal advance），多个 metric 并排时纵向对齐。

**SVG 实现**（任选其一，等价）：

```xml
<!-- 方式 A · CSS property（推荐，与 design.md / theme-dna1.css 一致） -->
<text x="40" y="100" style="font-family: 'Playfair Display', Georgia, serif;
                             font-size: 36px;
                             font-variant-numeric: lining-nums tabular-nums;">
  4.2pp
</text>

<!-- 方式 B · OpenType feature settings（fallback for renderers that ignore font-variant-numeric） -->
<text x="40" y="100" style="font-family: 'Playfair Display', Georgia, serif;
                             font-size: 36px;
                             font-feature-settings: 'lnum' 1, 'tnum' 1;">
  4.2pp
</text>
```

**何时**：metric tile 大数字 · KPI display · 表头中的数字摘要 · 任何 ≥24px 衬线数字 + 混排字母/符号。

**何时不需要**：纯数字（无混排字母）且不并排——仅看 oldstyle figures 节奏本身没问题；正文 ≤14px 衬线数字（小字号高低差不显著）。


### 正文 — 无衬线字体

```
font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif
```

| 场景 | 字号 | 颜色(Portfolio) | 颜色(Mono) |
|------|------|----------------|------------|
| 节点内主要文字 | 12px | `#1A1A18` | `#1A1A18` |
| 节点内说明文字 | 11px | `#555` | `#444` |
| 项目映射标注 | 10px, italic | `#555` | `#555` |
| 来源/脚注 | 9px | `#717171` | `#999` |

### 标签 — 等宽字体

```
font-family: 'DM Mono', 'Courier New', ui-monospace, monospace
```

| 场景 | 字号 | 样式 | 颜色(Portfolio) | 颜色(Mono) |
|------|------|------|----------------|------------|
| 列标题/轴标签（图表主要分类） | 11px | Title Case, letter-spacing: 0.06em | `#888` | `#888` |
| 侧边注释/维度标签（辅助信息） | 10px | UPPERCASE, letter-spacing: 0.08em | `#717171` | `#999` |

### SVG 内嵌字体引用

在 SVG 的 `<defs>` 内使用 `<style>` 嵌入 Google Fonts：

```xml
<defs>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&amp;family=Playfair+Display:wght@400;700&amp;family=Plus+Jakarta+Sans:wght@400;500;600&amp;display=swap');
  </style>
</defs>
```

**降级策略：** 如果 SVG 将在离线环境使用（如嵌入 PDF），省略 `@import`，直接使用 fallback 字体（Georgia / Arial / Courier New）。生成时询问用户使用场景。

---

## 几何与形态

所有规则直接继承 DNA1 风格指南：

- **圆角：** `border-radius` 一律为 0。所有 `<rect>` 元素 `rx="0" ry="0"`，无例外
- **边框：** 统一 `1px solid`，颜色取 `--border` token
- **强调线（仅 Portfolio 主题）：** `3px solid #C8A84B`，用于关键路径标记
- **阴影/渐变：** 禁止使用。不允许 `<feDropShadow>`、`<linearGradient>` 或任何装饰性效果
- **连接线：** 普通连接 1.5px，分隔线 1px
- **箭头标记(marker)：** 使用 `<polygon>` 实心三角形。标准定义：

```xml
<!-- Portfolio 主题 -->
<marker id="arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
  <polygon points="0,0 7,2.5 0,5" fill="#1A1A18"/>
</marker>
<marker id="arrow-accent" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
  <polygon points="0,0 7,2.5 0,5" fill="#C8A84B"/>
</marker>

<!-- Monochrome 主题 -->
<marker id="arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
  <polygon points="0,0 7,2.5 0,5" fill="#1A1A18"/>
</marker>
<marker id="arrow-secondary" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
  <polygon points="0,0 7,2.5 0,5" fill="#555"/>
</marker>
```

### 树形分叉连接线

当一个父元素连接多个子元素时，禁止从父元素底部直接拉多条线到子元素（会导致线条重叠）。

正确做法：
1. 父元素底部出一条短垂直线到分叉点（间距 5-7px）
2. 分叉点水平展开一条横线
3. 横线上每个子元素中心位置各出一条短垂直线连到子元素顶部（间距 5-7px）

---

## 间距与信息密度

### 垂直 Spacing Tokens（5-step scale · 强制使用，禁止 ad-hoc）

**所有垂直间距（两个元素之间的 y-gap）必须从以下 5 个 token 中选取一个。禁止硬编码其他数值。**

| Token | 值 | 语义 | 典型用途 |
|-------|-----|------|---------|
| **VS_TIGHT** | 8px | 同一语义单元内 | block 标题 ↔ body · 紧密相关 items 之间 · Y 轴 label ↔ 标签值 |
| **VS_COMPACT** | 12px | block 内部呼吸空间 | divider 前后的上下文 · row-to-row · caption 与 chart 之间 |
| **VS_SECTION** | 16px | 同一功能区内不同 section | 子标题之间 · 并列 block 之间 |
| **VS_MAJOR** | 24px | 不同功能区之间 | diagram 区 ↔ legend 区 ↔ conclusions 区 |
| **VS_MARGIN** | 30px | 画布顶底 margin | MARGIN_TOP 与 MARGIN_BOTTOM |

**语义层级**：

```
VS_TIGHT   (紧)   · 同一单元内 · "这两个元素 belong together"
VS_COMPACT (松)   · block 内   · "同一 block 的不同部分"
VS_SECTION (段)   · section 间 · "block 和 block 之间，有边界感"
VS_MAJOR   (区)   · 功能区间   · "不同功能模块，读者视觉需要 reset"
VS_MARGIN  (边)   · canvas 边  · "内容 ↔ 画布边缘"
```

**选择决策树**：
```
两个元素是否在同一语义单元里？
├─ 是 → VS_TIGHT (8)
└─ 否 → 是否在同一 block 里？
        ├─ 是 → VS_COMPACT (12)
        └─ 否 → 是否在同一功能区里？
                ├─ 是 → VS_SECTION (16)
                └─ 否 → 不同功能区？
                        ├─ 是 → VS_MAJOR (24)
                        └─ canvas 边 → VS_MARGIN (30)
```

**实现规则**：
- 代码里**必须**以命名常量 `VS_TIGHT` / `VS_COMPACT` / `VS_SECTION` / `VS_MAJOR` / `VS_MARGIN` 引用，不硬编码数字
- 每次 `y += <gap>` 只能 += token（或 token 的简单和，如 `VS_SECTION + some_text_height`）
- 文本 baseline-to-baseline 间距：`text_height × line_factor + token_gap`（text_height 是 font_size × 1.2~1.4）
- **禁止**出现 `y += 18` / `y += 10` 这类魔数——每个都要能说出它对应哪个 token

### Token 决策规则（每个垂直 gap）

**核心框架**：图表分 **core**（数据主体，信息密度高）和 **non-core**（说明性内容，解释性）两个 region。对每个 gap（两个视觉元素之间的空间）按序问 5 个问题：

| 序号 | 问题 | Token | 值 |
|---|---|---|---|
| 1 | 这个 gap **在一个 prose 块内部**？（title ↔ body / title pair） | **VS_TIGHT** | 8 |
| 2 | 这个 gap **至少一侧触碰到 core content**？ | **VS_SECTION** | 16 |
| 3 | 这个 gap **两侧都在 non-core 区**？ | **VS_MAJOR** | 24 |
| 4 | 这个 gap 是 **canvas 边** ↔ 内容？ | **VS_MARGIN** | 30 |
| 5 | 这个 gap 是 **row 内部** / **row-to-row 分隔**？ | **由 ROW_H 本身管辖，不用 token** | — |

按序应用第一个匹配的规则（例：一个 prose 内部的 title↔body 就算在 non-core 区，也用 VS_TIGHT 不用 VS_MAJOR；第 1 条优先于第 3 条）。

### Boundary div 的**非对称** padding

关键：**boundary div**（一侧 core、另一侧 non-core 的 divider，如 Div1 / Div3）**两侧 padding 不对称**：

- **核侧** padding → VS_SECTION (16)（gap 触碰 core content）
- **非核侧** padding → VS_MAJOR (24)（gap 两侧都在 non-core）

这不是矛盾——每条 gap 单独分类：上方 gap 看它两侧是什么、下方 gap 看它两侧是什么。Div1 的 padding 不是"Div1 的 padding"这一个值，而是"Div1 上方 gap = 这对 subtitle/Div1 的分类"和"Div1 下方 gap = 这对 Div1/col header 的分类"这两个独立决策。

### Div 分类总表（按 gap 而非按 div 整体）

| Div | 上方 gap（分类）| 上方 token | 下方 gap（分类）| 下方 token |
|---|---|---|---|---|
| **Div1**（header ↔ core boundary）| subtitle (non-core) ↔ Div1 · 两侧都 non-core | VS_MAJOR | Div1 ↔ col header (core) · 触碰 core | VS_SECTION |
| **Div2**（col header ↔ data rows · 纯 core 内）| col sub (core) ↔ Div2 · 触碰 core | VS_SECTION | Div2 ↔ first row (core) · 触碰 core | VS_SECTION |
| **Div3**（core ↔ footer boundary）| last row (core) ↔ Div3 · 触碰 core | VS_SECTION | Div3 ↔ POP title (non-core) · 两侧都 non-core | VS_MAJOR |
| **Div4**（footer 内部 · 纯 non-core）| MS entries (non-core) ↔ Div4 · 两侧都 non-core | VS_MAJOR | Div4 ↔ CONC title (non-core) · 两侧都 non-core | VS_MAJOR |

**视觉效果**：
- Core 区（Div2 周围 + Div1 下方 + Div3 上方）spacing 紧凑（16）—— 数据密度高、扫描连贯
- Non-core 区（Div1 上方 + Div3 下方 + Div4 两侧 + 无 div 的 prose 间距）spacing 宽松（24）—— 说明内容各自独立
- Boundary div（Div1 / Div3）padding 非对称 → 视觉上"一面紧贴数据、一面留呼吸空间"

### Row 内部 rhythm 是独立规则

**重要例外**：row 的内部 layout（text baseline 位置 / marker 位置 / row-to-row 分隔线位置）**由 ROW_H 本身管辖**，**不受** VS_* token 约束。

原因：row 是"块"结构，它有自己的内部 rhythm（文字、marker、breathing padding 的相对位置），这种 rhythm 服务于 row-to-row 视觉连续性，**不应该**被"和其他 region 之间的 spacing token"统一管制。如果强制用 VS_TIGHT (8) 当 row 内部 text↔marker 间距，会把 row 压得很紧、视觉"非常丑"。

**规则**：
- Row 的 `y_top` 和 `y_bottom` 由 token 管（与前后 block 的 gap 是 VS_* token）
- Row 的**内部**（text 位置、marker 位置、text↔marker 距离、row 底的 separator line 位置、相邻 row 之间的视觉节奏）由 ROW_H 和 row 内部布局自行决定

**副作用**：这会让 row block 的"结构 gap"和"视觉 gap"不完全等价——row 有内部 top/bottom padding 时，"Div → first row y_top" 是 VS_SECTION (16) 结构距离，但 "Div → first visible content" 视觉距离会略大（加上 row 顶 padding）。这是**预期行为**，不是 bug。Row 的设计者有权为 row 选择合适的内部 rhythm。

Example from v9 framework_visualizer：ROW_H=68，行内 text 在 y_top+20、marker 在 y_top+46，每行视觉 rhythm 宽松。Div2 → first row visible gap ≈ 26px（16 结构 + 10 row 顶 padding）——这不是 bug，是 row 节奏的体现。

### 结构 gap ≠ 视觉 gap · 理解与接受

**事实**：VS_* token 管的是**结构距离**（两个 block 的 `y_bottom` 到 `y_top` 之间），**不是**"最后一个 rendered element 到第一个 rendered element 的 visible 距离"。如果 block 有内部 top/bottom padding（比如 row 内部的 rhythm），block 边界到 visible content 之间会有额外距离。

**这是特性不是 bug**。有些 block（row / card / cell 等有内部结构的单元）**需要**内部 padding 来保持自己的节奏。强制 visible = structural 会破坏 block 的内部视觉语言。

**什么时候需要管 visible gap**：
- **普通 prose block**（单段文字、单条 title、无内部 rhythm 的短 content）：应该让 visible 接近 structural——这类 block 的 `y_top` 就是文字 visible top（用 baseline 推算）
- **结构化 block**（row / card / cell 等有多 element + 自己 padding 节奏的单元）：接受 visible 略大于 structural——block 设计者为内部视觉体验做的 trade-off

**规则**：
- Prose block 默认尽量 visible ≈ structural（通过 baseline 推算让第一行文字 visible top 贴近 `y_top`）
- 结构化 block 保留内部 rhythm，**不应**为了让 visible = structural 而牺牲内部节奏

**自查**：生成后，对每个 "div → block" 边界检查是否 visible gap 比 token 值大太多：
- 大 3-15px：在合理范围，来自 block 的 font ascent / 内部 padding
- 大 >15px：可能 block 内部有可以优化的多余 padding（但如果是 intentional 节奏则保留）

如果是 prose block 出现大 visible gap，检查是否多写了 padding；如果是结构化 block（row / card），问自己"这内部节奏是不是必要的"——如果必要就接受，不必要就收紧。

### 水平间距与信息密度

| 规则 | 值 | 说明 |
|------|-----|------|
| 画布边距 | 左右 40px，上下 VS_MARGIN (30px) | 内容区域与画布边缘的 padding |
| 列间距 | 列宽的 10-15% | 图形元素之间 |
| Legend 行高 | VS_SECTION (16-18px) | 紧凑排列 |
| 分隔线宽度 | = CORE_WIDTH | 1px `--border` 色 |

### 区域定义与垂直对齐

一张图由多个水平区域(region)从上到下堆叠组成：

```
标题区域 → 图表区域 → 映射/说明区域（legend / project mapping）
```

- 图表区域的左右边界由该区域内所有视觉元素的最外沿决定
- 所有区域必须共享同一左右边界，形成严格的垂直左对齐
- 区域之间用 1px `--border` 色分隔线连接
- 画布宽度 = 左边距(40px) + 内容区域宽度 + 右边距(40px)

### 画布大小

不固定尺寸，根据内容决定：
- 横向图表（矩阵、对比图）：通常 700-800px 宽
- 纵向图表（流程图、层级图）：通常 500-600px 宽
- 高度按内容撑开，**禁止出现超过内容高度 15% 的空白区域**

### 画布尺寸决定顺序（强制）

**这个决定顺序是规则，不是建议**——错了会导致 canvas 被 prose 反向 drive、layout 结构失焦。

**Step 1 · 先确定 `CORE_WIDTH`——核心图区域需要的宽度**
  - 根据 diagram 核心内容（matrix / flow / hierarchy / axis）计算最小宽度
  - 考虑最长 label / 最宽 column header / 最宽 cell content
  - 这是一张图的 **唯一 width anchor**

**Step 2 · Canvas 宽度 = `CORE_WIDTH + 2 × MARGIN_L`**
  - Canvas width 是 CORE_WIDTH 的 derivative，不是独立参数
  - 不允许因为 prose block 需要更多空间就增大 canvas width——应该让 prose wrap 在 CORE_WIDTH 内

**Step 3 · 所有 prose 块的 `width` 从 CORE_WIDTH 派生**
  - Full-width prose（title / subtitle / conclusions / source / 整段 annotation / divider）：`width = CORE_WIDTH`
  - Multi-column prose（legend 里 N 列 entries）：total block `width = CORE_WIDTH`，内部 split 成 N 列，每列 `width = CORE_WIDTH / N`（减去必要 padding）
  - **禁止** 独立定义 prose width（如 "700px" / "720px" 这种硬编码）——必须是 CORE_WIDTH 的表达式

**Step 4 · Canvas 高度 top-down 累加，不反向 bump**
  - 从 y=MARGIN_TOP 开始，按内容 stack 顺序累加每个元素的 height + gap
  - 最终 `CANVAS_H = y + MARGIN_BOTTOM`
  - **禁止** 写 `CANVAS_H = 固定值`然后发现内容溢出再 bump——这是反向 drive，违反 Step 1-3 建立的 architecture
  - 如果某 prose block（如 conclusions）需要更多行，**增加它自己的 height 预算**，canvas 自然变高；而不是先定 canvas，再让 block 去 fit 有限空间
  - 每次修改后，验证 content-bottom 应紧贴 CANVAS_H - MARGIN_BOTTOM（waste < 5% 理想；< 15% 可接受）

**反模式**（明确禁止）：
- ❌ `CANVAS_W = 820` 然后为了省事各地用 `W - 2*MARGIN` 作为 prose width
- ❌ 固定 canvas H，再调整 prose height 去 fit
- ❌ multi-column legend 里自定义 `entry_width = 245` 而不是 `CORE_WIDTH / 3`
- ❌ "Canvas 不够大？bump 一下 H" 这类反向调节
- ❌ `y += 18` / `y += 22` 这类 ad-hoc 垂直 gap——必须用 VS_* token（见"垂直 Spacing Tokens"）
- ❌ `height="112"` 然后发现实际内容只需 72px 留大片空白——按实际内容 line count 精确估算，不预留远超所需的 buffer

### 文字换行规则（全局强制）

**通则**：所有**可能超出容器宽度**的 prose 文字（描述、图注、annotation、结论、source、legend examples、说明段落等）**必须**使用 `<foreignObject>` + HTML `<div>` 实现自动换行，让文字 fill 当前行边界并在触达边界时换行。

**判断标准**：如果文字长度有可能超过容器（cell / column / legend entry / canvas content width）的宽度，就要用 foreignObject。即使一次生成时文字短，未来修改 / 翻译 / 数据变化可能使其变长——**按最坏情况设计**。

**强制用 foreignObject 的场景**（非穷尽）：
- 图注 / 映射文字 / 说明段落
- Legend entry 里的示例列表（product names / author names / URL 等）
- Key conclusions / findings / takeaways
- Source / citation 行
- Annotation / footnote / caveat
- 任何多句或长于 ~60 字符的 prose

**可用 `<text>` 的场景**（短、确定单行、受容器约束）：
- 标题 / 副标题（Playfair Display 单行）
- 列标题 / 轴标签 / 坐标标签（DM Mono, 短 label）
- 节点内单行 label（如 `[Snapshot]` / `[D1]`）
- 单字符 / 符号 marker（如 `[M]` / `[A]` / `[P]`）
- 单行分类 tag

**语义列表用单个 foreignObject + HTML 列表元素**：一组相关的 bullet points / numbered items（如 key conclusions / findings / takeaways / action items）**是一个语义单元**，必须用**一个** `foreignObject` 包住整个 `<ol>` 或 `<ul>`，让 HTML 本身 render 编号 + 自动换行。每项长了 item 内自己换行，不影响其他 items。

```xml
<!-- ✓ 正确：单 foreignObject + ol -->
<foreignObject x="40" y="700" width="740" height="120">
  <div xmlns="http://www.w3.org/1999/xhtml">
    <ol style="margin:0; padding-left:18px; font-size:10px; line-height:1.5;">
      <li style="margin-bottom:6px;">第一条结论 ...</li>
      <li style="margin-bottom:6px;">第二条 ...</li>
      <li>第三条 ...</li>
    </ol>
  </div>
</foreignObject>

<!-- ❌ 错误：每条独立 foreignObject -->
<foreignObject x="40" y="700" width="740" height="30"><div>...1...</div></foreignObject>
<foreignObject x="40" y="732" width="740" height="30"><div>...2...</div></foreignObject>
<!-- 问题：修改后某条多一行会遮挡下一条；无语义整体感 -->
```

**模板**（普通 prose 段落）：

```xml
<foreignObject x="[左边距]" y="[起始y]" width="CORE_WIDTH 或它的派生值" height="[预估高度]">
  <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 10px; color: #555; line-height: 1.5;">
    内容文字
  </div>
</foreignObject>
```

**关键参数**：
- `width`：**必须**是 CORE_WIDTH 或其派生（见前节 "画布尺寸决定顺序"）。**禁止**硬编码任意 px 值
- `height`：**必须**从内容 compute，不允许硬编码（见下"Prose height 必须 content-driven"）
- `line-height: 1.5`：固定值，与 DNA1 字体系统一致
- 文字内的 em-dash / en-dash 用 **Unicode 字符直接嵌入**（`\u2014` / `\u2013`），**不要用 HTML entity**（`&#8212;` / `&#8211;`）——避免被 color regex 或其他工具误解析

### Prose height 必须 content-driven（强制）

**技术限制**：SVG `<foreignObject>` 必须声明显式 `height`——它不像 HTML `<div>` 能 auto-size。但这**不等于**可以拍脑袋预留一个 buffer 值。

**规则**：从**内容特征 compute**预估 height，绝不硬编码。

**标准 helper**（Python，两个 skill 共用）：

```python
import math

CHAR_WIDTH_FACTOR = 0.5  # Plus Jakarta Sans 经验值

def estimate_prose_height(text, width_px, font_size=10, line_factor=1.5, safety=1.1):
    """单段 prose 的预估高度"""
    avg_char_width = font_size * CHAR_WIDTH_FACTOR
    chars_per_line = width_px / avg_char_width
    lines = math.ceil(len(text) / chars_per_line)
    return math.ceil(lines * font_size * line_factor * safety)

def estimate_list_height(items, width_px, font_size=10, line_factor=1.5,
                         item_margin_bottom=6, ol_padding_left=18, safety=1.1):
    """ol / ul 列表的预估高度"""
    avg_char_width = font_size * CHAR_WIDTH_FACTOR
    effective_width = width_px - ol_padding_left
    chars_per_line = effective_width / avg_char_width
    line_height = font_size * line_factor
    total = 0
    for i, item in enumerate(items):
        item_lines = math.ceil(len(item) / chars_per_line)
        total += item_lines * line_height
        if i < len(items) - 1:
            total += item_margin_bottom
    return math.ceil(total * safety)
```

**使用**：
```python
# ✓ 正确：从内容 compute
CONC_BODY_H = estimate_list_height(conclusion_items, CORE_WIDTH, font_size=10)
SOURCE_H = estimate_prose_height(source_text, CORE_WIDTH, font_size=9)

# ❌ 错误：硬编码 + 拍脑袋 buffer
CONC_BODY_H = 112  # "应该够了吧"——结果大片空白
```

**工作流**：
1. 先定义内容（`conclusion_items = [...]` / `source_text = "..."`）
2. 用 helper compute height（一次计算，代码清晰）
3. 用 computed height 参与 top-down layout 计算
4. **内容变化时**，helper 自动 recompute，layout 自动 adjust——不需要手动 rebuffer

**安全 margin**：helper 已内置 `safety=1.1`（10%）。这足以 cover：
- Char-width 估算偏差（Plus Jakarta Sans 不同字形宽度差异）
- 不同浏览器 / SVG renderer 的字体 rendering 差异
- 标点 / 空格 / 特殊字符的 edge case

**避免过度 buffer**：不要自己额外加 safety。10% 已经足够；加 20%+ 会回到 "大片空白" 的反模式。

**绝对禁止**：
- ❌ 用多个 `<text>` 元素手动断行来模拟换行（无法自动 reflow，翻译 / 修改后失效）
- ❌ 把长文字一行塞进 `<text>` 让它溢出画布
- ❌ 把一组语义相关的 bullet / numbered items 拆成多个独立 foreignObject
- ❌ 把 `width` 设为估算的"刚好够用"或硬编码（如 `width="720"`）——必须是 `CORE_WIDTH` 或 `CORE_WIDTH / N` 这种表达式

---

## 主题切换

默认使用 Portfolio 主题。用户说 "两个主题都要" 时同时生成两份。

Python 实现（THEMES dict、文件命名规则）见 `generation-method.md`。
