# 🌿 Git Workflow for Dice of Dionysus
**Clean Branch Strategy for Solo/Small Team Development**

> **Current Status:** Clean, single-branch workflow  
> **Philosophy:** Keep it simple, use main for production-ready code  
> **Last Updated:** October 16, 2025

---

## 🎯 Current Branch Structure

```
main (production-ready code)
  └─ All development happens here
  └─ Always deployable
  └─ Clean, linear history
```

**Why this works:**
- Solo/small team development
- Continuous integration approach
- No merge conflicts
- Clear, linear history
- GitHub history provides rollback capability

---

## 📋 Recommended Workflow

### Option 1: Direct to Main (Current - Recommended for Solo Dev)

**When to use:** Solo development, small changes, confidence in changes

```bash
# Make changes to files
# Test locally
git add .
git commit -m "feat: descriptive message"
git push origin main
```

**Benefits:**
- ✅ Simple and fast
- ✅ No branch management overhead
- ✅ Clear linear history
- ✅ Immediate deployment

**When to commit:**
- Feature complete and tested
- Bug fix verified
- Code is production-ready

---

### Option 2: Feature Branches (For Larger Features)

**When to use:** Major features, experimental work, collaboration

```bash
# Create feature branch
git checkout -b feature/new-boon-system

# Make changes and commit
git add .
git commit -m "feat: add new boon system"

# Push to remote (for backup)
git push origin feature/new-boon-system

# When ready, merge to main
git checkout main
git merge feature/new-boon-system
git push origin main

# Delete branch immediately after merge
git branch -d feature/new-boon-system
git push origin --delete feature/new-boon-system
```

**Key Rule:** Delete branches immediately after merging!

---

## ✅ Commit Message Standards

Use conventional commits for clarity:

```
feat: add new feature
fix: fix bug description
perf: improve performance of X
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

**Examples from your project:**
```
✅ feat: Major filesystem reorganization + AI learning system
✅ chore: clean up GitHub view - remove redundant backups
✅ fix: Wild enhancement persistence and debug logging
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Don't: Leave merged branches around
```
# BAD - leaves clutter
git merge feature/boons
# (branch stays around forever)
```

```
# GOOD - clean up immediately
git merge feature/boons
git branch -d feature/boons
```

### ❌ Don't: Create branches for every tiny change
```
# BAD - branch overhead for 1-line fix
git checkout -b fix/typo-in-readme
# ... fix typo ...
git merge fix/typo-in-readme
```

```
# GOOD - commit directly to main
# ... fix typo ...
git commit -m "fix: typo in README"
```

### ❌ Don't: Keep old backup branches
```
# BAD
BACKUP_v1.4/
old-main/
before-refactor/
```

```
# GOOD - use git tags instead
git tag v1.4.0
git tag before-major-refactor
```

---

## 🏷️ Using Tags for Versions

Instead of backup branches, use tags:

```bash
# Tag current state
git tag -a v1.4.0 -m "Version 1.4.0 - AI Learning System"
git push origin v1.4.0

# View tags
git tag

# Checkout a tagged version
git checkout v1.4.0

# Return to main
git checkout main
```

**Benefits:**
- ✅ Marks important milestones
- ✅ No branch clutter
- ✅ Easy to reference
- ✅ GitHub shows releases

---

## 🔄 Your Workflow Going Forward

### Daily Development:

```bash
# 1. Make sure you're on main
git checkout main
git pull origin main

# 2. Make changes, test locally

# 3. Stage and commit
git add .
git commit -m "feat: descriptive message"

# 4. Push to GitHub
git push origin main

# 5. Update meta/ if you added patterns (2 min)
```

### For Large Features:

```bash
# 1. Create feature branch
git checkout -b feature/name

# 2. Work on feature, commit often
git commit -m "feat: progress on feature"

# 3. When complete and tested
git checkout main
git merge feature/name

# 4. IMPORTANT: Delete branch immediately!
git branch -d feature/name

# 5. Push to GitHub
git push origin main
```

---

## 📊 Checking Branch Health

### See all branches:
```bash
git branch -a
```

### See merged branches:
```bash
git branch --merged main
```

### Clean up merged branches:
```bash
# Delete all local merged branches (except main)
git branch --merged main | grep -v "main" | xargs git branch -d
```

### See unmerged branches:
```bash
git branch --no-merged main
```

---

## 🎯 Best Practices

### 1. **Commit Often, Push Regularly**
- Commit every logical change
- Push to GitHub daily (backup)
- Small commits are easier to review/revert

### 2. **Write Good Commit Messages**
- Start with type: `feat:`, `fix:`, `chore:`
- Be descriptive but concise
- Explain "why" in body if needed

### 3. **Keep Main Clean**
- Only merge tested, working code
- If something breaks, revert immediately
- Use `git revert` instead of `git reset --hard` on public branches

### 4. **Delete Merged Branches Immediately**
- Branches are temporary
- Git history preserves everything
- Clean branch list = clear overview

### 5. **Tag Important Versions**
- Tag before major changes
- Tag releases (v1.4.0, v1.5.0)
- Tag after major refactors

---

## 🆘 Common Git Tasks

### Undo last commit (not pushed):
```bash
git reset --soft HEAD~1
# (keeps changes, removes commit)
```

### Undo last commit (already pushed):
```bash
git revert HEAD
git push origin main
# (creates new commit that undoes changes)
```

### Discard all local changes:
```bash
git reset --hard HEAD
# ⚠️ CAUTION: This deletes all uncommitted work!
```

### See what changed:
```bash
git status          # Current changes
git log --oneline   # Commit history
git diff            # Detailed changes
```

### Switch between commits:
```bash
git checkout <commit-hash>  # View old version
git checkout main           # Return to latest
```

---

## 📈 Git History Management

### View clean history:
```bash
git log --oneline --graph --decorate --all
```

### View history for specific file:
```bash
git log --follow meta/CONSOLIDATED_BOON_REFERENCE.md
```

### See who changed what:
```bash
git blame <file>
```

---

## 🎓 Learning Resources

### Quick Reference:
- **Status:** `git status` - See what's changed
- **History:** `git log --oneline` - See commits
- **Branches:** `git branch -a` - See all branches
- **Clean up:** `git branch -d <branch>` - Delete merged branch

### Advanced:
- **Cherry-pick:** Apply specific commit to current branch
- **Rebase:** Rewrite history (use carefully)
- **Bisect:** Find which commit introduced a bug
- **Stash:** Temporarily save uncommitted changes

---

## ✅ Your Current Status

**After Cleanup:**
- ✅ 1 branch (main)
- ✅ Clean, linear history
- ✅ No branch clutter
- ✅ Professional git structure
- ✅ Ready for efficient development

**Deleted:**
- ❌ dev/boons (merged)
- ❌ dev/enhancements (merged)
- ❌ dev/game-engine (merged)
- ❌ dev/integration (merged)
- ❌ dev/libations (merged)
- ❌ dev/scoring (merged)
- ❌ dev/shop (merged)
- ❌ dev/ui (merged)
- ❌ dev/worship (merged)

All work preserved in main! ✅

---

## 🎯 Key Takeaways

1. **Work on main** for daily development
2. **Create feature branches** only for large features
3. **Delete branches immediately** after merging
4. **Use tags** for versions, not backup branches
5. **Commit often**, push regularly
6. **Write clear commit messages**
7. **Keep it simple** - don't over-branch

---

**Remember:** Git history is your backup. You don't need backup branches—every commit is saved forever!

---

**Last Reviewed:** October 16, 2025  
**Status:** ✅ Clean and efficient  
**Branches:** 1 (main only)

