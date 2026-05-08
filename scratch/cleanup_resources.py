
import re

file_path = r"c:\Users\Windows\Pictures\Template\src\pages\Resources.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove "odds" from ManualSection type
content = content.replace('| "odds"\n  | "promotions"', '| "promotions"')

# 2. Remove odds from manualSections object
odds_metadata_pattern = r'  odds: \{.*?\},'
content = re.sub(odds_metadata_pattern, '', content, flags=re.DOTALL)

# 3. Change default state to "promotions"
content = content.replace('useState<ManualSection>("odds")', 'useState<ManualSection>("promotions")')

# 4. Remove OddsView component usage
content = content.replace('{active === "odds" && <OddsView accent={meta.accent} />}', '')

# 5. Remove OddsView component definition
odds_view_pattern = r'// ── Odds & Markets View ───────────────────────────────────────────────────────\s+function OddsView\(\{ accent \}: \{ accent: string \}\) \{.*?\}'
# Since the component is large and has nested braces, we need a better regex or just find the start/end
start_marker = '// ── Odds & Markets View ───────────────────────────────────────────────────────'
end_marker = '  );\n}'

if start_marker in content:
    start_idx = content.find(start_marker)
    # Find the end of the OddsView function. It ends after the last map loop and a closing brace.
    # We'll look for the end of the market directory div
    sub_content = content[start_idx:]
    # OddsView ends with a closing brace for the function
    # We'll search for the next function or component start
    next_marker = '// ═══════════════════════════════════════════════════════════════════════════════'
    end_idx = content.find(next_marker, start_idx)
    if end_idx != -1:
        content = content[:start_idx] + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Resources.tsx cleaned up successfully.")
