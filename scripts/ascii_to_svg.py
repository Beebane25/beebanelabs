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

    first_line = ""
    for line in stripped.split("\n"):
        ls = line.strip()
        if ls:
            first_line = ls
            break
    if not first_line:
        return False

    # Reject code blocks
    if CODE_STARTERS.match(first_line):
        return False

    # Count box-drawing characters
    bd_count = sum(1 for ch in stripped if ch in BOX_DRAW)
    if bd_count >= 5:
        return True

    # Count lines with ┌ or └
    corner_lines = sum(
        1 for line in stripped.split("\n") if "┌" in line or "└" in line
    )
    if corner_lines >= 3:
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


def generate_svg(text: str, diagram_id: int = 0) -> str:
    """Convert ASCII art text to an inline SVG string."""
    grid = _normalize_grid(text)
    if not grid:
        return ""

    rows = len(grid)
    cols = len(grid[0]) if grid else 0

    # ── find boxes ──
    all_boxes = find_all_boxes(grid)
    if not all_boxes:
        return ""  # nothing to convert

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
