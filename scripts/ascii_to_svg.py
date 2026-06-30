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


def _strip_box_draw(text: str) -> str:
    """Remove all box-drawing characters from text."""
    return re.sub(r"[┌┐└┘│─├┤┬┴┼╔╗╚╝═║━┃]", "", text)


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


def _parse_tree_nodes(text: str) -> List[Dict]:
    """Parse tree/directory-structure ASCII art into a list of node dicts.

    Each node dict has keys:
        depth (int), name (str), annotation (str), is_last (bool)
    Handles comment-prefixed trees (lines starting with '# ').
    Uses a two-pass approach for robust depth calculation.
    """
    lines = text.replace("\r", "").split("\n")
    # Strip leading/trailing blank lines
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return []

    # Detect if tree is comment-prefixed (# ...)
    comment_prefix = ""
    non_blank = [l for l in lines if l.strip()]
    if non_blank and all(l.lstrip().startswith("#") for l in non_blank):
        comment_prefix = "#"

    # ── First pass: extract connector positions and determine base_indent ──
    line_data = []  # list of (work_str, connector_pos, connector_char) or None
    connector_positions = []

    for line in lines:
        stripped = line.rstrip()
        if not stripped:
            line_data.append(None)
            continue

        work = stripped
        if comment_prefix:
            work = re.sub(r"^\s*#\s?", "", work)

        connector_pos = -1
        connector_char = ""
        for j, ch in enumerate(work):
            if ch in "├└":
                connector_pos = j
                connector_char = ch
                break

        line_data.append((work, connector_pos, connector_char))
        if connector_pos >= 0:
            connector_positions.append(connector_pos)

    # Base indent = minimum connector position (accounts for comment prefix offset)
    base_indent = min(connector_positions) if connector_positions else 0

    # ── Second pass: parse nodes ──
    nodes: List[Dict] = []

    for i, line in enumerate(lines):
        stripped = line.rstrip()
        if not stripped:
            continue

        if line_data[i] is None:
            continue

        work, connector_pos, connector_char = line_data[i]

        if connector_pos < 0:
            # No connector → root node (only if we haven't found one yet)
            if not nodes:
                name = work.strip()
                # Remove leading/trailing = or - separator lines
                if not re.match(r"^[═━─\-]{3,}$", name):
                    nodes.append(
                        {
                            "depth": 0,
                            "name": name,
                            "annotation": "",
                            "is_last": True,
                        }
                    )
            continue

        # Calculate depth:
        # 1. Count │ chars in prefix — most reliable
        # 2. If no │ chars, use connector position relative to base_indent
        prefix = work[:connector_pos]
        pipe_count = prefix.count("│")

        if pipe_count > 0:
            depth = pipe_count + 1
        else:
            # No pipes: use position-based depth
            depth = (connector_pos - base_indent) // 4 + 1

        if depth < 1:
            depth = 1

        is_last = connector_char == "└"

        # Extract content after connector (skip ── and spaces)
        content_start = connector_pos + 1
        while content_start < len(work) and work[content_start] in "─ ":
            content_start += 1

        content = work[content_start:].strip()
        if not content:
            continue

        # Split annotation (← comment at end, or # comment at end)
        annotation = ""
        if "←" in content:
            parts = content.split("←", 1)
            name = parts[0].rstrip()
            annotation = "← " + parts[1].strip()
        elif "  #" in content:
            parts = content.split("  #", 1)
            name = parts[0].rstrip()
            annotation = "# " + parts[1].strip()
        else:
            name = content

        if name:
            nodes.append(
                {
                    "depth": depth,
                    "name": name,
                    "annotation": annotation,
                    "is_last": is_last,
                }
            )

    return nodes


def _generate_tree_svg(text: str, diagram_id: int = 0) -> str:
    """Generate SVG for tree/directory structure diagrams as proper graphical nodes and connections."""
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
    FONT_LABEL = "'Inter', 'Segoe UI', system-ui, sans-serif"

    nodes = _parse_tree_nodes(text)
    if not nodes or len(nodes) < 2:
        # Fallback: not enough structure to render as tree
        return _generate_generic_svg(text, diagram_id)

    # ── Layout constants ──
    NODE_H = 30
    NODE_PAD_X = 14
    INDENT_W = 48
    NODE_GAP_V = 6
    PAD = 24
    CHAR_W = 7.8  # approximate monospace char width at font-size 12

    # ── Calculate node box widths ──
    for node in nodes:
        text_w = len(node["name"]) * CHAR_W + NODE_PAD_X * 2
        node["box_w"] = max(text_w, 70)

    # ── Calculate positions ──
    y = PAD
    for node in nodes:
        node["x"] = PAD + node["depth"] * INDENT_W
        node["y"] = y
        y += NODE_H + NODE_GAP_V

    # SVG dimensions
    max_x = max(n["x"] + n["box_w"] for n in nodes) + PAD + 80  # extra for annotations
    max_y = y - NODE_GAP_V + PAD
    svg_w = max(max_x, 300)
    svg_h = max_y

    uid = f"tree{diagram_id}"

    # ── Depth colour palette ──
    DEPTH_STYLES = [
        {"stroke": "#60a5fa", "fill": "#0c1a30", "text": "#93c5fd"},  # blue
        {"stroke": "#3ecf8e", "fill": "#0c2618", "text": "#6ee7b7"},  # green
        {"stroke": "#f59e0b", "fill": "#261a06", "text": "#fcd34d"},  # amber
        {"stroke": "#a78bfa", "fill": "#1a0f2e", "text": "#c4b5fd"},  # purple
        {"stroke": "#f472b6", "fill": "#2a0f1e", "text": "#f9a8d4"},  # pink
        {"stroke": "#38bdf8", "fill": "#082030", "text": "#7dd3fc"},  # sky
        {"stroke": "#34d399", "fill": "#082820", "text": "#6ee7b7"},  # emerald
    ]

    # ── Build SVG ──
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Directory structure: {_esc(_strip_box_draw(nodes[0]["name"]))}" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # Defs: drop shadow
    parts.append("<defs>")
    parts.append(
        f'<filter id="{uid}-ds" x="-4%" y="-8%" width="108%" height="120%">'
        f'<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" '
        f'flood-opacity="0.35"/></filter>'
    )
    parts.append("</defs>")

    # Background
    parts.append(
        f'<rect x="0" y="0" width="{svg_w}" height="{svg_h}" '
        f'rx="10" ry="10" fill="#0a0a12" stroke="#1e1e2e" stroke-width="1"/>'
    )

    # ── Draw connection lines ──
    # For each non-root node, draw a curved path from its parent
    for i, node in enumerate(nodes):
        d = node["depth"]
        if d == 0:
            continue

        # Find parent: most recent node at depth d-1
        parent = None
        for j in range(i - 1, -1, -1):
            if nodes[j]["depth"] == d - 1:
                parent = nodes[j]
                break
        if parent is None:
            continue

        # Connection path: from parent's right edge → curve → child's left edge
        px = parent["x"] + parent["box_w"]
        py = parent["y"] + NODE_H / 2
        cx = node["x"]
        cy = node["y"] + NODE_H / 2

        colour = DEPTH_STYLES[d % len(DEPTH_STYLES)]["stroke"]

        # Use cubic Bézier for smooth S-curve
        mid_x = (px + cx) / 2
        path_d = f"M{px:.1f},{py:.1f} C{mid_x:.1f},{py:.1f} {mid_x:.1f},{cy:.1f} {cx:.1f},{cy:.1f}"
        parts.append(
            f'<path d="{path_d}" fill="none" stroke="{colour}" '
            f'stroke-width="1.5" stroke-opacity="0.45" stroke-linecap="round"/>'
        )

        # Small dot at the connection point on the child
        parts.append(
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="2.5" fill="{colour}" fill-opacity="0.6"/>'
        )

    # ── Draw node boxes ──
    for node in nodes:
        d = node["depth"]
        style = DEPTH_STYLES[d % len(DEPTH_STYLES)]

        # Rounded rectangle
        parts.append(
            f'<rect x="{node["x"]:.1f}" y="{node["y"]:.1f}" '
            f'width="{node["box_w"]:.1f}" height="{NODE_H}" '
            f'rx="6" ry="6" fill="{style["fill"]}" '
            f'stroke="{style["stroke"]}" stroke-width="1.2" '
            f'filter="url(#{uid}-ds)"/>'
        )

        # Node name text
        text_x = node["x"] + NODE_PAD_X
        text_y = node["y"] + NODE_H / 2 + 4

        is_folder = node["name"].rstrip().endswith("/")
        weight = "600" if is_folder or d == 0 else "400"
        text_colour = "#ffffff" if d == 0 else style["text"]

        parts.append(
            f'<text x="{text_x:.1f}" y="{text_y:.1f}" '
            f'font-family="{FONT_CODE}" font-size="12" '
            f'font-weight="{weight}" fill="{text_colour}">'
            f"{_esc(_strip_box_draw(node['name']))}</text>"
        )

        # Annotation to the right of the box (dim italic)
        if node["annotation"]:
            ann_x = node["x"] + node["box_w"] + 8
            parts.append(
                f'<text x="{ann_x:.1f}" y="{text_y:.1f}" '
                f'font-family="{FONT_CODE}" font-size="10.5" '
                f'fill="#71717a" font-style="italic">'
                f"{_esc(_strip_box_draw(node['annotation']))}</text>"
            )

    parts.append("</svg>")
    return "\n".join(parts)


def _generate_flow_svg(text: str, diagram_id: int = 0) -> str:
    """Generate SVG for flow/arrow diagrams with proper graphical nodes and arrows."""
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
    FONT_LABEL = "'Inter', 'Segoe UI', system-ui, sans-serif"

    lines = text.replace("\r", "").split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ""

    uid = f"flow{diagram_id}"

    # ── Strategy A: Multi-column sequence diagram ──
    # Detect if we have two columns of text with arrows between them
    # (e.g., "  End Device    │   Gateway" style)
    flow_nodes, flow_arrows = _parse_flow_diagram(lines)

    if flow_nodes and flow_arrows:
        return _render_flow_graph(flow_nodes, flow_arrows, uid, diagram_id)

    # ── Strategy B: Line-by-line rendering with graphical elements ──
    # Parse each line into segments (text blocks and connectors)
    CW = 9
    CH = 22
    PAD = 24

    max_len = max(len(l) for l in lines)
    svg_w = max_len * CW + PAD * 2
    svg_h = len(lines) * CH + PAD * 2

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Flow diagram" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # Defs
    parts.append("<defs>")
    parts.append(
        f'<marker id="{uid}-ah" markerWidth="10" markerHeight="7" '
        f'refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">'
        f'<path d="M0,0.5 L9,3.5 L0,6.5" fill="none" stroke="#f59e0b" '
        f'stroke-width="1.2" stroke-linejoin="round"/></marker>'
    )
    parts.append(
        f'<filter id="{uid}-ds" x="-4%" y="-8%" width="108%" height="120%">'
        f'<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" '
        f'flood-opacity="0.4"/></filter>'
    )
    parts.append("</defs>")

    # Background
    parts.append(
        f'<rect x="0" y="0" width="{svg_w}" height="{svg_h}" '
        f'rx="10" ry="10" fill="#0a0a12" stroke="#1e1e2e" stroke-width="1"/>'
    )

    # Colour palette
    ARROW_COL = "#f59e0b"
    NODE_STROKE = "#60a5fa"
    NODE_FILL = "#0f1d3a"
    CONN_COL = "#4a4a5a"
    TEXT_COL = "#e4e4e7"
    DIM_COL = "#71717a"

    NODE_STYLES = [
        {"stroke": "#60a5fa", "fill": "#0c1a30", "text": "#93c5fd"},
        {"stroke": "#3ecf8e", "fill": "#0c2618", "text": "#6ee7b7"},
        {"stroke": "#f59e0b", "fill": "#261a06", "text": "#fcd34d"},
        {"stroke": "#a78bfa", "fill": "#1a0f2e", "text": "#c4b5fd"},
        {"stroke": "#f472b6", "fill": "#2a0f1e", "text": "#f9a8d4"},
    ]

    style_idx = 0

    for i, line in enumerate(lines):
        y = PAD + i * CH
        stripped = line.rstrip()
        if not stripped:
            continue

        segments = _parse_flow_line(stripped)
        x_offset = PAD

        for seg_type, seg_text in segments:
            if not seg_text:
                continue

            seg_w = len(seg_text) * CW

            if seg_type == "arrow":
                # Determine arrow direction and render graphically
                has_right = any(c in seg_text for c in "→►▶▷")
                has_left = any(c in seg_text for c in "←◄◁")
                has_down = any(c in seg_text for c in "↓▼")
                has_up = any(c in seg_text for c in "↑▲")
                has_vert = "│" in seg_text or "┃" in seg_text

                line_y = y + CH / 2

                if has_right or has_left:
                    # Horizontal arrow
                    direction = 1 if has_right else -1
                    start_x = x_offset + 4
                    end_x = x_offset + seg_w - 4

                    if direction < 0:
                        start_x, end_x = end_x, start_x

                    # Draw the line
                    parts.append(
                        f'<line x1="{start_x}" y1="{line_y}" '
                        f'x2="{end_x}" y2="{line_y}" '
                        f'stroke="{ARROW_COL}" stroke-width="2" '
                        f'marker-end="url(#{uid}-ah)"/>'
                    )
                elif has_down or has_up:
                    # Vertical arrow
                    center_x = x_offset + seg_w / 2
                    start_y = y + 2
                    end_y = y + CH - 2
                    if has_up:
                        start_y, end_y = end_y, start_y
                    parts.append(
                        f'<line x1="{center_x}" y1="{start_y}" '
                        f'x2="{center_x}" y2="{end_y}" '
                        f'stroke="{ARROW_COL}" stroke-width="2"/>'
                    )
                    # Arrow tip polygon
                    tip_y = end_y
                    tip_dir = 1 if has_down else -1
                    parts.append(
                        f'<polygon points="{center_x},{tip_y + tip_dir * 6} '
                        f'{center_x - 4},{tip_y} {center_x + 4},{tip_y}" '
                        f'fill="{ARROW_COL}"/>'
                    )
                elif has_vert:
                    # Vertical connector (no arrow)
                    center_x = x_offset + seg_w / 2
                    parts.append(
                        f'<line x1="{center_x}" y1="{y + 2}" '
                        f'x2="{center_x}" y2="{y + CH - 2}" '
                        f'stroke="{CONN_COL}" stroke-width="1.5"/>'
                    )
                else:
                    # Plain horizontal connector
                    parts.append(
                        f'<line x1="{x_offset + 4}" y1="{line_y}" '
                        f'x2="{x_offset + seg_w - 4}" y2="{line_y}" '
                        f'stroke="{CONN_COL}" stroke-width="1.5"/>'
                    )

                x_offset += seg_w
            else:
                # Text segment → draw as a graphical node box
                txt = seg_text.strip()
                if not txt:
                    x_offset += seg_w
                    continue

                # Skip purely decorative characters
                alphanumeric = sum(1 for c in txt if c.isalnum())
                if alphanumeric < 2:
                    # Small decorative text, just render as text
                    if txt.strip():
                        parts.append(
                            f'<text x="{x_offset + 4}" y="{y + CH / 2 + 4}" '
                            f'font-family="{FONT_CODE}" font-size="11" '
                            f'fill="{DIM_COL}">{_esc(_strip_box_draw(txt))}</text>'
                        )
                    x_offset += seg_w
                    continue

                # Detect node type
                is_heading = bool(re.match(r"^\d+\.\s", txt)) or txt.isupper()
                is_comment = txt.startswith("#") or txt.startswith("//") or txt.startswith("/*")
                is_annotation = txt.startswith("←") or txt.startswith("<-")

                if is_annotation:
                    # Render annotations as dim italic text
                    parts.append(
                        f'<text x="{x_offset + 4}" y="{y + CH / 2 + 4}" '
                        f'font-family="{FONT_CODE}" font-size="10.5" '
                        f'fill="{DIM_COL}" font-style="italic">{_esc(_strip_box_draw(txt))}</text>'
                    )
                elif is_comment:
                    # Render comments as dim text
                    parts.append(
                        f'<text x="{x_offset + 4}" y="{y + CH / 2 + 4}" '
                        f'font-family="{FONT_CODE}" font-size="11" '
                        f'fill="{DIM_COL}">{_esc(_strip_box_draw(txt))}</text>'
                    )
                else:
                    # Draw a node box
                    style = NODE_STYLES[style_idx % len(NODE_STYLES)]
                    style_idx += 1

                    text_w = len(txt) * CW + 16
                    box_h = CH - 2
                    bx = x_offset
                    by = y + 1

                    parts.append(
                        f'<rect x="{bx}" y="{by}" width="{text_w}" height="{box_h}" '
                        f'rx="6" ry="6" fill="{style["fill"]}" '
                        f'stroke="{style["stroke"]}" stroke-width="1.2" '
                        f'filter="url(#{uid}-ds)"/>'
                    )

                    font = FONT_LABEL if is_heading else FONT_CODE
                    weight = "600" if is_heading else "400"
                    text_colour = "#ffffff" if is_heading else style["text"]

                    parts.append(
                        f'<text x="{bx + 8}" y="{by + box_h / 2 + 4}" '
                        f'font-family="{font}" font-size="12" '
                        f'font-weight="{weight}" fill="{text_colour}">'
                        f"{_esc(_strip_box_draw(txt))}</text>"
                    )

                x_offset += seg_w

    parts.append("</svg>")
    return "\n".join(parts)


def _parse_flow_diagram(lines: List[str]) -> Tuple[List[Dict], List[Dict]]:
    """Try to parse a multi-column flow/sequence diagram into nodes and arrows.

    Returns (nodes, arrows) or ([], []) if the pattern isn't detected.
    Each node: {"name": str, "x": float, "y": float, "col": int}
    Each arrow: {"from_col": int, "to_col": int, "label": str, "y": float}
    """
    # Look for a header line with two or more column names separated by spaces
    # e.g., "  End Device                Gateway"
    header_line = None
    header_idx = -1
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped or stripped.startswith("│") or stripped.startswith("├") or stripped.startswith("└"):
            continue
        # Check if line has 2+ uppercase words that could be column names
        words = stripped.split()
        if len(words) >= 2 and all(w[0].isupper() or not w[0].isalpha() for w in words if len(w) > 1):
            # Check if subsequent lines have │ characters at similar positions
            if i + 1 < len(lines) and "│" in lines[i + 1]:
                header_line = stripped
                header_idx = i
                break

    if header_line is None:
        return [], []

    # Find column positions by looking for │ in subsequent lines
    pipe_positions = []
    for line in lines[header_idx + 1:]:
        positions = [j for j, ch in enumerate(line) if ch == "│"]
        if positions:
            pipe_positions.append(positions)
        elif line.strip():
            # Non-pipe non-blank line might be an annotation
            pass

    if not pipe_positions:
        return [], []

    # Determine column centers from pipe positions
    # Average the positions across all lines
    all_positions = set()
    for positions in pipe_positions:
        all_positions.update(positions)

    if len(all_positions) < 2:
        return [], []

    # Cluster pipe positions into columns
    sorted_pos = sorted(all_positions)
    columns = []
    current_cluster = [sorted_pos[0]]
    for p in sorted_pos[1:]:
        if p - current_cluster[-1] <= 3:
            current_cluster.append(p)
        else:
            columns.append(sum(current_cluster) / len(current_cluster))
            current_cluster = [p]
    columns.append(sum(current_cluster) / len(current_cluster))

    if len(columns) < 2:
        return [], []

    # Create nodes for column headers
    nodes = []
    words = header_line.split()
    if len(words) == len(columns):
        for i, (word, col_x) in enumerate(zip(words, columns)):
            nodes.append({"name": word, "col": i, "x": col_x, "y": 0})
    else:
        # Approximate: distribute words across columns
        for i, col_x in enumerate(columns):
            nodes.append({"name": f"Column {i+1}", "col": i, "x": col_x, "y": 0})

    # Parse arrows from subsequent lines
    arrows = []
    for line in lines[header_idx + 1:]:
        stripped = line.strip()
        if not stripped or "│" not in stripped:
            continue

        # Look for arrow patterns between pipe positions
        has_right = "→" in stripped or "──►" in stripped or "────→" in stripped or "───→" in stripped
        has_left = "←" in stripped or "◄──" in stripped or "←────" in stripped or "←───" in stripped

        if has_right or has_left:
            # Extract label text (non-box-drawing, non-arrow content)
            label = re.sub(r"[│─━┌┐└┘├┤┬┴┼→←►◄▶▷◁▼▲↑↓]", "", stripped).strip()
            label = re.sub(r"\s+", " ", label).strip()
            # Remove annotation prefix
            if "←" in label:
                label = label.split("←", 1)[0].strip()

            from_col = 0 if has_right else 1
            to_col = 1 if has_right else 0

            arrows.append({
                "from_col": from_col,
                "to_col": to_col,
                "label": label if label and len(label) < 60 else "",
                "y": len(arrows),
            })

    if len(arrows) >= 2:
        return nodes, arrows
    return [], []


def _render_flow_graph(nodes: List[Dict], arrows: List[Dict], uid: str, diagram_id: int) -> str:
    """Render a multi-column flow diagram as proper SVG with boxes and arrows."""
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
    FONT_LABEL = "'Inter', 'Segoe UI', system-ui, sans-serif"

    PAD = 32
    NODE_H = 36
    NODE_PAD_X = 16
    ARROW_GAP = 48  # vertical space for each arrow
    CHAR_W = 7.8

    num_cols = len(nodes)
    num_arrows = len(arrows)

    # Column spacing
    col_widths = [max(len(n["name"]) * CHAR_W + NODE_PAD_X * 2, 100) for n in nodes]
    col_gap = 80  # gap between columns
    total_w = sum(col_widths) + col_gap * (num_cols - 1)

    # Center columns
    start_x = PAD
    col_centers = []
    cx = start_x
    for i, w in enumerate(col_widths):
        col_centers.append(cx + w / 2)
        cx += w + col_gap

    svg_w = total_w + PAD * 2
    header_h = NODE_H + 30
    arrows_h = num_arrows * ARROW_GAP + 20
    svg_h = header_h + arrows_h + PAD * 2

    uid_f = uid

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Flow diagram: {_strip_box_draw(nodes[0]["name"])} to {_strip_box_draw(nodes[-1]["name"])}" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # Defs
    ARROW_COL = "#f59e0b"
    ARROW_COL2 = "#60a5fa"
    NODE_STROKE = "#60a5fa"
    NODE_FILL = "#0c1a30"

    parts.append("<defs>")
    # Right arrow marker
    parts.append(
        f'<marker id="{uid_f}-ar" markerWidth="10" markerHeight="7" '
        f'refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">'
        f'<path d="M0,0.5 L9,3.5 L0,6.5" fill="{ARROW_COL}" stroke="{ARROW_COL}" '
        f'stroke-width="0.5"/></marker>'
    )
    # Left arrow marker
    parts.append(
        f'<marker id="{uid_f}-al" markerWidth="10" markerHeight="7" '
        f'refX="1" refY="3.5" orient="auto" markerUnits="strokeWidth">'
        f'<path d="M9,0.5 L1,3.5 L9,6.5" fill="{ARROW_COL2}" stroke="{ARROW_COL2}" '
        f'stroke-width="0.5"/></marker>'
    )
    parts.append(
        f'<filter id="{uid_f}-ds" x="-4%" y="-8%" width="108%" height="120%">'
        f'<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" '
        f'flood-opacity="0.4"/></filter>'
    )
    parts.append("</defs>")

    # Background
    parts.append(
        f'<rect x="0" y="0" width="{svg_w}" height="{svg_h}" '
        f'rx="10" ry="10" fill="#0a0a12" stroke="#1e1e2e" stroke-width="1"/>'
    )

    # ── Column header nodes ──
    NODE_COLOURS = [
        {"stroke": "#60a5fa", "fill": "#0c1a30", "text": "#93c5fd"},
        {"stroke": "#3ecf8e", "fill": "#0c2618", "text": "#6ee7b7"},
    ]

    for i, node in enumerate(nodes):
        nc = NODE_COLOURS[i % len(NODE_COLOURS)]
        nw = col_widths[i]
        nx = col_centers[i] - nw / 2
        ny = PAD

        # Column header box
        parts.append(
            f'<rect x="{nx}" y="{ny}" width="{nw}" height="{NODE_H}" '
            f'rx="8" ry="8" fill="{nc["fill"]}" '
            f'stroke="{nc["stroke"]}" stroke-width="1.5" '
            f'filter="url(#{uid_f}-ds)"/>'
        )
        parts.append(
            f'<text x="{col_centers[i]}" y="{ny + NODE_H / 2 + 5}" '
            f'text-anchor="middle" font-family="{FONT_LABEL}" font-size="13" '
            f'font-weight="600" fill="{nc["text"]}">{_esc(_strip_box_draw(node["name"]))}</text>'
        )

    # ── Vertical guide lines under each column ──
    guide_top = PAD + NODE_H + 4
    guide_bottom = svg_h - PAD
    for i in range(num_cols):
        parts.append(
            f'<line x1="{col_centers[i]}" y1="{guide_top}" '
            f'x2="{col_centers[i]}" y2="{guide_bottom}" '
            f'stroke="#2a2a3a" stroke-width="1" stroke-dasharray="4,4"/>'
        )

    # ── Arrows ──
    for idx, arrow in enumerate(arrows):
        y_center = header_h + PAD + idx * ARROW_GAP + ARROW_GAP / 2

        from_cx = col_centers[arrow["from_col"]]
        to_cx = col_centers[arrow["to_col"]]

        from_edge = from_cx + (col_widths[arrow["from_col"]] / 2 + 4) * (1 if to_cx > from_cx else -1)
        to_edge = to_cx - (col_widths[arrow["to_col"]] / 2 + 4) * (1 if to_cx > from_cx else -1)

        is_right = to_cx > from_cx
        arrow_col = ARROW_COL if is_right else ARROW_COL2
        marker = f"url(#{uid_f}-ar)" if is_right else f"url(#{uid_f}-al)"

        # Arrow line
        parts.append(
            f'<line x1="{from_edge}" y1="{y_center}" '
            f'x2="{to_edge}" y2="{y_center}" '
            f'stroke="{arrow_col}" stroke-width="2.5" '
            f'marker-end="{marker}" stroke-linecap="round"/>'
        )

        # Label above the arrow
        if arrow["label"]:
            label_x = (from_edge + to_edge) / 2
            label_y = y_center - 10
            parts.append(
                f'<text x="{label_x}" y="{label_y}" text-anchor="middle" '
                f'font-family="{FONT_CODE}" font-size="10.5" '
                f'fill="#a1a1aa">{_esc(_strip_box_draw(arrow["label"]))}</text>'
            )

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

    Strategy:
    - Detect section separators (═══, ───) and render as graphical lines
    - Detect section headers (numbered items, ALL CAPS) and render in styled boxes
    - Group content between separators into visual sections
    - Commands/code lines render in styled panels with a left accent bar
    - Annotations/arrows rendered as styled text
    - Pure unstructured text falls back to clean monospace rendering
    """
    FONT_CODE = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
    FONT_LABEL = "'Inter', 'Segoe UI', system-ui, sans-serif"

    lines = text.replace("\r", "").split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ""

    CW = 8.5
    CH = 20
    PAD = 24
    SECTION_PAD = 12  # padding inside section panels
    CHAR_W = CW

    # ── Analyse lines into typed segments ──
    analysed = []
    for line in lines:
        stripped = line.rstrip()
        info = {"raw": stripped, "type": "text"}

        if not stripped:
            info["type"] = "blank"
        elif re.match(r"^\s*[═]{3,}\s*$", stripped):
            info["type"] = "separator_heavy"
        elif re.match(r"^\s*[━]{3,}\s*$", stripped):
            info["type"] = "separator_heavy"
        elif re.match(r"^\s*[─]{5,}\s*$", stripped) or re.match(r"^\s*[-]{5,}\s*$", stripped):
            info["type"] = "separator_light"
        elif re.match(r"^\s*\d+\.\s+\S", stripped):
            info["type"] = "step"
        elif stripped.isupper() and len(stripped) > 3 and " " in stripped:
            info["type"] = "heading"
        elif re.match(r"^\s*[✅❌✓✗✔✘●○•]\s", stripped):
            info["type"] = "bullet"
        elif any(ch in stripped for ch in "→←↓↑►◄▶"):
            info["type"] = "arrow_text"
        elif stripped.lstrip().startswith("#") or stripped.lstrip().startswith("//"):
            info["type"] = "comment"
        else:
            info["type"] = "text"

        analysed.append(info)

    # ── Group into visual sections ──
    # A section starts after a heavy separator and ends before the next one
    sections = []  # list of {"start": int, "end": int, "title": str, "lines": list}
    current_section = {"start": 0, "end": len(analysed), "title": "", "lines": []}

    for i, info in enumerate(analysed):
        if info["type"] == "separator_heavy":
            # End previous section
            if current_section["lines"]:
                sections.append(current_section)
            # Start new section
            current_section = {"start": i + 1, "end": len(analysed), "title": "", "lines": []}
            # Look ahead for a title
            for j in range(i + 1, min(i + 3, len(analysed))):
                if analysed[j]["type"] in ("heading", "step") and not current_section["title"]:
                    current_section["title"] = analysed[j]["raw"].strip()
                    break
        else:
            current_section["lines"].append((i, info))

    if current_section["lines"]:
        sections.append(current_section)

    # If no sections found, treat the whole thing as one section
    if not sections:
        sections = [{"start": 0, "end": len(analysed), "title": "", "lines": [(i, a) for i, a in enumerate(analysed)]}]

    # ── Calculate dimensions ──
    max_line_len = max(len(l) for l in lines)
    svg_w = max_line_len * CW + PAD * 2 + SECTION_PAD * 2
    svg_w = max(svg_w, 300)

    # Estimate height
    total_text_lines = sum(1 for a in analysed if a["type"] != "blank")
    section_count = len(sections)
    svg_h = (
        PAD * 2
        + total_text_lines * CH
        + section_count * 24  # section header + padding
        + sum(1 for a in analysed if a["type"] == "separator_heavy") * 8
    )

    uid = f"gen{diagram_id}"

    # ── Build SVG ──
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {svg_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Diagram" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
    ]

    # Defs
    parts.append("<defs>")
    parts.append(
        f'<filter id="{uid}-ds" x="-4%" y="-8%" width="108%" height="120%">'
        f'<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" '
        f'flood-opacity="0.3"/></filter>'
    )
    parts.append("</defs>")

    # Background
    parts.append(
        f'<rect x="0" y="0" width="{svg_w}" height="{svg_h}" '
        f'rx="10" ry="10" fill="#0a0a12" stroke="#1e1e2e" stroke-width="1"/>'
    )

    # ── Colour palette ──
    SECTION_COLORS = [
        {"accent": "#60a5fa", "bg": "#0c1420"},  # blue
        {"accent": "#3ecf8e", "bg": "#0c1a14"},  # green
        {"accent": "#f59e0b", "bg": "#1a1408"},  # amber
        {"accent": "#a78bfa", "bg": "#140c20"},  # purple
        {"accent": "#f472b6", "bg": "#1a0c14"},  # pink
    ]

    # ── Render sections ──
    y = PAD
    for sec_idx, section in enumerate(sections):
        colors = SECTION_COLORS[sec_idx % len(SECTION_COLORS)]
        has_panel = len(section["lines"]) >= 3  # only draw panel if enough content

        # Section title
        if section["title"] and has_panel:
            title = section["title"]
            # Draw section title badge
            title_w = len(title) * CW + 20
            title_h = 22
            tx = PAD + 8
            ty = y

            parts.append(
                f'<rect x="{tx}" y="{ty}" width="{title_w}" height="{title_h}" '
                f'rx="4" ry="4" fill="{colors["accent"]}" fill-opacity="0.15" '
                f'stroke="{colors["accent"]}" stroke-width="0.8"/>'
            )
            parts.append(
                f'<text x="{tx + 10}" y="{ty + 15}" '
                f'font-family="{FONT_LABEL}" font-size="11" '
                f'font-weight="600" fill="{colors["accent"]}">{_esc(_strip_box_draw(title))}</text>'
            )
            y += title_h + 6

        # Section panel background (if enough lines)
        panel_top = y
        panel_lines_count = sum(1 for _, info in section["lines"] if info["type"] != "blank")

        # Render each line
        for idx, (line_idx, info) in enumerate(section["lines"]):
            if info["type"] == "blank":
                y += CH * 0.4
                continue

            stripped = info["raw"].rstrip()

            if info["type"] == "separator_light":
                # Draw a graphical separator line
                sep_x1 = PAD + SECTION_PAD
                sep_x2 = svg_w - PAD - SECTION_PAD
                y += CH * 0.3
                parts.append(
                    f'<line x1="{sep_x1}" y1="{y}" x2="{sep_x2}" y2="{y}" '
                    f'stroke="#3a3a4a" stroke-width="1" stroke-dasharray="6,3"/>'
                )
                y += CH * 0.5
                continue

            if info["type"] == "step":
                # Numbered step → render as a styled node
                step_match = re.match(r"^\s*(\d+)\.\s+(.*)", stripped)
                if step_match:
                    num = step_match.group(1)
                    step_text = step_match.group(2)
                    indent = len(stripped) - len(stripped.lstrip())

                    bx = PAD + SECTION_PAD + indent * CW
                    by = y - CH + 6
                    bw = len(step_text) * CW + 36
                    bh = CH + 2

                    # Step number circle
                    circle_r = 10
                    circle_x = bx + circle_r + 2
                    circle_y = by + bh / 2

                    parts.append(
                        f'<circle cx="{circle_x}" cy="{circle_y}" r="{circle_r}" '
                        f'fill="{colors["accent"]}" fill-opacity="0.2" '
                        f'stroke="{colors["accent"]}" stroke-width="1"/>'
                    )
                    parts.append(
                        f'<text x="{circle_x}" y="{circle_y + 4}" text-anchor="middle" '
                        f'font-family="{FONT_LABEL}" font-size="10" '
                        f'font-weight="600" fill="{colors["accent"]}">{_esc(num)}</text>'
                    )

                    # Step text
                    parts.append(
                        f'<text x="{bx + circle_r * 2 + 10}" y="{y + 4}" '
                        f'font-family="{FONT_CODE}" font-size="12" '
                        f'fill="#e4e4e7">{_esc(_strip_box_draw(step_text))}</text>'
                    )
                    y += CH + 2
                    continue

            if info["type"] == "heading":
                parts.append(
                    f'<text x="{PAD + SECTION_PAD}" y="{y + 4}" '
                    f'font-family="{FONT_LABEL}" font-size="12.5" '
                    f'font-weight="600" fill="#ffffff">{_esc(_strip_box_draw(stripped))}</text>'
                )
                y += CH + 2
                continue

            if info["type"] == "comment":
                # Comment line → styled with left accent
                indent = len(stripped) - len(stripped.lstrip())
                lx = PAD + SECTION_PAD + indent * CW
                ly = y - CH + 8

                # Left accent bar
                parts.append(
                    f'<rect x="{lx - 3}" y="{ly}" width="2" height="{CH}" '
                    f'rx="1" ry="1" fill="{colors["accent"]}" fill-opacity="0.3"/>'
                )

                parts.append(
                    f'<text x="{lx + 4}" y="{y + 4}" '
                    f'font-family="{FONT_CODE}" font-size="11.5" '
                    f'fill="#71717a">{_esc(_strip_box_draw(stripped))}</text>'
                )
                y += CH
                continue

            if info["type"] == "bullet":
                indent = len(stripped) - len(stripped.lstrip())
                lx = PAD + SECTION_PAD + indent * CW
                # Bullet dot
                parts.append(
                    f'<circle cx="{lx + 4}" cy="{y}" r="2.5" '
                    f'fill="{colors["accent"]}" fill-opacity="0.7"/>'
                )
                bullet_text = re.sub(r"^\s*[✅❌✓✗✔✘●○•]\s*", "", stripped)
                parts.append(
                    f'<text x="{lx + 14}" y="{y + 4}" '
                    f'font-family="{FONT_CODE}" font-size="11.5" '
                    f'fill="#a1a1aa">{_esc(_strip_box_draw(bullet_text))}</text>'
                )
                y += CH
                continue

            if info["type"] == "arrow_text":
                parts.append(
                    f'<text x="{PAD + SECTION_PAD}" y="{y + 4}" '
                    f'font-family="{FONT_CODE}" font-size="11.5" '
                    f'fill="#f59e0b">{_esc(_strip_box_draw(stripped))}</text>'
                )
                y += CH
                continue

            # Default text
            parts.append(
                f'<text x="{PAD + SECTION_PAD}" y="{y + 4}" '
                f'font-family="{FONT_CODE}" font-size="11.5" '
                f'fill="#a1a1aa">{_esc(_strip_box_draw(stripped))}</text>'
            )
            y += CH

        # Draw section panel background (behind text with opacity)
        if has_panel and panel_lines_count >= 3:
            panel_bottom = y + 4
            panel_x = PAD + 2
            panel_w = svg_w - PAD * 2 - 4
            panel_h = panel_bottom - panel_top + SECTION_PAD

            # Insert panel rect at the beginning (will be behind text)
            # We can't easily insert at beginning, so we'll skip the background panel
            # for simplicity — the accent bars and section headers provide enough visual structure

        y += 8  # gap between sections

    # ── Adjust viewBox to actual content height ──
    actual_h = y + PAD
    parts[0] = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {svg_w} {actual_h}" '
        f'class="ascii-diagram" role="img" '
        f'aria-label="Diagram" '
        f'style="max-width:100%;height:auto;display:block;margin:1.5em auto">'
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
        f'aria-label="{_esc(_strip_box_draw(title)) if title else "Diagram"}" '
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
                f'fill="#e4e4e7">{_esc(_strip_box_draw(stripped_line))}</text>'
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
            f'fill="{color}">{_esc(_strip_box_draw(stripped))}</text>'
        )

    parts.append("</svg>")
    return "\n".join(parts)


# ── HTML file processing ───────────────────────────────────────────────────────

def _strip_inner_html(inner: str) -> str:
    """Strip <code> tags and unescape HTML entities from <pre> inner content."""
    text = re.sub(r"<code[^>]*>", "", inner)
    text = re.sub(r"</code>", "", text)
    text = html_mod.unescape(text)
    return text


def find_pre_blocks(content: str) -> List[Dict]:
    """Return a list of dicts describing each <pre>…</pre> block."""
    pattern = re.compile(r"<pre(?:\s[^>]*)?>(.*?)</pre>", re.DOTALL)
    blocks = []
    for m in pattern.finditer(content):
        raw_inner = m.group(1)
        blocks.append(
            {
                "full": m.group(0),
                "inner": _strip_inner_html(raw_inner),
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


if __name__ == "__mai