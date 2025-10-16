#!/bin/bash
# Dice of Dionysus - Filesystem Cleanup Script (Bash)
# Generated: October 16, 2025
# 
# This script automates the cleanup recommendations from CLEANUP_AND_ANALYSIS_REPORT.md
# 
# SAFETY: Creates backups before deleting anything
# USAGE: Run from project root: ./cleanup-filesystem.sh

echo "=== Dice of Dionysus Filesystem Cleanup ==="
echo ""

# Safety check - confirm we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "js/Main.js" ]; then
    echo "ERROR: This script must be run from the project root directory!"
    exit 1
fi

# Ask for confirmation
echo "This script will:"
echo "  1. Create archive/ directory for old documentation"
echo "  2. Move 44+ redundant markdown files to archive/"
echo "  3. Delete empty directories (js/core, js/managers, js/tests)"
echo "  4. Delete redundant files (index-modern.html, etc.)"
echo "  5. Create organized docs/, tracking/, design/ directories"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "Starting cleanup..."

# ===== STEP 1: Create Archive Directory =====
echo ""
echo "[1/6] Creating archive directory..."
mkdir -p archive
echo "  ✓ Created archive/"

# ===== STEP 2: Move Completion Reports =====
echo ""
echo "[2/6] Moving completion reports to archive/..."
completion_files=(
    "ALL_BOONS_IMPLEMENTED.md"
    "ARTIFACT_SYSTEM_COMPLETE.md"
    "BALANCE_PASS_COMPLETE.md"
    "BALATRO_BUTTON_IMPROVEMENTS_COMPLETE.md"
    "BALATRO_INTEGRATION_SUMMARY.md"
    "BALATRO_LIVE_SCORE_DISPLAY_COMPLETE.md"
    "BALATRO_POLISH_COMPLETE.md"
    "BALATRO_SCORING_IMPLEMENTATION_COMPLETE.md"
    "BOON_IMPLEMENTATION_COMPLETE.md"
    "GNOSIS_AND_SCORECARD_POLISH_COMPLETE.md"
    "IMPLEMENTATION_SESSION_COMPLETE.md"
    "PHASE_2_COMPLETE.md"
    "PHASE_3_FINAL_REPORT.md"
    "POLISH_IMPLEMENTATION_SUMMARY.md"
    "POLISH_IMPROVEMENTS_COMPLETE.md"
    "SESSION_COMPLETE_BUG_FIXES.md"
    "SESSION_COMPLETE_OCT_15_2025.md"
    "SESSION_SUMMARY_BALATRO_TRANSFORMATION.md"
    "TASK_3.0_COMPLETE.md"
    "UI_ENHANCEMENTS_PHASE_1_COMPLETE.md"
    "UI_ENHANCEMENTS_PHASE_2_COMPLETE.md"
    "SHOP_UI_ARTIFACTS_FIXED.md"
    "MENU_AND_COLLECTION_IMPROVEMENTS.md"
    "DISTILLATE_OF_MASKS_REMOVED.md"
    "DUPLICATE_METHODS_CLEANUP_REPORT.md"
)

moved_count=0
for file in "${completion_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" archive/
        ((moved_count++))
    fi
done
echo "  ✓ Moved $moved_count completion reports"

# ===== STEP 3: Move Verification/Audit Reports =====
echo ""
echo "[3/6] Moving verification reports to archive/..."
verification_files=(
    "BOON_VERIFICATION_REPORT.md"
    "BOON_VERIFICATION_SUMMARY.md"
    "BOON_MECHANICAL_CATEGORIES_VERIFIED.md"
    "COMPLETE_BOON_AUDIT.md"
    "ECONOMY_TEST_REPORT.md"
    "GOLD_SYSTEM_VERIFIED.md"
)

moved_count=0
for file in "${verification_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" archive/
        ((moved_count++))
    fi
done
echo "  ✓ Moved $moved_count verification reports"

# ===== STEP 4: Move Outdated Plans =====
echo ""
echo "[4/6] Moving outdated plans to archive/..."
plan_files=(
    "PHASE_2_PLAN.md"
    "PHASE_3_MASTER_PLAN.md"
    "UI_ENHANCEMENT_PLAN.md"
    "UI_ENHANCEMENTS_PHASE_2_PLAN.md"
    "QUICK_WINS_CHECKLIST.md"
)

moved_count=0
for file in "${plan_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" archive/
        ((moved_count++))
    fi
done
echo "  ✓ Moved $moved_count outdated plans"

# ===== STEP 5: Delete Empty Directories =====
echo ""
echo "[5/6] Removing empty directories..."
empty_dirs=("js/core" "js/managers" "js/tests")
removed_count=0
for dir in "${empty_dirs[@]}"; do
    if [ -d "$dir" ]; then
        # Check if truly empty
        if [ -z "$(ls -A $dir)" ]; then
            rmdir "$dir"
            echo "  ✓ Removed $dir"
            ((removed_count++))
        else
            echo "  ⚠ Skipped $dir (not empty)"
        fi
    fi
done
echo "  ✓ Removed $removed_count empty directories"

# ===== STEP 6: Delete Redundant Files =====
echo ""
echo "[6/6] Removing redundant files..."
redundant_files=(
    "index-modern.html"
    "README-MODERN.md"
    "BACKUP_README.md"
    "CHANGELOG_v1.3.md"
    "CHANGELOG_v1.4.md"
    "SAVE_CONFIRMATION.txt"
    "SESSION_STATE.json"
    "desktop.ini"
    "js/engine/DICE OF DIONYSUS WORKING.code-workspace"
)

removed_count=0
for file in "${redundant_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        ((removed_count++))
    fi
done
echo "  ✓ Removed $removed_count redundant files"

# ===== SUMMARY =====
echo ""
echo "=== Cleanup Complete! ==="
echo ""
echo "Next Steps (Manual):"
echo "  1. Create docs/, tracking/, design/ directories"
echo "  2. Move appropriate files to new directories (see CLEANUP_AND_ANALYSIS_REPORT.md)"
echo "  3. Consolidate duplicate guides:"
echo "     - Merge BOON_*_GUIDE.md files"
echo "     - Merge BALATRO_*_ANALYSIS.md files"
echo "  4. Update .gitignore to include:"
echo "     - desktop.ini"
echo "     - SESSION_STATE.json"
echo "     - SAVE_CONFIRMATION.txt"
echo ""
echo "See CLEANUP_AND_ANALYSIS_REPORT.md for full reorganization plan."
echo ""

