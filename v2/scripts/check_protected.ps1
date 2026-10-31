# Verify that no protected legacy files have been modified or deleted.
$ErrorActionPreference = "Stop"

$protectedPaths = @(
    "app.py",
    "orchestrator.py",
    "tools_interface.py",
    "tools_mock.py",
    "tools_real.py",
    "requirements.txt",
    "pytest.ini",
    ".env",
    "README.md",
    ".gitignore",
    "agents",
    "tools",
    "ui",
    "data",
    "tests",
    "docs",
    "cache"
)

Write-Host "=== SCAM SHIELD PROTECTED PATHS AUDIT ===" -ForegroundColor Cyan

$violations = @()

# Check git diff against main branch (or merge-base)
$diffFiles = git diff --name-only main
foreach ($file in $diffFiles) {
    if ($file -match "^\.github/workflows/v2-ci\.yml$") {
        continue
    }
    if ($file -notmatch "^v2/") {
        $violations += $file
    }
}

# Check unstaged / staged changes in working directory
$statusOutput = git status --porcelain
foreach ($line in $statusOutput) {
    if ($line.Length -gt 3) {
        $filePath = $line.Substring(3).Trim()
        if ($filePath -match "^\.github/workflows/v2-ci\.yml$") {
            continue
        }
        if ($filePath -notmatch "^v2/" -and $filePath -ne "package-lock.json") {
            $violations += $filePath
        }
    }
}

$uniqueViolations = $violations | Select-Object -Unique

if ($uniqueViolations.Count -gt 0) {
    Write-Host "[FAIL] Protected files were modified:" -ForegroundColor Red
    foreach ($v in $uniqueViolations) {
        Write-Host "  - $v" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "[PASS] All protected legacy files are untouched. 100% non-destructive build confirmed." -ForegroundColor Green
    exit 0
}
