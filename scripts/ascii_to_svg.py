#!/usr/bin/env python3
"""
ascii_to_svg.py — Convert ASCII art diagrams to inline SVG in HTML files.

Reads HTML files from the articles/ directory, detects <pre> blocks containing
ASCII art diagrams (box-drawing characters), parses their structure, and
replaces them with styled inline SVG. Code blocks are left untouched.

Usage:
    python ascii_to_svg.py                    # Process all .html in articles/
    python ascii_to_svg.py --dry-run          # Preview without modifying files
    python ascii_to_svg.py --file FILE        # Process a single file
    python ascii_to_svg.py --file FILE --dry-run
"""

import re
import os
import sys
import argparse
import html as html_mod
from pathlib import Path
from typing import List, Tuple, Dict, Optional, Set
from dataclasses import dataclass, field

# ── Constants ──────────────────────────────────────────────────────────────────

BOX_DRAW = set("┌┐└┘│─├┤┬┴┼╔╗╚╝═║")
ARROW_CHARS = set("▼▲►◄↓↑→←↔↻↩▷◁")
FLOW_CHARS = set("→←↓↑▼▲►◄↔──►◄──▶▷◁●○⬤")
TREE_CHARS = {"├", "└", "│"}

# Characters that form box outlines
H_CHAR = "─"
V_CHAR = "│"
TL = "┌"
TR = "┐"
BL = "└"
BR = "┘"
VERTICAL_EDGE = {"│", "├", "┼"}
HORIZONTAL_EDGE = {"─", "┴", "┼", "┬"}

# Dark-theme colour palette
STROKE_COLORS = [
    "#3ecf8e",  # green
    "#60a5fa",  # blue
    "#f59e0b",  # amber
    "#a78bfa",  # purple
    "#f472b6",  # pink
    "#34d399",  # emerald
    "#fb923c",  # orange
    "#38bdf8",  # sky
]
FILL_COLORS = [
    "#0f2a1f",  # dark green tint
    "#0f1d3a",  # dark blue tint
    "#2a1f0a",  # dark amber tint
    "#1a0f2e",  # dark purple tint
    "#2a0f1e",  # dark pink tint
    "#0a2a1f",  # dark emerald tint
    "#2a1a0a",  # dark orange tint
    "#0a1f2a",  # dark sky tint
]

# Code-start patterns (blocks starting with these are NOT diagrams)
CODE_STARTERS = re.compile(
    r"^(import\s|from\s|const\s|let\s|var\s|function\s|def\s|class\s"
    r"|#!|//|/\*|SELECT\s|CREATE\s|INSERT\s|UPDATE\s|DELETE\s|DROP\s"
    r"|docker\s|npm\s|git\s|yarn\s|pip\s|apt\s|sudo\s|curl\s|wget\s"
    r"|#\s*={3,}|@\w|\{|\[|<\w|<[A-Z]|\$|\.\.\.|package\s|require\(|#include)",
    re.IGNORECASE,
)

# Characters that form the edge of a box (left, right, top, bottom)
LEFT_EDGE = {"│", "├", "┼"}
RIGHT_EDGE = {"│", "┤", "┼"}
TOP_EDGE = {"─", "┬", "┼"}
BOTTOM_EDGE = {"─", "┴", "┼"}


# ── Data classes ───────────────────────────────────────────────────────────────

@dataclass
class Box:
    """A rectangular box found in the ASCII art grid."""
    row: int        # top-left row
    col: int        # top-left column
    width: int      # number of columns (including borders)
    height: int     # number of rows (including borders)
    text_lines: list = field(default_factory=list)
    is_frame: bool = False
    stroke_color: str = ""
    fill_color: str = ""

    @property
    def r2(self):
        return self.row + self.height - 1

    @property
    def c2(self):
        return self.col + self.width - 1

    @property
    def area(self):
        return self.width * self.height


# ── Grid helpers ───────────────────────────────────────────────────────────────

def char_at(grid: list, r: int, c: int) -> str:
    """Return character at (r, c) or space if out of bounds."""
    if 0 <= r < len(grid) and 0 <= c < len(grid[r]):
        return grid[r][c]
    return " "


def _normalize_grid(text: str) -> List[List[str]]:
    """Split text into a uniform-width character grid, stripping \\r and padding."""
    lines = text.replace("\r", "").split("\n")
    # Remove leading/trailing blank lines
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return []
    max_w = max(len(l) for l in lines)
    grid = []
    for l in lines:
        row = list(l)
        row.extend([" "] * (max_w - len(row)))
        grid.append(row)
    return grid


def find_all_boxes(grid: list) -> List[Box]:
    """Find all rectangular box outlines in the character grid."""
    rows = len(grid)
    if rows == 0:
        return []

    boxes: List[Box] = []
    used: Set[Tuple[int, int]] = set()

    for r in range(rows):
        for c in range(len(grid[r])):
            if grid[r][c] != TL or (r, c) in used:
                continue
            box = _trace_box(grid, r, c, rows)
            if box is None:
                continue
            # Mark all border cells as used to avoid double-detecting
            for br in range(box.row, box.row + box.height):
                used.add((br, box.col))
                used.add((br, box.col + box.width - 1))
            for bc in range(box.col, box.col + box.width):
                used.add((box.row, bc))
                used.add((box.row + box.height - 1, bc))
            boxes.append(box)

    return boxes


def _trace_box(grid, sr, sc, total_rows) -> Optional[Box]:
    """Attempt to trace a complete box from ┌ at (sr, sc).

    Allows ±1 column drift on edges to handle inconsistent ASCII art widths.
    Tracks the maximum extent of the box to mark all border cells.
    """
    cols = len(grid[0]) if grid else 0

    # ── trace top edge to find ┐ ──
    c = sc + 1
    while c < cols and grid[sr][c] in TOP_EDGE:
        c += 1
    if c >= cols or grid[sr][c] != TR:
        return None
    tc = c  # initial top-right column

    # ── trace right edge down from ┐ to find ┘ ──
    right_col = tc
    max_right = tc  # track maximum right extent
    r = sr + 1
    while r < total_rows:
        ch = char_at(grid, r, right_col)
        if ch in RIGHT_EDGE:
            max_right = max(max_right, right_col)
            r += 1
            continue
        # Allow ±1 column drift
        found = False
        for dc in (1, -1):
            nc = right_col + dc
            if 0 <= nc < cols and char_at(grid, r, nc) in RIGHT_EDGE:
                right_col = nc
                max_right = max(max_right, right_col)
                r += 1
                found = True
                break
        if not found:
            break

    if r >= total_rows:
        return None
    # Should be ┘ (or ┴) at bottom-right
    if char_at(grid, r, right_col) not in (BR, "┴"):
        # Try one more column
        for dc in (1, -1):
            if char_at(grid, r, right_col + dc) in (BR, "┴"):
                right_col += dc
                max_right = max(max_right, right_col)
                break
        else:
            return None

    br_row = r

    # ── trace left edge down from ┌ to find └ ──
    left_col = sc
    min_left = sc  # track minimum left extent
    r = sr + 1
    while r < br_row:
        ch = char_at(grid, r, left_col)
        if ch in LEFT_EDGE:
            min_left = min(min_left, left_col)
            r += 1
            continue
        found = False
        for dc in (-1, 1):
            nc = left_col + dc
            if 0 <= nc < cols and char_at(grid, r, nc) in LEFT_EDGE:
                left_col = nc
                min_left = min(min_left, left_col)
                r += 1
                found = True
                break
        if not found:
            break

    if r != br_row:
        return None
    # Should be └ at bottom-left
    if char_at(grid, br_row, left_col) not in (BL, "├"):
        return None

    # ── verify bottom edge from └ to ┘ ──
    for cc in range(left_col + 1, right_col):
        ch = char_at(grid, br_row, cc)
        # Accept any box drawing char that can appear on a horizontal edge
        # (including ┬ where a connector goes downward from this edge)
        if ch not in BOTTOM_EDGE and ch not in TOP_EDGE and ch != "─" and ch != " ":
            return None

    # Use the tracked extents for the box dimensions
    box_left = min(min_left, sc)
    box_right = max(max_right, right_col)
    width = box_right - box_left + 1
    height = br_row - sr + 1
    if width < 3 or height < 2:
        return None

    return Box(row=sr, col=box_left, width=width, height=height)


def extract_box_text(grid: list, box: Box) -> List[str]:
    """Extract trimmed text lines from the interior of a box."""
    lines = []
    for r in range(box.row + 1, box.r2):
        chars = []
        for c in range(box.col + 1, box.c2):
            chars.append(char_at(grid, r, c))
        line = "".join(chars).rstrip()
        lines.append(line)
    # Trim leading/trailing blank lines
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    return lines


def mark_box_cells(cells: set, box: Box):
    """Mark all cells belonging to a box (border + interior)."""
    for r in range(box.row, box.row + box.height):
        for c in range(box.col, box.col + box.width):
            cells.add((r, c))


def get_floating_text(grid: list, box_cells: set) -> List[Tuple[int, int, str]]:
    """Return (row, col, text) for text runs outside of box cells."""
    runs = []
    for r in range(len(grid)):
        c = 0
        while c < len(grid[r]):
            if (r, c) in box_cells:
                c += 1
                continue
            # Start of a potential run
            start = c
            text = ""
            while c < len(grid[r]) and (r, c) not in box_cells:
                text += grid[r][c]
                c += 1
            if text.strip():
                runs.append((r, start, text))
    return runs


# ── Diagram detection ──────────────────────────────────────────────────────────

def is_diagram(text: str) -> bool:
    """Return True if the <pre> block content is an ASCII art diagram."""
    stripped = text.strip()
    if not stripped:
        return False

    lines = stripped.split("\n")
    first_line = ""
    for line in lines:
        ls = line.strip()
        if ls:
            first_line = ls
            break
    if not first_line:
        return False

    # Reject code blocks
    if CODE_STARTERS.match(first_line):
        return False

    # Reject blocks that look like shell commands with section separators
    # (lines starting with # and using ═ or ─ as decoration)
    hash_lines = sum(1 for l in lines if l.strip().startswith("#"))
    if hash_lines > len(lines) * 0.5 and hash_lines >= 4:
        # Mostly comment lines — check if it's shell/SQL comments with decorations
        has_equals = sum(1 for l in lines if re.match(r"^\s*#\s*[═]{3,}", l))
        has_dashes_sep = sum(1 for l in lines if re.match(r"^\s*#\s*[-─]{5,}\s*$", l))
        if has_equals >= 1 or has_dashes_sep >= 1:
            return False
        # Shell command blocks with ═ decorations
        shell_cmds = sum(1 for l in lines if re.match(r"^\s*#\s+", l) and not any(c in l for c in "┌┐└┘├└"))
        if shell_cmds >= 6:
            return False

    # Reject blocks that look like Cypress/test code with ═ section comments
    if ("describe(" in stripped or "it(" in stripped) and "// ═══" in stripped:
        return False

    # Reject blocks that look like firewall rules / config files with ═ headers
    if stripped.lstrip().startswith("rules_version") or "service cloud" in stripped or "service firebase" in stripped:
        return False

    # ── Positive detection ──

    # Count box-drawing characters
    bd_count = sum(1 for ch in stripped if ch in BOX_DRAW)
    corner_count = sum(1 for ch in stripped if ch in "┌┐└┘")

    # Boxes with corners
    if corner_count >= 4:
        return True

    # Count lines with ┌ or └
    corner_lines = sum(
        1 for line in lines if "┌" in line or "└" in line
    )
    if corner_lines >= 3:
        return True

    # Tree structures: lines with ├── or └── (these have lots of │ and ├ chars
    # which count toward bd_count, but let's also explicitly detect them)
    tree_lines = sum(1 for l in lines if "├──" in l or "└──" in l)
    if tree_lines >= 2:
        return True

    # Box-drawing characters with reasonable density
    # (trees, flow diagrams, and complex diagrams all have many bd chars)
    if bd_count >= 5:
        return True

    return False


# ── SVG generation ─────────────────────────────────────────────────────────────

def _esc(text: str) -> str:
    """Escape text for SVG/XML embedding."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def _classify_diagram(text: str) -> str:
    """Classify a diagram as 'tree', 'flow', 'box', or 'generic'."""
    lines = text.strip().split("\n")

    tree_chars = sum(1 for l in lines if "├──" in l or "└──" in l or "│   " in l or "│└" in l)
    arrow_chars = sum(1 for ch in text if ch in "→←↓↑▼▲►◄↔▶▷◁")
    corner_chars = sum(1 for ch in text if ch in "┌┐└┘")

    # Tree if significant tree chars and more tree than arrow
    if tree_chars >= 3 and tree_chars > arrow_chars:
        return "tree"

    # Flow if more arrows than corners
    if arrow_chars >= 3 and arrow_chars > corner_chars:
        return "flow"

    # Box if we have corners
    if corner_chars >= 4:
        return "box"

    # Try box detection anyway
    return "box"


def _generate_tree_svg(text: str, diagram_id: int = 0) -> str:
    """Generate SVG for tree/directory structure diagrams."""
    lines = text.replace("\r", "").split("\n")
    # Remove leading/trailing blank lines
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ""

    CW = 9
    CH = 22
    PAD = 20
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"

    max_len = max(len(l) for l in lines)
    svg_w = max_len * CW + PAD * 2
    svg_h = len(lines) * CH + PAD * 2
    uid = f"tree{diagram_id}"

    # Detect root name (first non-blank line)
    root_name = lines[0].strip() if lines else "root"

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Directory structure: {_esc(root_name)}" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # Background
    parts.append(
        f'<rect x="0" y="0" width="{svg_w}" height="{svg_h}" '
        f'rx="10" ry="10" fill="#0a0a12" stroke="#1e1e2e" stroke-width="1"/>'
    )

    # Color palette for depth levels
    depth_colors = [
        "#e4e4e7",  # level 0 (root) — white
        "#60a5fa",  # level 1 — blue
        "#3ecf8e",  # level 2 — green
        "#f59e0b",  # level 3 — amber
        "#a78bfa",  # level 4 — purple
        "#f472b6",  # level 5 — pink
        "#38bdf8",  # level 6 — sky
    ]
    branch_color = "#4a4a5a"

    for i, line in enumerate(lines):
        y = PAD + i * CH + 15

        # Determine depth by counting tree-drawing prefix chars
        stripped = line.rstrip()
        # Count leading tree chars to determine depth
        depth = 0
        for ch in stripped:
            if ch in "│├└─ ":
                if ch == " ":
                    depth += 0.25
            else:
                break
        # Rough depth: count "│   " or "    " blocks before content
        depth = 0
        temp = stripped
        while temp.startswith("│   ") or temp.startswith("│  "):
            depth += 1
            temp = temp[4:] if temp.startswith("│   ") else temp[3:]
        while temp.startswith("    "):
            depth += 1
            temp = temp[4:]
        while temp.startswith("   "):
            depth += 1
            temp = temp[3:]

        color = depth_colors[min(depth, len(depth_colors) - 1)]

        # Check for annotations (← comment at end)
        main_text = stripped
        annotation = ""
        if "←" in stripped:
            parts_split = stripped.split("←", 1)
            main_text = parts_split[0].rstrip()
            annotation = "←" + parts_split[1]

        # Draw the tree line text
        x = PAD
        # Draw branch connector chars in dim color
        prefix_end = 0
        for j, ch in enumerate(stripped):
            if ch not in "│├└─ ":
                prefix_end = j
                break
        else:
            prefix_end = len(stripped)

        if prefix_end > 0:
            prefix = stripped[:prefix_end]
            parts.append(
                f'<text x="{x}" y="{y}" font-family="{FONT_CODE}" font-size="12" '
                f'fill="{branch_color}">{_esc(prefix)}</text>'
            )

        # Draw the file/folder name
        content = stripped[prefix_end:]
        if content:
            cx = x + prefix_end * CW
            # Highlight folder names (ending with /)
            is_folder = content.rstrip().endswith("/")
            fill = color
            weight = "600" if is_folder else "400"
            parts.append(
                f'<text x="{cx}" y="{y}" font-family="{FONT_CODE}" font-size="12" '
                f'font-weight="{weight}" fill="{fill}">{_esc(content)}</text>'
            )

        # Draw annotation in dim color
        if annotation:
            ax = x + len(stripped) * CW + 8
            parts.append(
                f'<text x="{ax}" y="{y}" font-family="{FONT_CODE}" font-size="11" '
                f'fill="#71717a" font-style="italic">{_esc(annotation.strip())}</text>'
            )

    parts.append("</svg>")
    return "\n".join(parts)


def _generate_flow_svg(text: str, diagram_id: int = 0) -> str:
    """Generate SVG for flow/arrow diagrams without traditional box outlines."""
    lines = text.replace("\r", "").split("\n")
    # Remove leading/trailing blank lines
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ""

    CW = 9
    CH = 20
    PAD = 24
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
    FONT_LABEL = "'Inter', 'Segoe UI', system-ui, sans-serif"

    max_len = max(len(l) for l in lines)
    svg_w = max_len * CW + PAD * 2
    svg_h = len(lines) * CH + PAD * 2
    uid = f"flow{diagram_id}"

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Flow diagram" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # Defs for arrows
    parts.append("<defs>")
    parts.append(
        f'<marker id="{uid}-ah" markerWidth="10" markerHeight="7" '
        f'refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">'
        f'<path d="M0,0.5 L9,3.5 L0,6.5" fill="none" stroke="#f59e0b" '
        f'stroke-width="1.2" stroke-linejoin="round"/></marker>'
    )
    parts.append(
        f'<filter id="{uid}-ds" x="-8%" y="-8%" width="116%" height="124%">'
        f'<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" '
        f'flood-opacity="0.5"/></filter>'
    )
    parts.append("</defs>")

    # Background
    parts.append(
        f'<rect x="0" y="0" width="{svg_w}" height="{svg_h}" '
        f'rx="10" ry="10" fill="#0a0a12" stroke="#1e1e2e" stroke-width="1"/>'
    )

    # Colors
    arrow_color = "#f59e0b"
    node_color = "#60a5fa"
    dim_color = "#71717a"
    bright_color = "#e4e4e7"
    connector_color = "#4a4a5a"

    # Parse the grid to identify nodes (text blocks) and connectors (arrows/lines)
    grid = _normalize_grid(text)

    for i, line in enumerate(lines):
        y = PAD + i * CH + 14
        stripped = line.rstrip()
        if not stripped:
            continue

        # Identify segments: alternating between connectors and text
        segments = _parse_flow_line(stripped)

        x_offset = PAD
        for seg_type, seg_text in segments:
            if not seg_text:
                continue

            if seg_type == "arrow":
                # Draw arrow connector
                has_arrow_char = any(c in seg_text for c in "►→▶▷▼▲")
                has_vertical = "│" in seg_text or "┃" in seg_text

                if has_vertical:
                    # Vertical connector
                    parts.append(
                        f'<text x="{x_offset}" y="{y}" font-family="{FONT_CODE}" '
                        f'font-size="13" fill="{connector_color}">{_esc(seg_text)}</text>'
                    )
                elif has_arrow_char:
                    # Horizontal arrow
                    # Extract the arrow direction
                    arrow_idx = next((j for j, c in enumerate(seg_text) if c in "►→▶▷"), -1)
                    if arrow_idx >= 0:
                        line_part = seg_text[:arrow_idx].rstrip("─━ ")
                        head_part = seg_text[arrow_idx:]

                        # Draw the line portion
                        if line_part:
                            line_start_x = x_offset
                            line_end_x = x_offset + len(line_part) * CW
                            line_y = y - 4
                            parts.append(
                                f'<line x1="{line_start_x}" y1="{line_y}" '
                                f'x2="{line_end_x}" y2="{line_y}" '
                                f'stroke="{arrow_color}" stroke-width="1.5"/>'
                            )
                        # Draw arrow head as text
                        ax = x_offset + len(line_part) * CW
                        parts.append(
                            f'<text x="{ax}" y="{y}" font-family="{FONT_CODE}" '
                            f'font-size="13" fill="{arrow_color}">{_esc(head_part)}</text>'
                        )
                    else:
                        parts.append(
                            f'<text x="{x_offset}" y="{y}" font-family="{FONT_CODE}" '
                            f'font-size="13" fill="{arrow_color}">{_esc(seg_text)}</text>'
                        )
                else:
                    # Plain connector (─ lines)
                    line_y = y - 4
                    line_start_x = x_offset + 2
                    line_end_x = x_offset + len(seg_text) * CW - 2
                    parts.append(
                        f'<line x1="{line_start_x}" y1="{line_y}" '
                        f'x2="{line_end_x}" y2="{line_y}" '
                        f'stroke="{connector_color}" stroke-width="1"/>'
                    )

                x_offset += len(seg_text) * CW
            else:
                # Text node — draw with background
                txt = seg_text.strip()
                if not txt:
                    x_offset += len(seg_text) * CW
                    continue

                # Check if this looks like a label/heading
                is_heading = bool(re.match(r"^\d+\.\s", txt)) or txt.isupper()
                is_comment = txt.startswith("#") or txt.startswith("//") or txt.startswith("/*")

                if is_heading:
                    color = bright_color
                    font = FONT_LABEL
                    weight = "600"
                elif is_comment:
                    color = dim_color
                    font = FONT_CODE
                    weight = "400"
                else:
                    color = node_color
                    font = FONT_CODE
                    weight = "400"

                # Draw node background box if it looks like a real node
                # (not just punctuation/whitespace)
                alphanumeric = sum(1 for c in txt if c.isalnum())
                if alphanumeric >= 2:
                    text_w = len(txt) * CW + 12
                    text_h = CH - 2
                    nx = x_offset
                    ny = y - CH + 6
                    parts.append(
                        f'<rect x="{nx}" y="{ny}" width="{text_w}" height="{text_h}" '
                        f'rx="4" ry="4" fill="#0f1d3a" stroke="{color}" '
                        f'stroke-width="0.8" opacity="0.6"/>'
                    )

                parts.append(
                    f'<text x="{x_offset + 6}" y="{y}" font-family="{font}" '
                    f'font-size="12" font-weight="{weight}" '
                    f'fill="{color}">{_esc(txt)}</text>'
                )
                x_offset += len(seg_text) * CW

    parts.append("</svg>")
    return "\n".join(parts)


def _parse_flow_line(line: str) -> List[Tuple[str, str]]:
    """Parse a line into (type, text) segments where type is 'arrow' or 'text'."""
    segments = []
    i = 0
    n = len(line)

    while i < n:
        ch = line[i]

        # Check if we're at an arrow/connector character
        if ch in "─━│┃┌┐└┘├┤┬┴┼►→▶▷▼▲◄←◁↻↩":
            # Collect connector run
            start = i
            while i < n and line[i] in "─━│┃┌┐└┘├┤┬┴┼►→▶▷▼▲◄←◁↻↩":
                i += 1
            segments.append(("arrow", line[start:i]))
        else:
            # Collect text run
            start = i
            while i < n and line[i] not in "─━│┃┌┐└┘├┤┬┴┼►→▶▷▼▲◄←◁↻↩":
                i += 1
            segments.append(("text", line[start:i]))

    # Merge adjacent text segments
    merged = []
    for seg_type, seg_text in segments:
        if merged and merged[-1][0] == seg_type:
            merged[-1] = (seg_type, merged[-1][1] + seg_text)
        else:
            merged.append((seg_type, seg_text))

    return merged


def _generate_generic_svg(text: str, diagram_id: int = 0) -> str:
    """Generate SVG for diagrams that don't fit other categories.
    Renders as styled monospace text with color-coded lines."""
    lines = text.replace("\r", "").split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ""

    CW = 9
    CH = 18
    PAD = 24
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"

    max_len = max(len(l) for l in lines)
    svg_w = max_len * CW + PAD * 2
    svg_h = len(lines) * CH + PAD * 2
    uid = f"gen{diagram_id}"

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Diagram" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # Background
    parts.append(
        f'<rect x="0" y="0" width="{svg_w}" height="{svg_h}" '
        f'rx="10" ry="10" fill="#0a0a12" stroke="#1e1e2e" stroke-width="1"/>'
    )

    for i, line in enumerate(lines):
        y = PAD + i * CH + 14
        stripped = line.rstrip()
        if not stripped:
            continue

        # Color based on content
        has_arrow = any(ch in stripped for ch in "→←↓↑▼▲►◄↔▶")
        is_separator = bool(re.match(r"^\s*[═━─]{5,}\s*$", stripped))
        is_heading = bool(re.match(r"^\s*\d+\.", stripped)) or (stripped.isupper() and len(stripped) > 3)

        if is_separator:
            color = "#4a4a5a"
        elif is_heading:
            color = "#e4e4e7"
        elif has_arrow:
            color = "#f59e0b"
        else:
            color = "#a1a1aa"

        parts.append(
            f'<text x="{PAD}" y="{y}" font-family="{FONT_CODE}" font-size="12" '
            f'fill="{color}">{_esc(stripped)}</text>'
        )

    parts.append("</svg>")
    return "\n".join(parts)


def generate_svg(text: str, diagram_id: int = 0) -> str:
    """Convert ASCII art text to an inline SVG string.
    Tries multiple strategies: box parsing, tree rendering, flow rendering, generic."""
    grid = _normalize_grid(text)
    if not grid:
        return ""

    # ── Strategy 1: Box-based diagrams (existing logic) ──
    all_boxes = find_all_boxes(grid)
    if all_boxes:
        # Sort by area descending — largest is the outer frame
        all_boxes.sort(key=lambda b: b.area, reverse=True)

        # If we have a reasonable number of boxes, proceed with box rendering
        if len(all_boxes) >= 1:
            return _generate_box_svg(text, grid, all_boxes, diagram_id)

    # ── Strategy 2: Tree structures ──
    diag_type = _classify_diagram(text)
    if diag_type == "tree":
        svg = _generate_tree_svg(text, diagram_id)
        if svg:
            return svg

    # ── Strategy 3: Flow/arrow diagrams ──
    if diag_type == "flow":
        svg = _generate_flow_svg(text, diagram_id)
        if svg:
            return svg

    # ── Strategy 4: Generic fallback ──
    svg = _generate_generic_svg(text, diagram_id)
    if svg:
        return svg

    return ""


def _generate_box_svg(text: str, grid: list, all_boxes: List[Box], diagram_id: int = 0) -> str:
    """Generate SVG for box-based diagrams (the original logic)."""
    rows = len(grid)
    cols = len(grid[0]) if grid else 0
    # Sort by area descending — largest is the outer frame
    all_boxes.sort(key=lambda b: b.area, reverse=True)

    # Identify outer frame (>50% of total grid area)
    total_area = rows * cols
    outer = all_boxes[0]
    inner_boxes = all_boxes[1:]

    # If the largest box is small relative to grid, there's no real frame
    if outer.area < total_area * 0.30:
        outer = None
    else:
        outer.is_frame = True

    # ── extract text from inner boxes ──
    for i, box in enumerate(inner_boxes):
        box.text_lines = extract_box_text(grid, box)
        box.stroke_color = STROKE_COLORS[i % len(STROKE_COLORS)]
        box.fill_color = FILL_COLORS[i % len(FILL_COLORS)]

    # ── title from frame ──
    title = ""
    if outer:
        frame_lines = extract_box_text(grid, outer)
        if frame_lines:
            raw_title = frame_lines[0].strip()
            # Remove box drawing chars and extra spaces
            title = re.sub(r"[┌┐└┘│─├┤┬┴┼╔╗╚╝═║]", "", raw_title).strip()
            title = " ".join(title.split())  # normalize whitespace

    # ── mark box cells ──
    box_cells: Set[Tuple[int, int]] = set()
    if outer:
        mark_box_cells(box_cells, outer)
    for box in inner_boxes:
        mark_box_cells(box_cells, box)

    # ── floating text ──
    floating = get_floating_text(grid, box_cells)

    # ── build SVG ──
    CW = 9       # character width in SVG units
    CH = 18      # character height in SVG units
    PAD = 24     # padding around the diagram
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
    FONT_LABEL = "'Inter', 'Segoe UI', system-ui, sans-serif"

    svg_w = cols * CW + PAD * 2
    svg_h = rows * CH + PAD * 2

    uid = f"ad{diagram_id}"
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="{_esc(title) if title else "Diagram"}" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # ── defs ──
    parts.append("<defs>")
    parts.append(
        f'<filter id="{uid}-ds" x="-8%" y="-8%" width="116%" height="124%">'
        f'<feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" '
        f'flood-opacity="0.55"/></filter>'
    )
    parts.append(
        f'<marker id="{uid}-ah" markerWidth="10" markerHeight="7" '
        f'refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">'
        f'<path d="M0,0.5 L9,3.5 L0,6.5" fill="none" stroke="#8b8b8b" '
        f'stroke-width="1.2" stroke-linejoin="round"/></marker>'
    )
    parts.append("</defs>")

    # ── outer frame ──
    if outer:
        fx = outer.col * CW + PAD
        fy = outer.row * CH + PAD
        fw = outer.width * CW
        fh = outer.height * CH
        parts.append(
            f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" '
            f'rx="12" ry="12" fill="#0a0a12" stroke="#1e1e2e" '
            f'stroke-width="1"/>'
        )

    # ── inner boxes ──
    for box in inner_boxes:
        bx = box.col * CW + PAD
        by = box.row * CH + PAD
        bw = box.width * CW
        bh = box.height * CH
        parts.append(
            f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" '
            f'rx="8" ry="8" fill="{box.fill_color}" '
            f'stroke="{box.stroke_color}" stroke-width="1.5" '
            f'filter="url(#{uid}-ds)"/>'
        )

    # ── title text ──
    if title and outer:
        tx = (outer.col + outer.width / 2) * CW + PAD
        ty = (outer.row + 1) * CH + PAD + 14
        parts.append(
            f'<text x="{tx}" y="{ty}" text-anchor="middle" '
            f'font-family="{FONT_LABEL}" font-size="13" font-weight="600" '
            f'fill="#ffffff">{_esc(title)}</text>'
        )

    # ── text inside inner boxes ──
    for box in inner_boxes:
        cx = (box.col + box.width / 2) * CW + PAD
        # Start Y at first interior row
        base_y = (box.row + 1) * CH + PAD + 14
        line_h = 16
        for i, tl in enumerate(box.text_lines):
            stripped_line = tl.strip()
            if not stripped_line:
                continue
            ty = base_y + i * line_h
            parts.append(
                f'<text x="{cx}" y="{ty}" text-anchor="middle" '
                f'font-family="{FONT_CODE}" font-size="11.5" '
                f'fill="#e4e4e7">{_esc(stripped_line)}</text>'
            )

    # ── floating text ──
    for (fr, fc, ftxt) in floating:
        stripped = ftxt.rstrip()
        if not stripped:
            continue
        x = fc * CW + PAD
        y = fr * CH + PAD + 14

        # Determine colour: brighter for arrows, dimmer for regular text
        has_arrow = any(ch in ARROW_CHARS for ch in stripped)
        color = "#f59e0b" if has_arrow else "#a1a1aa"
        # If it looks like a section heading (starts with a number + period)
        if re.match(r"^\s*\d+\.\s", stripped):
            color = "#e4e4e7"
        # If it looks like a description/explanation line
        if stripped.lstrip().startswith(("Chatbot:", "Agent:", "Output ", "Supervisor ", "Agent ")):
            color = "#71717a"
        if "→" in stripped or "──►" in stripped or "◄──►" in stripped:
            color = "#f59e0b"

        # Choose font
        font = FONT_CODE
        if re.match(r"^\s*\d+\.\s", stripped):
            font = FONT_LABEL

        parts.append(
            f'<text x="{x}" y="{y}" font-family="{font}" font-size="11" '
            f'fill="{color}">{_esc(stripped)}</text>'
        )

    parts.append("</svg>")
    return "\n".join(parts)


# ── HTML file processing ───────────────────────────────────────────────────────

def find_pre_blocks(content: str) -> List[Dict]:
    """Return a list of dicts describing each <pre>…</pre> block."""
    pattern = re.compile(r"<pre(?:\s[^>]*)?>(.*?)</pre>", re.DOTALL)
    blocks = []
    for m in pattern.finditer(content):
        blocks.append(
            {
                "full": m.group(0),
                "inner": m.group(1),
                "start": m.start(),
                "end": m.end(),
            }
        )
    return blocks


def process_file(filepath: str, dry_run: bool = False, diagram_counter: int = 0):
    """Process a single HTML file. Returns (diagrams_converted, errors, new_counter)."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return 0, [str(e)], diagram_counter

    blocks = find_pre_blocks(content)
    if not blocks:
        return 0, [], diagram_counter

    modified = content
    diagrams = 0
    errors = []

    # Process in reverse order so replacements don't shift positions
    for block in reversed(blocks):
        inner = block["inner"]

        if not is_diagram(inner):
            continue

        svg = generate_svg(inner, diagram_id=diagram_counter)
        if not svg:
            errors.append(f"  Failed to generate SVG for block at offset {block['start']}")
            continue

        # Replace ONLY the <pre>...</pre> with the SVG; keep surrounding HTML intact
        modified = modified[: block["start"]] + svg + modified[block["end"] :]
        diagrams += 1
        diagram_counter += 1

    if diagrams > 0 and not dry_run:
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(modified)
        except Exception as e:
            errors.append(f"  Write error: {e}")

    return diagrams, errors, diagram_counter


# ── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Convert ASCII art diagrams in HTML files to inline SVG."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without modifying files.",
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Process a single file instead of the whole articles/ directory.",
    )
    parser.add_argument(
        "--dir",
        type=str,
        default=None,
        help="Override the articles directory path.",
    )
    args = parser.parse_args()

    # Resolve the articles directory
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent
    articles_dir = Path(args.dir) if args.dir else project_root / "articles"

    if args.file:
        target = Path(args.file)
        if not target.is_absolute():
            # Try as relative to CWD first, then relative to articles_dir
            if target.is_file():
                target = target.resolve()
            else:
                target = (articles_dir / target).resolve()
        files = [target]
    else:
        if not articles_dir.is_dir():
            print(f"ERROR: articles directory not found: {articles_dir}", file=sys.stderr)
            sys.exit(1)
        files = sorted(articles_dir.glob("*.html"))

    if not files:
        print("No HTML files found.")
        sys.exit(0)

    total_files = 0
    total_diagrams = 0
    total_errors: List[str] = []
    counter = 0

    mode = "DRY RUN" if args.dry_run else "LIVE"
    print(f"ascii_to_svg — [{mode}]  Processing {len(files)} file(s)…\n")

    for fpath in files:
        if not fpath.is_file():
            total_errors.append(f"  File not found: {fpath}")
            continue

        total_files += 1
        diagrams, errors, counter = process_file(
            str(fpath), dry_run=args.dry_run, diagram_counter=counter
        )
        total_diagrams += diagrams
        total_errors.extend(errors)

        fname = fpath.name
        if diagrams:
            tag = "would convert" if args.dry_run else "converted"
            print(f"  ✓ {fname}: {diagrams} diagram(s) {tag}")
        # Uncomment below for verbose output on skipped files:
        # else:
        #     print(f"  – {fname}: no diagrams")

    # ── summary ──
    print(f"\n{'─' * 50}")
    print(f"  Files scanned   : {total_files}")
    print(f"  Diagrams found  : {total_diagrams}")
    if args.dry_run:
        print(f"  (dry-run — no files were modified)")
    if total_errors:
        print(f"  Errors          : {len(total_errors)}")
        for err in total_errors:
            print(f"    {err}")
    print()


if __name__ == "__main__":
    main()
