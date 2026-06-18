import os
import math

# Create output directory
output_dir = r"C:\Source Code Shashwat"
os.makedirs(output_dir, exist_ok=True)

# Collect all source files
INCLUDE_EXTS = ('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.mjs', '.sql', '.py')
SKIP_FILES = {'package-lock.json', 'EDUAI_FULL_SOURCE_CODE.txt', 'EDUAI_PORTFOLIO.md', 'EDUAI_PART1_of_1.txt'}
SKIP_DIRS = {'node_modules', '.next', '.git', '.vercel'}

all_files = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in sorted(files):
        if f in SKIP_FILES:
            continue
        ext = os.path.splitext(f)[1].lower()
        if ext not in INCLUDE_EXTS:
            continue
        filepath = os.path.join(root, f).replace('\\', '/')
        if filepath.startswith('./'):
            filepath = filepath[2:]
        try:
            with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
            all_files.append((filepath, content, len(content.encode('utf-8'))))
        except Exception as e:
            print(f"  Error reading {filepath}: {e}")

all_files.sort(key=lambda x: x[0])
print(f"Total source files found: {len(all_files)}")

# Categorize files into 5 groups
categories = {
    1: {"name": "CONFIG_AND_LIB", "label": "Part 1: Config Files & Library Code", "files": []},
    2: {"name": "COMPONENTS", "label": "Part 2: React Components", "files": []},
    3: {"name": "PAGES", "label": "Part 3: Pages (App Router)", "files": []},
    4: {"name": "API_ROUTES", "label": "Part 4: API Routes", "files": []},
    5: {"name": "ADMIN_SCRIPTS_SQL", "label": "Part 5: Admin Panel, Hooks & SQL Scripts", "files": []},
}

for filepath, content, size in all_files:
    if filepath.startswith('app/components/'):
        categories[2]["files"].append((filepath, content, size))
    elif filepath.startswith('app/api/'):
        categories[4]["files"].append((filepath, content, size))
    elif filepath.startswith('app/admin/'):
        categories[5]["files"].append((filepath, content, size))
    elif filepath.startswith('app/hooks/'):
        categories[5]["files"].append((filepath, content, size))
    elif filepath.startswith('app/') and filepath.endswith('page.tsx') or filepath.endswith('layout.tsx') or filepath == 'app/template.tsx' or filepath == 'app/not-found.tsx' or filepath == 'app/sitemap.ts' or filepath == 'app/Providers.tsx':
        categories[3]["files"].append((filepath, content, size))
    elif filepath.startswith('app/') and not filepath.startswith('app/components/') and not filepath.startswith('app/api/') and not filepath.startswith('app/admin/') and not filepath.startswith('app/hooks/'):
        categories[3]["files"].append((filepath, content, size))
    elif filepath.startswith('scripts/'):
        categories[5]["files"].append((filepath, content, size))
    elif filepath.startswith('lib/'):
        categories[1]["files"].append((filepath, content, size))
    else:
        categories[1]["files"].append((filepath, content, size))

# Write each category to a file
for part_num, cat in categories.items():
    filename = os.path.join(output_dir, f"EduAI_SourceCode_Part{part_num}_{cat['name']}.txt")
    
    separator = "=" * 80
    lines = []
    lines.append(separator)
    lines.append(f"  EduAI - AI Study Arsenal")
    lines.append(f"  {cat['label']}")
    lines.append(f"  Built by Shashwat Mishra")
    lines.append(f"  Total Files in this part: {len(cat['files'])}")
    lines.append(separator)
    lines.append("")
    
    for filepath, content, size in cat["files"]:
        lines.append(separator)
        lines.append(f"FILE: {filepath}")
        lines.append(separator)
        lines.append("")
        lines.append(content)
        lines.append("")
        lines.append("")
    
    lines.append(separator)
    lines.append(f"END OF {cat['label']}")
    lines.append(separator)
    
    full_text = "\n".join(lines)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(full_text)
    
    size_mb = os.path.getsize(filename) / 1024 / 1024
    print(f"  {os.path.basename(filename)}: {size_mb:.2f} MB ({len(cat['files'])} files)")

print(f"\nAll 5 files created in: {output_dir}")
print("Upload all 5 files together to Kimi for complete code review!")
