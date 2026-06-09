# SVG 生成方法与验证流程

本文档规定图表 SVG 的生成方式、验证步骤和错误恢复策略。借鉴自 fireworks-tech-graph（Python list 方法）和 excalidraw-diagram-skill（渲染-验证循环）。

---

## 生成方式：Python List 方法（强制）

**禁止**直接在 bash 中用 `echo` 或 heredoc 写 SVG。**必须**使用 Python 脚本逐行构建 SVG。

原因：LLM 直接生成长 SVG 字符串时，容易出现字符截断、引号错配、标签未关闭等问题。Python list 方法让每一行独立可验证。

### 标准模板

```python
python3 << 'PYEOF'
import os, re

# ── Output Dir (created by SKILL.md step 1) ──
# paper_title = "Paper English Title"
# slug = re.sub(r'[^a-z0-9\s-]', '', paper_title.lower())
# slug = re.sub(r'\s+', '-', slug).strip('-')
# slug = slug[:60].rsplit('-', 1)[0] if len(slug) > 60 else slug
# output_dir = os.path.join(WORKSPACE, 'generated-assets', slug)
# os.makedirs(output_dir, exist_ok=True)

# ── Theme Config ──
theme = "portfolio"  # 或 "monochrome"

THEMES = {
    "portfolio": {
        "bg": "#F8F7F3",
        "text_primary": "#1A1A18",
        "text_body": "#444",
        "text_secondary": "#555",
        "text_muted": "#888",
        "text_label": "#999",
        "accent": "#C8A84B",
        "accent_secondary": "#8BA7C0",
        "surface": "#FFFFFF",
        "border": "#EDE9E2",
        "font_import": "@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');",
    },
    "monochrome": {
        "bg": "#FFFFFF",
        "text_primary": "#1A1A18",
        "text_body": "#444",
        "text_secondary": "#555",
        "text_muted": "#888",
        "text_label": "#999",
        "accent": "#1A1A18",
        "accent_secondary": "#555",
        "surface": "#F5F5F3",
        "border": "#E0DDD8",
        "font_import": "",  # Monochrome 使用系统 fallback 字体
    },
}

t = THEMES[theme]

# ── Canvas WIDTH (chart-type driven · known up-front) ──
CANVAS_WIDTH = 700   # 根据图表类型调整：横向 700-800, 纵向 500-600
MARGIN_TOP = 30
MARGIN_BOTTOM = 30

# ── STEP 1: build BODY content first · top-down y accumulator ──
# CANVAS_HEIGHT 不是固定值——它从内容推导（见 svg-spec.md §canvas · 禁止写固定值）。
body = []
y = MARGIN_TOP
# ── 在此插入图表内容 ──
# 每个元素单独 body.append() 一行，每次推进 y
#   body.append(f'  <text x="{X}" y="{y}" ...>...</text>')
#   y += ELEMENT_HEIGHT + GAP
# 最后一个元素结束后，y 停在 content-bottom

# ── STEP 2: CANVAS_HEIGHT derived from content (禁止写固定值再 bump · svg-spec.md) ──
CANVAS_HEIGHT = y + MARGIN_BOTTOM

# ── STEP 3: assemble header — dims now known → direct f-string interpolation ──
# ⚠️ NEVER use a {{W}}/{{H}} placeholder + .replace(): inside an f-string {{W}} collapses
#    to {W}, so a later .replace('{{W}}', ...) silently fails to match → broken SVG dims.
#    Assembling the header AFTER CANVAS_HEIGHT is known makes placeholders unnecessary.
#
# ⚠️ DIMENSION INTERPOLATION — TWO places, BOTH mandatory · DO NOT skip either:
#    (a) the <svg> element's width / height / viewBox      ← STEP 3 below
#    (b) the background <rect>'s width / height            ← STEP 4 below
#    These are ~20 lines apart (the <defs> block sits between them). A common bug is
#    interpolating (a) correctly but leaving (b) as a literal {W}/{H} → background
#    <rect> has non-numeric attrs → it does NOT render → SVG ships with no background.
#    Use the SAME f-string `{CANVAS_WIDTH}` / `{CANVAS_HEIGHT}` variables in BOTH.
#    STEP 6's pre-write validation will hard-fail if either is missed — but get it
#    right here so you never reach that failure.
lines = []
lines.append('<?xml version="1.0" encoding="UTF-8"?>')
# (a) <svg> header — interpolate width / height / viewBox from CANVAS_WIDTH / CANVAS_HEIGHT
lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_WIDTH}" height="{CANVAS_HEIGHT}" viewBox="0 0 {CANVAS_WIDTH} {CANVAS_HEIGHT}">')

# Defs: fonts + markers
lines.append('  <defs>')
if t["font_import"]:
    lines.append(f'    <style>{t["font_import"]}</style>')
lines.append(f'    <marker id="arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">')
lines.append(f'      <polygon points="0,0 7,2.5 0,5" fill="{t["text_primary"]}"/>')
lines.append(f'    </marker>')
if theme == "portfolio":
    lines.append(f'    <marker id="arrow-accent" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">')
    lines.append(f'      <polygon points="0,0 7,2.5 0,5" fill="{t["accent"]}"/>')
    lines.append(f'    </marker>')
else:
    lines.append(f'    <marker id="arrow-secondary" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">')
    lines.append(f'      <polygon points="0,0 7,2.5 0,5" fill="{t["accent_secondary"]}"/>')
    lines.append(f'    </marker>')
lines.append('  </defs>')

# ── STEP 4: background <rect> — SAME interpolation as the <svg> header (STEP 3) ──
# ⚠️ The width / height here MUST be the f-string vars {CANVAS_WIDTH} / {CANVAS_HEIGHT},
#    IDENTICAL to viewBox above. Leaving a literal {W}/{H} → rect attrs are non-numeric
#    → background does not render. This line is the #1 missed-substitution site.
lines.append(f'  <rect width="{CANVAS_WIDTH}" height="{CANVAS_HEIGHT}" fill="{t["bg"]}"/>')

# Body content (built in STEP 1) + close
lines.extend(body)
lines.append('</svg>')

# ── STEP 5: assemble final string ──
svg_content = '\n'.join(lines)

# ── STEP 6: PRE-WRITE VALIDATION (MANDATORY · fail loud, never ship a broken SVG) ──
# Reject the output if ANY unsubstituted template placeholder survives. This catches
# the missed-{W}/{H} background-<rect> bug and any future placeholder leak. Run this
# BEFORE the open()/write() below — if it raises, fix the template and re-run; do NOT
# write the file.
import re as _re_validate
_leaks = _re_validate.findall(r'\{[A-Za-z_][A-Za-z0-9_]*\}|%%[A-Za-z_]+%%', svg_content)
if _leaks:
    raise AssertionError(
        f'PLACEHOLDER LEAK — refusing to write SVG. Unsubstituted placeholder(s): '
        f'{sorted(set(_leaks))}. Most likely the background <rect> width/height (STEP 4) '
        f'or the <svg> header (STEP 3) was not f-string-interpolated. Fix and re-run.'
    )

# output_dir 由 SKILL.md 步骤一创建，格式为：
# <workspace>/generated-assets/<paper-title-slug>/
output_path = os.path.join(output_dir, 'paper_author_year_figN.svg')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"SVG generated: {output_path}")
PYEOF
```

### 关键纪律

1. **每个视觉元素单独一行 `body.append()`** — 不在一行里塞多个元素
2. **所有颜色通过 `t["token"]` 引用** — 不硬编码色值
3. **三步顺序：先建 body（推进 y）→ `CANVAS_HEIGHT = y + MARGIN_BOTTOM` → 再组装 header** — `CANVAS_WIDTH` 由图表类型上前确定；`CANVAS_HEIGHT` 必须从内容 accumulator 推导，**禁止写固定值再 bump**（svg-spec.md §canvas）
4. **字符串拼接用 f-string · 尺寸直接插值** — 不用 % 或 `.format()`；**禁止** `{{W}}`/`{{H}}` 占位符 + `.replace()`（f-string 会把 `{{W}}` 压成 `{W}`，replace 静默失配 → SVG 尺寸损坏）。header 在 `CANVAS_HEIGHT` 已知后组装，本就不需要占位符
5. **尺寸插值有两处，缺一不可** — `<svg>` header（width/height/viewBox · STEP 3）**和**背景 `<rect>`（width/height · STEP 4）都必须用同一对 f-string 变量 `{CANVAS_WIDTH}`/`{CANVAS_HEIGHT}`。两者隔着 `<defs>` 块（~20 行），最常见的 bug 就是 viewBox 替对了、背景 `<rect>` 漏替 → `<rect>` 属性非数值 → 背景不渲染 → SVG 无底色。组装完 `<rect>` 行后，目视确认它的 width/height 与 viewBox 同源
6. **写文件前强制 placeholder 校验（STEP 6）** — `open()`/`write()` 之前必须跑正则 `\{[A-Za-z_]\w*\}` + `%%\w+%%` 扫描 `svg_content`；命中任何残留占位符立即 `raise`，**绝不落盘**。fail loud 优于 ship 一个坏 SVG。这一步不可省略，也不可改成 warning

---

## 两步生成法：先描述结构，再渲染 SVG

### 第一步：输出结构描述

在生成 SVG 之前，先在聊天中输出图表的结构化描述。格式：

```
图表类型：TYPE-C (Flow)
节点列表：
  1. "What Should Be Automated?" — 入口节点
  2. "Identify Types of Automation" — 分叉前节点
  3. "Acquisition" / "Analysis" / "Decision" / "Action" — 四个并列子节点
  4. "Identify Levels of Automation" — 汇聚后节点
  ...
连接关系：
  1 → 2（实线箭头）
  2 → 3a/3b/3c/3d（树形分叉）
  3a/3b/3c/3d → 4（树形汇聚）
  ...
简化决策：
  - 保留：核心框架的所有节点和流向
  - 去除：原图中的装饰性图标、背景色块
  - 简化：将原图中的 10 级自动化文字缩减为标签
画布预估：550 × 760
```

### 第二步：自检后生成

确认结构描述完整后，再运行 Python 脚本生成 SVG。

自检清单（结构描述阶段）：
- [ ] 原图的所有关键节点是否都在列表中？
- [ ] 连接关系是否完整（无孤立节点）？
- [ ] 画布预估是否合理（横向图 ≥ 节点数 × 180px，纵向图 ≥ 步骤数 × 80px）？

---

## 生成后验证

### 自检清单（SVG 生成后）

在输出文件链接之前，对生成的 SVG 执行以下检查：

**0. Placeholder 残留检查（强制 · 优先于其他检查）**

> 这是 STEP 6 pre-write 校验的 file-level 复核。pre-write 校验应已拦截任何残留占位符；若文件仍命中，说明 generator 绕过了 STEP 6 —— 删除该文件、修模板、重新生成，不要 ship。

```bash
python3 -c "
import re
with open('/path/to/output.svg', 'r', encoding='utf-8') as f:
    content = f.read()
leaks = re.findall(r'\{[A-Za-z_]\w*\}|%%[A-Za-z_]+%%', content)
if leaks:
    print(f'FAIL: unsubstituted placeholder(s) leaked into file: {sorted(set(leaks))}')
    print('  → most likely the background <rect> width/height. Delete file, fix template, regenerate.')
else:
    print('OK: no template placeholder leak.')
"
```

**1. 语法验证**

```bash
python3 -c "
import xml.etree.ElementTree as ET
try:
    ET.parse('/path/to/output.svg')
    print('XML syntax: VALID')
except ET.ParseError as e:
    print(f'XML syntax ERROR: {e}')
"
```

**2. 画布空白率检查**

```bash
python3 -c "
import xml.etree.ElementTree as ET
tree = ET.parse('/path/to/output.svg')
root = tree.getroot()
ns = {'svg': 'http://www.w3.org/2000/svg'}

# 获取画布尺寸
w = int(root.get('width', 0))
h = int(root.get('height', 0))

# 找到所有视觉元素的最大 y 坐标（粗略估算内容高度）
max_y = 0
for elem in root.iter():
    y = elem.get('y')
    if y:
        try:
            max_y = max(max_y, float(y))
        except ValueError:
            pass
    cy = elem.get('cy')
    if cy:
        try:
            max_y = max(max_y, float(cy))
        except ValueError:
            pass

content_bottom = max_y + 40  # 预留底部内容高度
waste_ratio = (h - content_bottom) / h if h > 0 else 0
print(f'Canvas: {w}x{h}, Content bottom: ~{content_bottom:.0f}px')
print(f'Waste ratio: {waste_ratio:.1%}')
if waste_ratio > 0.15:
    print('WARNING: >15% blank space. Reduce canvas height.')
else:
    print('OK: Canvas size appropriate.')
"
```

**3. 风格一致性检查**

```bash
python3 -c "
with open('/path/to/output.svg', 'r') as f:
    content = f.read()

# 检查是否有硬编码的非规范颜色
import re
hex_colors = set(re.findall(r'#[0-9A-Fa-f]{3,6}', content))
portfolio_colors = {'#F8F7F3','#1A1A18','#444','#444444','#555','#555555','#888','#888888','#999','#999999','#C8A84B','#8BA7C0','#FFFFFF','#ffffff','#EDE9E2','#D8D5D0'}
mono_colors = {'#FFFFFF','#ffffff','#1A1A18','#444','#444444','#555','#555555','#888','#888888','#999','#999999','#F5F5F3','#E0DDD8'}

unexpected = hex_colors - portfolio_colors - mono_colors
# 排除 marker polygon 中的常见格式变体
unexpected = {c for c in unexpected if len(c) > 3}  # 忽略 3 位缩写

if unexpected:
    print(f'WARNING: Non-standard colors found: {unexpected}')
else:
    print('OK: All colors match theme spec.')

# 检查是否有圆角
if 'rx=' in content or 'ry=' in content:
    # 检查是否是 rx=0
    rx_values = re.findall(r'rx=\"(\d+)\"', content)
    non_zero_rx = [v for v in rx_values if v != '0']
    if non_zero_rx:
        print(f'WARNING: Non-zero border-radius found: rx={non_zero_rx}')
    else:
        print('OK: All corners are sharp (rx=0).')
else:
    print('OK: No border-radius attributes.')
"
```

### 验证失败的处理

- **Placeholder 残留（STEP 6 / 检查 0）：** 检查 `<svg>` header 和背景 `<rect>` 两处尺寸是否都用了 f-string `{CANVAS_WIDTH}`/`{CANVAS_HEIGHT}` 变量（不是字面 `{W}`/`{H}`）。修正模板后重新生成；**已落盘的坏文件必须删除**，不要 ship
- **语法错误：** 定位错误行号，在 Python list 中修复对应行，重新生成
- **画布空白 >15%：** 减小 CANVAS_HEIGHT，重新生成
- **非规范颜色：** 替换为 theme dict 中对应的 token 值，重新生成
- **第三次仍失败：** 停止重试，报告问题，不进入无限循环

---

## 文件命名与输出

### 命名规则

```
paper_[第一作者姓小写]_[年份]_fig[原图编号].svg          # Portfolio 主题
paper_[第一作者姓小写]_[年份]_fig[原图编号]_mono.svg     # Monochrome 主题
```

示例：
- `paper_parasuraman_2000_fig2.svg`
- `paper_parasuraman_2000_fig2_mono.svg`

### 输出路径

所有文件保存到 SKILL.md 步骤一创建的论文专属文件夹中：

```
<workspace>/generated-assets/<paper-title-slug>/
```

其中 `<workspace>` 是用户的工作文件夹路径。文件夹命名规则和创建方式见 SKILL.md "输出归档" 章节。

生成后在聊天中提供文件链接并附一句话说明。

### 常见 SVG 语法错误速查

| 错误 | 修正 |
|------|------|
| `fill=#fff` | `fill="#ffffff"` |
| 缺少 `y` 属性 | `x="390"` → `x="390" y="250"` |
| `marker-end=` | `marker-end="url(#arrow)"` |
| 路径坐标粘连 | `L 29450` → `L 294 50` 或 `L 294,50` |
| 未关闭 `</svg>` | 确保 `lines` 最后一行是 `</svg>` |
| `&` 未转义 | 在文本中使用 `&amp;` |
| `font-weight: bold` in attr | 属性用 `font-weight="bold"`，不是 CSS 语法 |
