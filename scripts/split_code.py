import os

# Settings
INCLUDE_EXTS = ('.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.mjs', '.sql', '.py')
SKIP_FILES = {'node_modules', '.next', 'package-lock.json', 'EDUAI_FULL_SOURCE_CODE.txt', 'EDUAI_PORTFOLIO.md'}
SKIP_DIRS = {'node_modules', '.next', '.git', '.vercel'}
CHUNK_SIZE = 85 * 1024 * 1024  # 85MB per chunk (under 100MB limit)

# Collect all files
files_data = []
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
            files_data.append((filepath, content))
        except Exception as e:
            print(f"Error reading {filepath}: {e}")

files_data.sort(key=lambda x: x[0])
print(f"Total files collected: {len(files_data)}")

# Split into chunks
header_template = "=" * 80 + "\nEduAI Source Code - Part {part} of {total}\n" + "=" * 80 + "\n\n"

chunks = []
current_chunk_lines = []
current_size = 0
current_part = 1

for filepath, content in files_data:
    entry = "=" * 80 + "\nFILE: " + filepath + "\n" + "=" * 80 + "\n\n" + content + "\n\n"
    entry_size = len(entry.encode('utf-8'))

    if current_size + entry_size > CHUNK_SIZE and current_chunk_lines:
        current_chunk_lines.append("END OF PART " + str(current_part) + "\n")
        chunks.append("\n".join(current_chunk_lines))
        current_part += 1
        current_chunk_lines = []
        current_size = 0

    current_chunk_lines.append(entry)
    current_size += entry_size

if current_chunk_lines:
    current_chunk_lines.append("END OF PART " + str(current_part) + "\n")
    chunks.append("\n".join(current_chunk_lines))

total_parts = len(chunks)

# Write chunks
for i, chunk in enumerate(chunks):
    filename = f"EDUAI_PART{i+1}_of_{total_parts}.txt"
    # Add header with part info
    header = header_template.format(part=i+1, total=total_parts)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(header + chunk)
    size_mb = os.path.getsize(filename) / 1024 / 1024
    print(f"  {filename}: {size_mb:.1f} MB")

print(f"\nDone! Created {total_parts} parts.")
print("Upload all parts to Kimi in order for full code review.")
