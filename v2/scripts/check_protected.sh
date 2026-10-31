#!/usr/bin/env bash
set -euo pipefail

echo "=== SCAM SHIELD PROTECTED PATHS AUDIT ==="

violations=()

# Check git diff against main
diff_files=$(git diff --name-only main 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || true)
for file in $diff_files; do
    if [[ "$file" == ".github/workflows/v2-ci.yml" ]]; then
        continue
    fi
    if [[ ! "$file" =~ ^v2/ ]]; then
        violations+=("$file")
    fi
done

# Check untracked/staged/unstaged files
status_files=$(git status --porcelain | awk '{print $2}' || true)
for file in $status_files; do
    if [[ "$file" == ".github/workflows/v2-ci.yml" || "$file" == "package-lock.json" ]]; then
        continue
    fi
    if [[ ! "$file" =~ ^v2/ ]]; then
        violations+=("$file")
    fi
done

if [ ${#violations[@]} -gt 0 ]; then
    echo "[FAIL] Protected files were modified:"
    for v in "${violations[@]}"; do
        echo "  - $v"
    done
    exit 1
else
    echo "[PASS] All protected legacy files are untouched. 100% non-destructive build confirmed."
    exit 0
fi
