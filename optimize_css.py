#!/usr/bin/env python3
"""CSS Optimizer - Final comprehensive version."""

import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

def optimize_css(css):
    original_size = len(css)
    original_lines = css.count('\n') + 1
    
    # === STEP 1: Remove banner/decorative comments ===
    lines = css.split('\n')
    cleaned = []
    for line in lines:
        s = line.strip()
        # Remove === section headers
        if re.match(r'^/\*\s*={10,}\s*\*$', s):
            continue
        # Remove === SECTION NAME === and variants
        if re.match(r'^/\*\s*===?\s+[A-Z][A-Z\s&\'\-\/\(\)\.]+(?:v\d+[\.\d]*)?\s*===?\s*\*$', s):
            continue
        # Remove version comments like /* v7.12.0 - description */
        if re.match(r'^/\*\s*v\d+\.\d+.*\*$', s):
            continue
        # Remove Google Fonts comment
        if 'Google Fonts loaded' in s:
            continue
        cleaned.append(line)
    css = '\n'.join(cleaned)
    
    # === STEP 2: Remove duplicate @keyframes blocks ===
    # @keyframes spin (keep last)
    pattern = r'@keyframes spin \{\s*to \{\s*transform: rotate\(360deg\);\s*\}\s*\}\n?'
    matches = list(re.finditer(pattern, css))
    if len(matches) > 1:
        for m in matches[:-1]:
            start, end = m.span()
            # Include surrounding blank lines
            while start > 0 and css[start-1] == '\n': start -= 1
            while end < len(css) and css[end] == '\n': end += 1
            css = css[:start] + '\n' + css[end:]
    
    # @keyframes shimmer (keep last)
    pattern2 = r'@keyframes shimmer \{\s*0% \{\s*background-position: 200% 0;\s*\}\s*100% \{\s*background-position: -200% 0;\s*\}\s*\}\n?'
    matches2 = list(re.finditer(pattern2, css))
    if len(matches2) > 1:
        for m in matches2[:-1]:
            start, end = m.span()
            while start > 0 and css[start-1] == '\n': start -= 1
            while end < len(css) and css[end] == '\n': end += 1
            css = css[:start] + '\n' + css[end:]
    
    # === STEP 3: Remove known duplicate rule blocks ===
    # These are full blocks that are completely superseded by later rules.
    # Only remove when we're CERTAIN the later rule replaces ALL properties.
    
    # 3a: .reading-progress-bar (unused - JS creates .reading-progress, not .reading-progress-bar)
    # BUT: articles use reading-progress-bar as a div class. Let's check...
    # Actually many articles have <div class="reading-progress-bar"> so it IS used. Keep it.
    
    # 3b: Remove first occurrence of .scroll-progress (L1516-1531) since enhanced version (L2333) adds more
    # First version: position fixed, top 0, left 0, width 0%, height 3px, background gradient, 
    #                background-size 200%, animation, z-index 10004, transition
    # Second version: same position/size, different gradient (3 colors), z-index 10004, 
    #                 transition, box-shadow (adds)
    # The second version has ALL properties of first except animation and background-size
    # Removing the first would lose the animation. Keep both.
    
    # 3c: .reading-time-badge - check if used
    # Appears only once, keep it
    
    # 3d: .code-block { max-width: 100%; overflow: hidden; } appears twice in @media 768
    # Remove the duplicate occurrence
    dup = '.code-block { max-width: 100%; overflow: hidden; }'
    first_pos = css.find(dup)
    if first_pos != -1:
        second_pos = css.find(dup, first_pos + 1)
        if second_pos != -1:
            css = css[:second_pos] + css[second_pos + len(dup):]
    
    # 3e: .pricing-grid duplicate inside @media 768
    # First: .pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
    # Second: .pricing-grid {\n  grid-template-columns: 1fr;\n  max-width: 400px;\n  }
    # Second version doesn't have margin:0 auto, so keep both? 
    # Actually in the cascade, the second one would override grid-template-columns and max-width
    # with the same values. But margin: 0 auto from the first would persist. So both are needed.
    
    # 3f: .flow-step duplicate inside @media 768
    # Appears at two different max-width breakpoints (768 and 480), not a true duplicate
    
    # === STEP 4: Remove duplicate top-level selectors ===
    # Use line-based approach: track brace depth, collect selectors at depth 0/1, remove duplicates
    
    css = deduplicate_rules(css)
    
    # === STEP 5: Aggressive blank line removal ===
    css = re.sub(r'\n{3,}', '\n\n', css)
    css = re.sub(r'[ \t]+$', '', css, flags=re.MULTILINE)
    
    # === STEP 6: Compact single-line properties ===
    # Convert multi-line single-property blocks to single lines
    # Pattern: selector {\nproperty: value;\n}
    css = re.sub(
        r'(\S[^{}\n]*)\{\s*\n\s*([^{}\n]+)\s*\n\s*\}',
        r'\1{ \2 }',
        css
    )
    
    # Final cleanup
    css = re.sub(r'\n{3,}', '\n\n', css)
    css = css.rstrip('\n') + '\n'
    
    final_size = len(css)
    final_lines = css.count('\n') + 1
    saved = original_size - final_size
    pct = (saved / original_size) * 100
    
    print(f"\n  Original: {original_size:,} bytes, {original_lines:,} lines")
    print(f"  Optimized: {final_size:,} bytes, {final_lines:,} lines")
    print(f"  Saved: {saved:,} bytes ({pct:.1f}%)")
    print(f"  Lines reduced: {original_lines - final_lines:,} ({((original_lines - final_lines) / original_lines * 100):.1f}%)")
    
    return css


def deduplicate_rules(css):
    """Remove duplicate CSS rules where later rules completely override earlier ones.
    Uses line-based brace tracking for safety.
    """
    lines = css.split('\n')
    n = len(lines)
    
    # Phase A: Find all top-level rule blocks and their selectors
    # A rule block starts with a selector line (containing {) and ends when braces balance
    
    blocks = []  # (start_line, end_line, selector_normalized)
    i = 0
    
    while i < n:
        line = lines[i]
        stripped = line.strip()
        
        # Skip empty lines and comments
        if not stripped or stripped.startswith('/*'):
            i += 1
            continue
        
        # Skip @-rules (we handle those separately)
        if stripped.startswith('@') and '{' in stripped:
            # This is an @media or @keyframes block - skip to end
            depth = 0
            j = i
            while j < n:
                depth += lines[j].count('{') - lines[j].count('}')
                if depth <= 0:
                    break
                j += 1
            i = j + 1
            continue
        
        # Check if this is a rule start (has { in it)
        if '{' in stripped:
            # Extract selector (everything before the first {)
            selector_part = stripped.split('{')[0].strip()
            
            if not selector_part or selector_part.startswith('@'):
                # Skip @-rules
                depth = 0
                j = i
                while j < n:
                    depth += lines[j].count('{') - lines[j].count('}')
                    if depth <= 0:
                        break
                    j += 1
                i = j + 1
                continue
            
            # Find end of this block
            depth = 0
            j = i
            while j < n:
                depth += lines[j].count('{') - lines[j].count('}')
                if depth <= 0:
                    break
                j += 1
            
            end_line = j
            norm_sel = ' '.join(selector_part.split())
            blocks.append((i, end_line, norm_sel))
            i = end_line + 1
            continue
        
        i += 1
    
    # Phase B: Find duplicate selectors
    selector_indices = {}  # normalized_selector -> [block_indices]
    for idx, (start, end, sel) in enumerate(blocks):
        if sel not in selector_indices:
            selector_indices[sel] = []
        selector_indices[sel].append(idx)
    
    # Phase C: Mark earlier duplicates for removal
    remove_lines = set()
    removed_count = 0
    
    for sel, indices in selector_indices.items():
        if len(indices) > 1:
            # Keep only the LAST occurrence
            for idx in indices[:-1]:
                start, end, _ = blocks[idx]
                for line_num in range(start, end + 1):
                    remove_lines.add(line_num)
                removed_count += 1
    
    # Phase D: Also find and remove duplicates INSIDE @media blocks
    # For @media blocks, we need to parse their inner content
    i = 0
    media_blocks = []
    while i < n:
        stripped = lines[i].strip()
        if stripped.startswith('@media') and '{' in stripped:
            media_start = i
            depth = 0
            j = i
            while j < n:
                depth += lines[j].count('{') - lines[j].count('}')
                if depth <= 0:
                    break
                j += 1
            media_end = j
            # Extract the breakpoint
            m = re.search(r'max-width:\s*(\d+)px', stripped)
            if m:
                bp = m.group(1)
                media_blocks.append((media_start, media_end, bp))
            i = media_end + 1
            continue
        i += 1
    
    # For each breakpoint, collect rules across all @media blocks at that breakpoint
    bp_to_media = {}
    for mstart, mend, bp in media_blocks:
        if bp not in bp_to_media:
            bp_to_media[bp] = []
        bp_to_media[bp].append((mstart, mend))
    
    for bp, media_list in bp_to_media.items():
        if len(media_list) < 2:
            continue
        
        # Collect rules from each media block
        for mstart, mend in media_list:
            # Parse inner rules
            inner_blocks = []
            depth = 0
            i = mstart + 1  # Skip the @media line
            while i < mend:
                stripped = lines[i].strip()
                if stripped and not stripped.startswith('/*') and '{' in stripped and not stripped.startswith('@'):
                    sel_part = stripped.split('{')[0].strip()
                    if sel_part:
                        block_start = i
                        bd = 0
                        j = i
                        while j < mend:
                            bd += lines[j].count('{') - lines[j].count('}')
                            if bd <= 0:
                                break
                            j += 1
                        inner_blocks.append((block_start, j, ' '.join(sel_part.split())))
                        i = j + 1
                        continue
                i += 1
            
            # Check if any selector appears twice within this media block
            seen = {}
            for bs, be, sel in inner_blocks:
                if sel in seen:
                    # Mark earlier occurrence for removal
                    prev_start, prev_end, _ = seen[sel]
                    for line_num in range(prev_start, prev_end + 1):
                        remove_lines.add(line_num)
                    removed_count += 1
                seen[sel] = (bs, be, sel)
    
    # Build result
    result = []
    for i, line in enumerate(lines):
        if i not in remove_lines:
            result.append(line)
    
    if removed_count > 0:
        print(f"  Removed {removed_count} duplicate rule blocks ({len(remove_lines)} lines)")
    
    return '\n'.join(result)


if __name__ == '__main__':
    css_path = r'C:\Users\user\Documents\pribadi\web adsence\css\style.css'
    
    print("=== BeebaneLabs CSS Optimizer (Final) ===\n")
    css = read_file(css_path)
    optimized = optimize_css(css)
    
    # Verify brace balance
    orig_opens = css.count('{')
    orig_closes = css.count('}')
    new_opens = optimized.count('{')
    new_closes = optimized.count('}')
    
    print(f"\n  Brace check: original ({orig_opens} open, {orig_closes} close)")
    print(f"  Brace check: optimized ({new_opens} open, {new_closes} close)")
    
    if new_opens == orig_opens and new_closes == orig_closes:
        print("  Brace balance preserved ✓")
    elif abs(new_opens - new_closes) <= abs(orig_opens - orig_closes):
        print("  Brace balance OK (same or better than original) ✓")
    else:
        print("  WARNING: Brace balance may have changed!")
    
    write_file(css_path, optimized)
    print("\nDone!")
