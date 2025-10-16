# Dice of Dionysus - Filesystem Cleanup Script (PowerShell)
# Generated: October 16, 2025
# 
# This script automates the cleanup recommendations from CLEANUP_AND_ANALYSIS_REPORT.md
# 
# SAFETY: Creates backups before deleting anything
# USAGE: Run from project root: .\cleanup-filesystem.ps1

Write-Host "=== Dice of Dionysus Filesystem Cleanup ===" -ForegroundColor Cyan
Write-Host ""

# Safety check - confirm we're in the right directory
if (!(Test-Path "index.html") -or !(Test-Path "js\Main.js")) {
    Write-Host "ERROR: This script must be run from the project root directory!" -ForegroundColor Red
    exit 1
}

# Ask for confirmation
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Create archive/ directory for old documentation" -ForegroundColor Yellow
Write-Host "  2. Move 44+ redundant markdown files to archive/" -ForegroundColor Yellow
Write-Host "  3. Delete empty directories (js/core, js/managers, js/tests)" -ForegroundColor Yellow
Write-Host "  4. Delete redundant files (index-modern.html, etc.)" -ForegroundColor Yellow
Write-Host "  5. Create organized docs/, tracking/, design/ directories" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cleanup cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Starting cleanup..." -ForegroundColor Green

# ===== STEP 1: Create Archive Directory =====
Write-Host "`n[1/6] Creating archive directory..." -ForegroundColor Cyan
if (!(Test-Path "archive")) {
    New-Item -ItemType Directory -Path "archive" | Out-Null
    Write-Host "  ✓ Created archive/" -ForegroundColor Green
} else {
    Write-Host "  ✓ archive/ already exists" -ForegroundColor Green
}

# ===== STEP 2: Move Completion Reports =====
Write-Host "`n[2/6] Moving completion reports to archive/..." -ForegroundColor Cyan
$completionFiles = @(
    "ALL_BOONS_IMPLEMENTED.md",
    "ARTIFACT_SYSTEM_COMPLETE.md",
    "BALANCE_PASS_COMPLETE.md",
    "BALATRO_BUTTON_IMPROVEMENTS_COMPLETE.md",
    "BALATRO_INTEGRATION_SUMMARY.md",
    "BALATRO_LIVE_SCORE_DISPLAY_COMPLETE.md",
    "BALATRO_POLISH_COMPLETE.md",
    "BALATRO_SCORING_IMPLEMENTATION_COMPLETE.md",
    "BOON_IMPLEMENTATION_COMPLETE.md",
    "GNOSIS_AND_SCORECARD_POLISH_COMPLETE.md",
    "IMPLEMENTATION_SESSION_COMPLETE.md",
    "PHASE_2_COMPLETE.md",
    "PHASE_3_FINAL_REPORT.md",
    "POLISH_IMPLEMENTATION_SUMMARY.md",
    "POLISH_IMPROVEMENTS_COMPLETE.md",
    "SESSION_COMPLETE_BUG_FIXES.md",
    "SESSION_COMPLETE_OCT_15_2025.md",
    "SESSION_SUMMARY_BALATRO_TRANSFORMATION.md",
    "TASK_3.0_COMPLETE.md",
    "UI_ENHANCEMENTS_PHASE_1_COMPLETE.md",
    "UI_ENHANCEMENTS_PHASE_2_COMPLETE.md",
    "SHOP_UI_ARTIFACTS_FIXED.md",
    "MENU_AND_COLLECTION_IMPROVEMENTS.md",
    "DISTILLATE_OF_MASKS_REMOVED.md",
    "DUPLICATE_METHODS_CLEANUP_REPORT.md"
)

$movedCount = 0
foreach ($file in $completionFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\" -Force
        $movedCount++
    }
}
Write-Host "  ✓ Moved $movedCount completion reports" -ForegroundColor Green

# ===== STEP 3: Move Verification/Audit Reports =====
Write-Host "`n[3/6] Moving verification reports to archive/..." -ForegroundColor Cyan
$verificationFiles = @(
    "BOON_VERIFICATION_REPORT.md",
    "BOON_VERIFICATION_SUMMARY.md",
    "BOON_MECHANICAL_CATEGORIES_VERIFIED.md",
    "COMPLETE_BOON_AUDIT.md",
    "ECONOMY_TEST_REPORT.md",
    "GOLD_SYSTEM_VERIFIED.md"
)

$movedCount = 0
foreach ($file in $verificationFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\" -Force
        $movedCount++
    }
}
Write-Host "  ✓ Moved $movedCount verification reports" -ForegroundColor Green

# ===== STEP 4: Move Outdated Plans =====
Write-Host "`n[4/6] Moving outdated plans to archive/..." -ForegroundColor Cyan
$planFiles = @(
    "PHASE_2_PLAN.md",
    "PHASE_3_MASTER_PLAN.md",
    "UI_ENHANCEMENT_PLAN.md",
    "UI_ENHANCEMENTS_PHASE_2_PLAN.md",
    "QUICK_WINS_CHECKLIST.md"
)

$movedCount = 0
foreach ($file in $planFiles) {
    if (Test-Path $file) {
        Move-Item $file "archive\" -Force
        $movedCount++
    }
}
Write-Host "  ✓ Moved $movedCount outdated plans" -ForegroundColor Green

# ===== STEP 5: Delete Empty Directories =====
Write-Host "`n[5/6] Removing empty directories..." -ForegroundColor Cyan
$emptyDirs = @("js\core", "js\managers", "js\tests")
$removedCount = 0
foreach ($dir in $emptyDirs) {
    if (Test-Path $dir) {
        # Check if truly empty
        $items = Get-ChildItem $dir -Force
        if ($items.Count -eq 0) {
            Remove-Item $dir -Force
            Write-Host "  ✓ Removed $dir" -ForegroundColor Green
            $removedCount++
        } else {
            Write-Host "  ⚠ Skipped $dir (not empty)" -ForegroundColor Yellow
        }
    }
}
Write-Host "  ✓ Removed $removedCount empty directories" -ForegroundColor Green

# ===== STEP 6: Delete Redundant Files =====
Write-Host "`n[6/6] Removing redundant files..." -ForegroundColor Cyan
$redundantFiles = @(
    "index-modern.html",
    "README-MODERN.md",
    "BACKUP_README.md",
    "CHANGELOG_v1.3.md",
    "CHANGELOG_v1.4.md",
    "SAVE_CONFIRMATION.txt",
    "SESSION_STATE.json",
    "desktop.ini"
)

$removedCount = 0
foreach ($file in $redundantFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        $removedCount++
    }
}

# Remove misplaced workspace file
$workspaceFile = "js\engine\DICE OF DIONYSUS WORKING.code-workspace"
if (Test-Path $workspaceFile) {
    Remove-Item $workspaceFile -Force
    $removedCount++
}

Write-Host "  ✓ Removed $removedCount redundant files" -ForegroundColor Green

# ===== SUMMARY =====
Write-Host ""
Write-Host "=== Cleanup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps (Manual):" -ForegroundColor Yellow
Write-Host "  1. Create docs/, tracking/, design/ directories" -ForegroundColor Yellow
Write-Host "  2. Move appropriate files to new directories (see CLEANUP_AND_ANALYSIS_REPORT.md)" -ForegroundColor Yellow
Write-Host "  3. Consolidate duplicate guides:" -ForegroundColor Yellow
Write-Host "     - Merge BOON_*_GUIDE.md files" -ForegroundColor Yellow
Write-Host "     - Merge BALATRO_*_ANALYSIS.md files" -ForegroundColor Yellow
Write-Host "  4. Update .gitignore to include:" -ForegroundColor Yellow
Write-Host "     - desktop.ini" -ForegroundColor Yellow
Write-Host "     - SESSION_STATE.json" -ForegroundColor Yellow
Write-Host "     - SAVE_CONFIRMATION.txt" -ForegroundColor Yellow
Write-Host ""
Write-Host "See CLEANUP_AND_ANALYSIS_REPORT.md for full reorganization plan." -ForegroundColor Cyan
Write-Host ""

