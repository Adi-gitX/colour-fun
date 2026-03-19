#!/usr/bin/env bash
# =============================================================================
#  assessment_tests.sh
#  Lecturer / Tester Assessment Script – colour-fun
#  Run from the repository root:  bash assessment_tests.sh
# =============================================================================
# NOTE: Intentionally NOT using `set -e` so that individual check failures
#       don't abort the whole script. Errors are caught explicitly below.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$REPO_ROOT/solid-colour"
PASS=0
FAIL=0
WARN=0

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

section() {
  echo -e "\n${CYAN}${BOLD}══════════════════════════════════════════${RESET}"
  echo -e "${CYAN}${BOLD}  $1${RESET}"
  echo -e "${CYAN}${BOLD}══════════════════════════════════════════${RESET}"
}
pass() { echo -e "  ${GREEN}✔ PASS${RESET}  $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}✘ FAIL${RESET}  $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}⚠ WARN${RESET}  $1"; WARN=$((WARN+1)); }
info() { echo -e "  ${BOLD}ℹ INFO${RESET}  $1"; }

check_file() {
  if [ -f "$1" ]; then pass "File exists: $(basename "$1")"; else fail "Missing file: $1"; fi
}
check_dir() {
  if [ -d "$1" ]; then pass "Directory exists: $1"; else fail "Missing directory: $1"; fi
}
check_grep() {
  if grep -qE "$2" "$1" 2>/dev/null; then pass "$3"; else fail "$3"; fi
}
opt_grep() {
  if grep -qE "$2" "$1" 2>/dev/null; then pass "$3"; else warn "$3 (optional)"; fi
}

# =============================================================================
echo ""
echo -e "${BOLD}colour-fun — Lecturer Assessment Test Suite${RESET}"
echo -e "${BOLD}Repository: $REPO_ROOT${RESET}"
echo -e "${BOLD}Date: $(date)${RESET}"

# =============================================================================
#  1. COMMIT HISTORY – Regularity
# =============================================================================
section "1 · Commit History – Regularity"

TOTAL_COMMITS=$(git -C "$REPO_ROOT" log --oneline | wc -l | tr -d ' ')
info "Total commits: $TOTAL_COMMITS"
if [ "$TOTAL_COMMITS" -ge 10 ]; then
  pass "≥10 commits present ($TOTAL_COMMITS)"
else
  fail "Too few commits – only $TOTAL_COMMITS (expected ≥10)"
fi

# Check commits span at least 3 distinct days
DISTINCT_DAYS=$(git -C "$REPO_ROOT" log --format='%cs' | sort -u | wc -l | tr -d ' ')
info "Commits on $DISTINCT_DAYS distinct calendar day(s)"
if [ "$DISTINCT_DAYS" -ge 3 ]; then
  pass "Commits spread across ≥3 distinct days ($DISTINCT_DAYS)"
else
  warn "Commits on only $DISTINCT_DAYS day(s) – may look like bulk-commit"
fi

# Detect bulk-commit pattern: any single day with >60% of all commits
BUSIEST_DAY_COUNT=$(git -C "$REPO_ROOT" log --format='%cs' | sort | uniq -c | sort -rn | awk 'NR==1{print $1}')
THRESHOLD=$(( TOTAL_COMMITS * 60 / 100 ))
if [ "$BUSIEST_DAY_COUNT" -le "$THRESHOLD" ]; then
  pass "No bulk-commit spike detected (busiest day: $BUSIEST_DAY_COUNT commits)"
else
  warn "Possible bulk-commit detected: $BUSIEST_DAY_COUNT/$TOTAL_COMMITS commits on a single day"
fi

# Sanity-check commit messages (≤5 one-word/empty messages is acceptable)
SHORT_MSG=$(git -C "$REPO_ROOT" log --format='%s' | awk 'NF<=1' | wc -l | tr -d ' ')
if [ "$SHORT_MSG" -le 5 ]; then
  pass "Commit messages look meaningful (≤5 trivial messages detected)"
else
  warn "$SHORT_MSG commit(s) with very short or empty messages"
fi

# Print 10 most recent commit subjects for manual review
info "Last 10 commit messages:"
git -C "$REPO_ROOT" log --oneline -10 | while IFS= read -r line; do echo "      $line"; done

# =============================================================================
#  2. GITHUB WORKFLOWS / CI
# =============================================================================
section "2 · GitHub Workflows / CI"

WORKFLOW_DIR="$REPO_ROOT/.github/workflows"
check_dir "$WORKFLOW_DIR"

# Verify push AND pull_request triggers exist in at least one workflow
TRIGGERS_OK=false
for f in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
  [ -f "$f" ] || continue
  if grep -q "push" "$f" && grep -q "pull_request" "$f"; then
    TRIGGERS_OK=true
    info "Triggers found in: $(basename "$f")"
    break
  fi
done
if $TRIGGERS_OK; then
  pass "Workflow triggers: push + pull_request found"
else
  fail "No workflow has both push and pull_request triggers"
fi

# Required pipeline steps across all workflows
declare -A STEP_LABELS=(
  ["npm ci|npm i|npm install"]="install dependencies"
  ["npm run test|vitest|jest|mocha"]="run tests"
  ["npm run lint|eslint"]="run linter"
)
for PATTERN in "npm ci|npm i|npm install" "npm run test|vitest|jest|mocha" "npm run lint|eslint"; do
  FOUND=false
  FOUND_IN=""
  for f in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
    [ -f "$f" ] || continue
    if grep -qE "$PATTERN" "$f"; then
      FOUND=true
      FOUND_IN="$(basename "$f")"
      break
    fi
  done
  LABEL=$(echo "$PATTERN" | awk -F'|' '{print $1}')
  if $FOUND; then
    pass "CI step present: $LABEL (in $FOUND_IN)"
  else
    fail "CI step MISSING: $LABEL"
  fi
done

# Count total workflow files
WF_COUNT=$(find "$WORKFLOW_DIR" -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
info "Total workflow files: $WF_COUNT"
if [ "$WF_COUNT" -ge 3 ]; then
  pass "Multiple workflow files defined ($WF_COUNT)"
else
  warn "Only $WF_COUNT workflow file(s) – consider adding more"
fi

# List all workflow files for transparency
info "Workflow files found:"
find "$WORKFLOW_DIR" -name "*.yml" -o -name "*.yaml" 2>/dev/null | while IFS= read -r f; do echo "      $(basename "$f")"; done

# =============================================================================
#  3. FRONTEND IMPLEMENTATION
# =============================================================================
section "3 · Frontend Implementation"

check_dir  "$APP_DIR/src"
check_dir  "$APP_DIR/src/components"
check_file "$APP_DIR/src/App.tsx"
check_file "$APP_DIR/index.html"
check_file "$APP_DIR/package.json"

# React listed as dependency
check_grep "$APP_DIR/package.json" '"react"' "React listed as dependency"

# Functional components only (no class components)
CLASS_COMPONENTS=$(grep -rE "extends (React\.)?Component" "$APP_DIR/src" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CLASS_COMPONENTS" -eq 0 ]; then
  pass "All components are functional (0 class components detected)"
else
  warn "$CLASS_COMPONENTS class component(s) found – prefer functional"
fi

# Component count
COMP_COUNT=$(find "$APP_DIR/src/components" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
info "Component files found: $COMP_COUNT"
if [ "$COMP_COUNT" -ge 5 ]; then
  pass "Good component count ($COMP_COUNT components)"
else
  fail "Too few components: $COMP_COUNT (expected ≥5)"
fi

# CSS files
CSS_COUNT=$(find "$APP_DIR/src" \( -name "*.css" -o -name "*.module.css" \) 2>/dev/null | wc -l | tr -d ' ')
if [ "$CSS_COUNT" -ge 3 ]; then
  pass "CSS styling files present ($CSS_COUNT files)"
else
  warn "Only $CSS_COUNT CSS file(s) found"
fi

# State management
STATE_MGMT=$(grep -rE "zustand|useContext|createContext|Redux" "$APP_DIR/src" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$STATE_MGMT" -gt 0 ]; then
  pass "State management in use (zustand/context – $STATE_MGMT references)"
else
  warn "No state management library detected in src/"
fi

# TypeScript usage
TS_FILES=$(find "$APP_DIR/src" \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l | tr -d ' ')
if [ "$TS_FILES" -ge 5 ]; then
  pass "TypeScript in use ($TS_FILES .ts/.tsx files)"
else
  warn "Limited TypeScript usage ($TS_FILES files)"
fi

# =============================================================================
#  4. UNIT TESTING
# =============================================================================
section "4 · Unit Testing"

# Test framework in package.json
check_grep "$APP_DIR/package.json" 'vitest|jest|mocha' "Unit test framework listed in package.json"

# Test infrastructure
SRC_TEST_DIR="$APP_DIR/src/test"
check_dir  "$SRC_TEST_DIR"
check_file "$SRC_TEST_DIR/setup.ts"
check_file "$APP_DIR/vitest.config.ts"

# Count unit test files
UNIT_TESTS=$(find "$APP_DIR/src" \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" \) 2>/dev/null | wc -l | tr -d ' ')
info "Unit/integration test files in src/: $UNIT_TESTS"
if [ "$UNIT_TESTS" -ge 3 ]; then
  pass "Unit test files present ($UNIT_TESTS files)"
else
  fail "Insufficient unit test files: $UNIT_TESTS (expected ≥3)"
fi

# Actually run unit tests
section "4 · Running Unit Tests (vitest)"
cd "$APP_DIR"
info "Running: npx vitest run --reporter=verbose"
if npx vitest run --reporter=verbose 2>&1; then
  pass "All vitest unit/integration tests PASSED"
else
  fail "One or more vitest tests FAILED – see output above"
fi
cd "$REPO_ROOT"

# =============================================================================
#  5. INTEGRATION TESTING
# =============================================================================
section "5 · Integration Testing"

INT_TEST_DIR="$APP_DIR/src/components/__tests__"
check_dir "$INT_TEST_DIR"

INT_FILES=$(find "$INT_TEST_DIR" \( -name "*.integration.test.tsx" -o -name "*.integration.test.ts" \) 2>/dev/null | wc -l | tr -d ' ')
info "Integration test files found: $INT_FILES"
if [ "$INT_FILES" -ge 3 ]; then
  pass "Integration tests present ($INT_FILES files)"
else
  fail "Insufficient integration tests: $INT_FILES (expected ≥3)"
fi

# Verify each integration test uses RTL and tests state/store
for f in "$INT_TEST_DIR"/*.integration.test.tsx; do
  [ -f "$f" ] || continue
  BASE=$(basename "$f")
  if grep -qE "render|screen|userEvent|fireEvent" "$f"; then
    pass "Integration test $BASE uses @testing-library/react"
  else
    warn "Integration test $BASE may not use React Testing Library"
  fi
  if grep -qE "useAppStore|zustand|store" "$f"; then
    pass "Integration test $BASE tests store/state integration"
  else
    warn "Integration test $BASE doesn't appear to test store/state"
  fi
done

# jsdom environment configured
check_grep "$APP_DIR/vitest.config.ts" "jsdom" "Vitest environment set to jsdom"

# =============================================================================
#  6. E2E TESTING – Playwright (Bonus)
# =============================================================================
section "6 · E2E Testing – Playwright (Bonus)"

E2E_DIR="$APP_DIR/e2e"
check_dir  "$E2E_DIR"
check_file "$APP_DIR/playwright.config.ts"
check_grep "$APP_DIR/package.json" '@playwright/test' "@playwright/test in devDependencies"

E2E_FILES=$(find "$E2E_DIR" -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
info "Playwright spec files: $E2E_FILES"
if [ "$E2E_FILES" -ge 4 ]; then
  pass "Multiple E2E spec files ($E2E_FILES) – good coverage"
else
  warn "Only $E2E_FILES E2E spec file(s) found"
fi

# Verify specs simulate real user flows
for f in "$E2E_DIR"/*.spec.ts; do
  [ -f "$f" ] || continue
  BASE=$(basename "$f")
  if grep -qE "page\.goto|page\.click|page\.fill|page\.locator" "$f"; then
    pass "E2E spec $BASE simulates user interactions"
  else
    warn "E2E spec $BASE has no user-interaction calls"
  fi
done

# Run E2E tests (if dist/ exists from prior build)
if [ -d "$APP_DIR/dist" ]; then
  section "6 · Running E2E Tests (playwright)"
  cd "$APP_DIR"
  info "Running: npx playwright test --reporter=list"
  if npx playwright test --reporter=list 2>&1; then
    pass "All Playwright E2E tests PASSED"
  else
    fail "One or more Playwright E2E tests FAILED – see output above"
  fi
  cd "$REPO_ROOT"
else
  warn "No dist/ directory – skipping live E2E run (build the app first with 'npm run build')"
fi

# =============================================================================
#  7. PR CHECKS – LINTING
# =============================================================================
section "7 · PR Lint Checks"

check_file "$APP_DIR/eslint.config.js"
check_file "$APP_DIR/.prettierrc"

# Lint triggered on pull_request
LINT_IN_PR=false
for f in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
  [ -f "$f" ] || continue
  if grep -q "pull_request" "$f" && grep -qE "eslint|npm run lint" "$f"; then
    LINT_IN_PR=true
    info "Lint-on-PR found in: $(basename "$f")"
    break
  fi
done
if $LINT_IN_PR; then
  pass "Linting runs on pull_request in CI"
else
  fail "No workflow runs linting on pull_request"
fi

# Prettier check in CI
PRETTIER_IN_CI=false
for f in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
  [ -f "$f" ] || continue
  if grep -qE "prettier.*check|format:check|npx prettier" "$f"; then
    PRETTIER_IN_CI=true
    info "Prettier check found in: $(basename "$f")"
    break
  fi
done
if $PRETTIER_IN_CI; then
  pass "Prettier format check present in CI"
else
  warn "No Prettier --check step found in CI workflows"
fi

# Run ESLint locally
section "7 · Running ESLint Locally"
cd "$APP_DIR"
info "Running: npm run lint"
if npm run lint 2>&1; then
  pass "ESLint passed – no lint errors"
else
  fail "ESLint reported errors – fix before submission"
fi
cd "$REPO_ROOT"

# =============================================================================
#  8. DEPENDABOT CONFIGURATION
# =============================================================================
section "8 · Dependabot Configuration"

DEPENDABOT="$REPO_ROOT/.github/dependabot.yml"
check_file "$DEPENDABOT"
check_grep "$DEPENDABOT" 'package-ecosystem'  "package-ecosystem defined in dependabot.yml"
check_grep "$DEPENDABOT" 'interval'            "schedule.interval defined"
check_grep "$DEPENDABOT" 'npm'                 "npm ecosystem monitored by Dependabot"
opt_grep   "$DEPENDABOT" 'github-actions'      "GitHub Actions ecosystem also monitored"
check_grep "$DEPENDABOT" 'directory'            "directory field set in dependabot.yml"

# =============================================================================
#  9. EC2 + GITHUB ACTIONS DEPLOYMENT
# =============================================================================
section "9 · EC2 + GitHub Actions Deployment"

DEPLOY_WF="$WORKFLOW_DIR/deploy.yml"
check_file "$DEPLOY_WF"
check_grep "$DEPLOY_WF" 'ssh|EC2|ec2'                            "SSH/EC2 commands present in deploy.yml"
check_grep "$DEPLOY_WF" 'secrets\.'                              "GitHub Secrets used for credentials"
check_grep "$DEPLOY_WF" 'EC2_SSH_KEY|SSH_PRIVATE_KEY'           "SSH key secret referenced"
check_grep "$DEPLOY_WF" 'EC2_HOST|EC2_IP'                       "EC2 host/IP secret referenced"
check_grep "$DEPLOY_WF" 'git pull|npm.*build|systemctl|restart' "Server-side deploy commands present"
opt_grep   "$DEPLOY_WF" 'mkdir -p||| true|if.*exist'            "Idempotency guards in deploy workflow"

# EC2 provisioning helper scripts
EC2_SCRIPTS=$(find "$REPO_ROOT/devops/scripts" -name "*.sh" 2>/dev/null | wc -l | tr -d ' ')
info "EC2 helper scripts in devops/scripts/: $EC2_SCRIPTS"
if [ "$EC2_SCRIPTS" -ge 1 ]; then
  pass "EC2 setup/provisioning scripts present ($EC2_SCRIPTS scripts)"
else
  warn "No shell scripts in devops/scripts/"
fi

# =============================================================================
#  10. IDEMPOTENT SCRIPTS
# =============================================================================
section "10 · Idempotent Scripts"

SCRIPT_COUNT=0
for SCRIPT in "$REPO_ROOT/devops/scripts"/*.sh; do
  [ -f "$SCRIPT" ] || continue
  SCRIPT_COUNT=$((SCRIPT_COUNT+1))
  BASE=$(basename "$SCRIPT")

  # Detect plain 'mkdir' without -p (not idempotent)
  BAD_MKDIR=$(grep -vE 'mkdir -p' "$SCRIPT" | grep -cE '^\s*mkdir ' || true)
  if [ "$BAD_MKDIR" -eq 0 ]; then
    pass "$BASE: mkdir calls use -p flag (idempotent)"
  else
    fail "$BASE: $BAD_MKDIR plain 'mkdir' call(s) without -p – not idempotent"
  fi

  # Idempotency guards (if !exists, || true, mkdir -p, test !)
  opt_grep "$SCRIPT" 'if.*!.*exist||| true|mkdir -p|\[ !|test !' "$BASE: idempotency guards present"

  # Error safety: set -e / set -euo / set -euo pipefail
  if grep -qE "set -euo|set -e" "$SCRIPT"; then
    pass "$BASE: uses 'set -e' / 'set -euo pipefail' for error safety"
  else
    warn "$BASE: missing 'set -e' or 'set -euo pipefail'"
  fi
done

if [ "$SCRIPT_COUNT" -eq 0 ]; then
  warn "No shell scripts found in devops/scripts/ to check"
fi

# Specifically check run.sh for conditional npm install
if [ -f "$REPO_ROOT/devops/scripts/run.sh" ]; then
  if grep -qE 'if.*node_modules|npm install.*\|\|' "$REPO_ROOT/devops/scripts/run.sh"; then
    pass "run.sh: conditional npm install (idempotent guard present)"
  else
    warn "run.sh: may reinstall dependencies on every run (check for guard)"
  fi
fi

# =============================================================================
#  11. EXPLANATION / DOCUMENTATION
# =============================================================================
section "11 · Explanation & Documentation"

check_file "$REPO_ROOT/README.md"

README="$REPO_ROOT/README.md"
README_LINES=$(wc -l < "$README" | tr -d ' ')
info "README.md line count: $README_LINES"
if [ "$README_LINES" -ge 40 ]; then
  pass "README is substantial ($README_LINES lines)"
else
  warn "README is short ($README_LINES lines) – add architecture, workflow, and deployment docs"
fi

check_grep "$README" '##.*[Aa]rch|[Aa]rchitecture'             "README documents Architecture"
check_grep "$README" '##.*[Ww]ork|[Cc][Ii]|[Pp]ipeline'       "README documents CI/Workflow"
check_grep "$README" '##.*[Tt]est|[Tt]esting'                  "README documents Testing"
check_grep "$README" '##.*[Dd]eploy|[Ee][Cc]2|[Aa][Ww][Ss]'   "README documents Deployment"

# TESTING.md docs
opt_grep "$APP_DIR/TESTING.md" 'vitest|playwright|jest|unit|e2e' "TESTING.md present and describes test strategy"

# JSDoc / inline comments
JSDOC=$(grep -rE '/\*\*|@param|@returns' "$APP_DIR/src" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
info "JSDoc / doc-comment lines in src/: $JSDOC"
if [ "$JSDOC" -ge 5 ]; then
  pass "JSDoc comments present ($JSDOC lines)"
else
  warn "Limited JSDoc ($JSDOC lines) – consider adding more inline documentation"
fi

# =============================================================================
#  FINAL REPORT
# =============================================================================
section "════ ASSESSMENT SUMMARY ════"

TOTAL=$((PASS + FAIL + WARN))
echo ""
echo -e "  ${GREEN}${BOLD}PASSED  : $PASS${RESET}"
echo -e "  ${RED}${BOLD}FAILED  : $FAIL${RESET}"
echo -e "  ${YELLOW}${BOLD}WARNINGS: $WARN${RESET}"
echo -e "       ─────────────"
echo -e "  ${BOLD}TOTAL   : $TOTAL checks${RESET}"
echo ""

# Grading hint
if [ "$FAIL" -eq 0 ] && [ "$WARN" -le 5 ]; then
  echo -e "  ${GREEN}${BOLD}✔  Excellent – all required checks PASSED, minimal warnings.${RESET}"
elif [ "$FAIL" -eq 0 ]; then
  echo -e "  ${YELLOW}${BOLD}⚠  Good – all required checks passed but $WARN warning(s) to address.${RESET}"
elif [ "$FAIL" -le 3 ]; then
  echo -e "  ${YELLOW}${BOLD}⚠  Needs work – $FAIL failure(s) detected. Review red items above.${RESET}"
else
  echo -e "  ${RED}${BOLD}✘  Significant gaps – $FAIL failure(s). Action required before submission.${RESET}"
fi

echo ""
echo -e "  ${BOLD}To run individual test suites:${RESET}"
echo "    cd solid-colour"
echo "    npm run test:unit          # Vitest unit + integration"
echo "    npm run build && npm run test:e2e   # Playwright E2E"
echo "    npm run lint               # ESLint"
echo "    npm run format:check       # Prettier"
echo ""

# Exit non-zero if there are hard failures
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
