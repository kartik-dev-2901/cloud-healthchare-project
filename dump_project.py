import os

# ---------- CONFIG ----------
OUTPUT_FILE = "project_dump.txt"

# folders to skip
IGNORE_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    "venv",
    ".venv",
    "dist",
    "build"
}

# file extensions to include code from
INCLUDE_EXTENSIONS = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".cpp",
    ".c",
    ".java",
    ".json",
    ".env",
    ".md"
}
# ----------------------------


def should_ignore(path):
    return any(part in IGNORE_DIRS for part in path.split(os.sep))


def write_structure(root, output):
    output.write("PROJECT STRUCTURE\n")
    output.write("=" * 70 + "\n\n")

    for current_path, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        level = current_path.replace(root, "").count(os.sep)
        indent = "│   " * level
        folder = os.path.basename(current_path)

        if current_path == root:
            output.write(f"{folder}/\n")
        else:
            output.write(f"{indent}├── {folder}/\n")

        subindent = "│   " * (level + 1)

        for file in files:
            output.write(f"{subindent}├── {file}\n")


def dump_code(root, output):
    output.write("\n\nFILE CONTENTS\n")
    output.write("=" * 70 + "\n")

    for current_path, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            filepath = os.path.join(current_path, file)

            if filepath.endswith(OUTPUT_FILE):
                continue

            ext = os.path.splitext(file)[1]

            if ext in INCLUDE_EXTENSIONS or file == ".env":
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()

                    relative = os.path.relpath(filepath, root)

                    output.write("\n\n" + "=" * 70 + "\n")
                    output.write(f"FILE: {relative}\n")
                    output.write("=" * 70 + "\n\n")
                    output.write(content)
                    output.write("\n")

                except Exception as e:
                    output.write(
                        f"\n[Could not read {filepath}: {e}]\n"
                    )


if __name__ == "__main__":
    root = os.getcwd()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        write_structure(root, out)
        dump_code(root, out)

    print(f"Done! Saved everything to {OUTPUT_FILE}")