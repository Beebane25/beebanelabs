#!/usr/bin/env python3
"""CSS Optimizer for BeebaneLabs style.css
Performs safe optimizations to reduce file size while preserving functionality.
"""

import re
import sys

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

def optimize_css(css):
    original_size = len(css)
    
    # === 1. REMOVE REDUNDANT VENDOR PREFIXES ===
    # Remove -webkit- for standard properties (keep needed ones)
    # Keep: -webkit-background-clip, -webkit-text-fill-color, -webkit-line-clamp,
    #        -webkit-box-orient, -webkit-backdrop-filter, -webkit-font-smoothing,
    #        -webkit-text-size-adjust, -webkit-overflow-scrolling (still needed for older iOS)
    #        -webkit-box (used with line-clamp)
    
    # Remove standalone -webkit-border-radius lines (standard since 2012)
    css = re.sub(r'\s*-webkit-border-radius:\s*[^;]+;\n?', '', css)
    # Remove standalone -webkit-box-shadow lines
    css = re.sub(r'\s*-webkit-box-shadow:\s*[^;]+;\n?', '', css)
    # Remove standalone -webkit-transform lines (not compound with other -webkit- props)
    css = re.sub(r'\s*-webkit-transform:\s*[^;]+;\n?', '', css)
    # Remove standalone -webkit-transition lines
    css = re.sub(r'\s*-webkit-transition:\s*[^;]+;\n?', '', css)
    # Remove standalone -webkit-animation lines  
    css = re.sub(r'\s*-webkit-animation:\s*[^;]+;\n?', '', css)
    
    # === 2. REMOVE EMPTY RULES ===
    # Match selectors with empty blocks (including whitespace-only)
    css = re.sub(r'[^{}]+\{\s*\}', '', css)
    
    # === 3. REMOVE REDUNDANT !IMPORTANT IN PRINT ===
    # The !important in @media print is actually needed to override cascade, keep those
    
    # === 4. REMOVE DUPLICATE @keyframes ===
    # Remove duplicate @keyframes spin (keep the last one at end of file)
    # Find all @keyframes spin blocks and keep only the last
    spin_blocks = list(re.finditer(r'@keyframes\s+spin\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}', css))
    if len(spin_blocks) > 1:
        for block in spin_blocks[:-1]:
            css = css.replace(block.group(), '', 1)
    
    # Remove duplicate @keyframes shimmer
    shimmer_blocks = list(re.finditer(r'@keyframes\s+shimmer\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}', css))
    if len(shimmer_blocks) > 1:
        for block in shimmer_blocks[:-1]:
            css = css.replace(block.group(), '', 1)
    
    # === 5. SPECIFIC DUPLICATE RULE REMOVALS ===
    
    # Remove duplicate .pricing-grid inside 768px media (appears at lines ~328 and ~348)
    # Pattern: remove the second occurrence inside the same media block
    css = remove_duplicate_in_media(css, '.pricing-grid', 768)
    
    # Remove duplicate .flow-step inside 768px media
    css = remove_duplicate_in_media(css, '.flow-step', 768)
    
    # Remove first .scroll-progress definition (overridden by later enhanced version)
    # The first one is at ~1516, the enhanced one at ~2333
    first_progress = re.search(
        r'/\* === SCROLL PROGRESS BAR === \*/\n\.scroll-progress\s*\{[^}]+\}',
        css
    )
    enhanced_progress = re.search(
        r'/\* === READING PROGRESS BAR \(ENHANCED\) === \*/\n\.scroll-progress\s*\{[^}]+\}',
        css
    )
    if first_progress and enhanced_progress:
        css = css.replace(first_progress.group(), '/* Scroll progress - see enhanced version below */', 1)
    
    # Remove first .section-divider (overridden by later version)
    first_divider = re.search(
        r'/\* === SMOOTH SECTION DIVIDER === \*/\n\.section-divider\s*\{[^}]+\}',
        css
    )
    later_divider = re.search(
        r'/\* === GLOWING SECTION DIVIDERS === \*/\n\.section-divider\s*\{[^}]+\}',
        css
    )
    if first_divider and later_divider:
        css = css.replace(first_divider.group(), '/* Section divider - see glowing version below */', 1)
    
    # Remove first .skeleton block and its @keyframes shimmer (overridden by later version)
    first_skeleton = re.search(
        r'/\* === LOADING SKELETON === \*/\n\.skeleton\s*\{[^}]+\}\n\.skeleton-text\s*\{[^}]+\}\n\.skeleton-title\s*\{[^}]+\}\n\.skeleton-card\s*\{[^}]+\}\n@keyframes shimmer\s*\{[^}]+\}',
        css
    )
    if first_skeleton:
        css = css.replace(first_skeleton.group(), '/* Loading skeleton - see enhanced version below */', 1)
    
    # Remove duplicate .back-to-top transition rules (keep the last enhanced version)
    # Remove the intermediate override at ~1802
    back_to_top_override = re.search(
        r'/\* === SCROLL-TO-TOP SMOOTH ANIMATION === \*/\n\.back-to-top\s*\{\s*\n\s*transition: all 0\.3s cubic-bezier\(0\.16, 1, 0\.3, 1\);\s*\n\}\n\.back-to-top:hover\s*\{\s*\n\s*transform: translateY\(-3px\) scale\(1\.05\);\s*\n\}',
        css
    )
    if back_to_top_override:
        css = css.replace(back_to_top_override.group(), '/* Back-to-top - see enhanced version below */', 1)
    
    # Remove earlier back-to-top enhanced version (~2032-2033) - superseded by ~2404
    back_to_top_enhanced = re.search(
        r'/\* === BACK TO TOP ENHANCED === \*/\n\.back-to-top\s*\{\s*\n\s*transition: all 0\.3s ease;\s*\n\}\n\.back-to-top:hover\s*\{\s*\n\s*transform: translateY\(-3px\);\s*box-shadow: 0 4px 15px rgba\(62, 207, 142, 0\.3\);\s*\n\}',
        css
    )
    if back_to_top_enhanced:
        css = css.replace(back_to_top_enhanced.group(), '/* Back-to-top hover - see enhanced version below */', 1)
    
    # Remove first .reading-progress-bar definition (unused - JS uses .reading-progress)
    reading_progress_bar = re.search(
        r'/\* === Reading Progress Bar === \*/\n\.reading-progress-bar\s*\{[^}]+\}\n',
        css
    )
    if reading_progress_bar:
        css = css.replace(reading_progress_bar.group(), '/* Reading progress - using .reading-progress class */\n', 1)
    
    # === 6. REMOVE REDUNDANT -webkit-overflow-scrolling ===
    # This property is deprecated in modern iOS (13+) and does nothing
    # But keep it for backward compat on older devices - it's harmless
    
    # === 7. CONSOLIDATE DUPLICATE DECLARATIONS ===
    # Remove duplicate .article-card .content h3 (first at ~508, better version at ~651)
    # These have same selector but different properties - later one adds more
    # The later one at 651 completely overrides font-size, font-weight, etc.
    # Since line 508 is inside a block with other selectors, we need to handle carefully
    
    # === 8. MINIFY WHITESPACE ===
    # Remove excessive blank lines (3+ consecutive newlines → 2)
    css = re.sub(r'\n{3,}', '\n\n', css)
    
    # Remove trailing whitespace on lines
    css = re.sub(r'[ \t]+$', '', css, flags=re.MULTILINE)
    
    # Remove spaces before { and after :
    # (be careful - don't break content in strings or complex selectors)
    # Just clean up some safe patterns
    
    # Compact single-property rules that are on multiple lines to single lines
    # This is too risky for a complex file, skip it
    
    # Remove empty comment-only lines
    css = re.sub(r'\n\s*\n\s*/\*', '\n/*', css)
    
    # === 9. REMOVE DUPLICATE img RULE ===
    # img { max-width: 100%; height: auto; } appears at line 112 and ~2351
    img_rules = list(re.finditer(r'^img\s*\{[^}]+\}', css, re.MULTILINE))
    if len(img_rules) > 1:
        # Keep the first one (simpler), remove the second
        css = css[:img_rules[-1].start()] + css[img_rules[-1].end():]
    
    # === 10. FINAL CLEANUP ===
    # Remove multiple blank lines again
    css = re.sub(r'\n{3,}', '\n\n', css)
    
    # Remove blank lines between closing } and comment
    css = re.sub(r'\}\n\n+(/\*)', r'}\n\1', css)
    
    # Ensure file ends with single newline
    css = css.rstrip('\n') + '\n'
    
    new_size = len(css)
    reduction = ((original_size - new_size) / original_size) * 100
    print(f"Original size: {original_size:,} bytes")
    print(f"Optimized size: {new_size:,} bytes")
    print(f"Reduction: {original_size - new_size:,} bytes ({reduction:.1f}%)")
    
    return css


def remove_duplicate_in_media(css, selector, max_width):
    """Remove duplicate selector definitions inside a specific media query block."""
    # Find the media block
    media_pattern = rf'@media\s*\(max-width:\s*{max_width}px\)\s*\{{'
    media_matches = list(re.finditer(media_pattern, css))
    
    for media_match in media_matches:
        # Find the matching closing brace
        start = media_match.start()
        brace_count = 0
        i = media_match.end() - 1  # Start at the opening {
        media_end = i
        while i < len(css):
            if css[i] == '{':
                brace_count += 1
            elif css[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    media_end = i + 1
                    break
            i += 1
        
        media_block = css[start:media_end]
        
        # Find all instances of this selector in the media block
        escaped_sel = re.escape(selector)
        sel_pattern = rf'{escaped_sel}\s*\{{[^}}]*\}}'
        matches = list(re.finditer(sel_pattern, media_block))
        
        if len(matches) > 1:
            # Remove all but the last occurrence
            for match in reversed(matches[:-1]):
                # Calculate absolute position in css string
                abs_start = start + match.start()
                abs_end = start + match.end()
                # Also remove trailing newline
                while abs_end < len(css) and css[abs_end] == '\n':
                    abs_end += 1
                css = css[:abs_start] + css[abs_end:]
    
    return css


if __name__ == '__main__':
    css_path = r'C:\Users\user\Documents\pribadi\web adsence\css\style.css'
    
    print("=== BeebaneLabs CSS Optimizer ===\n")
    css = read_file(css_path)
    optimized = optimize_css(css)
    write_file(css_path, optimized)
    print("\nDone! File optimized successfully.")
