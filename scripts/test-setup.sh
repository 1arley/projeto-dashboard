#!/bin/bash

# Test script to validate setup improvements
# Run with: bash scripts/test-setup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
    echo "[PASS] $1"
    ((PASS_COUNT++))
}

fail() {
    echo "[FAIL] $1"
    ((FAIL_COUNT++))
}

echo "=== Testing Setup Improvements ==="
echo ""

# Test 1: Check that .env exists
echo -n "Testing .env exists... "
if [ -f "$ENV_FILE" ]; then
    pass ".env file exists"
else
    fail ".env file does not exist"
fi

# Test 2: Check that SECRET_KEY is not the default value
echo -n "Testing SECRET_KEY is not default... "
if [ -f "$ENV_FILE" ]; then
    SECRET_KEY=$(grep "^SECRET_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
    if [ -n "$SECRET_KEY" ] && [ "$SECRET_KEY" != "your-secret-key-here" ]; then
        pass "SECRET_KEY is set to a custom value"
    else
        fail "SECRET_KEY is missing or still set to default"
    fi
else
    fail "Cannot check SECRET_KEY - .env file missing"
fi

# Test 3: Check that DB_PASSWORD and POSTGRES_PASSWORD are set
echo -n "Testing DB_PASSWORD is set... "
if [ -f "$ENV_FILE" ]; then
    DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)
    if [ -n "$DB_PASSWORD" ]; then
        pass "DB_PASSWORD is set"
    else
        fail "DB_PASSWORD is not set"
    fi
else
    fail "Cannot check DB_PASSWORD - .env file missing"
fi

echo -n "Testing POSTGRES_PASSWORD is set... "
if [ -f "$ENV_FILE" ]; then
    POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)
    if [ -n "$POSTGRES_PASSWORD" ]; then
        pass "POSTGRES_PASSWORD is set"
    else
        fail "POSTGRES_PASSWORD is not set"
    fi
else
    fail "Cannot check POSTGRES_PASSWORD - .env file missing"
fi

# Test 4: Check that make env-check passes
echo -n "Testing make env-check... "
if [ -f "$PROJECT_ROOT/Makefile" ]; then
    if make -C "$PROJECT_ROOT" env-check > /dev/null 2>&1; then
        pass "make env-check passed"
    else
        fail "make env-check failed"
    fi
else
    fail "Makefile not found"
fi

# Summary
echo ""
echo "=== Summary ==="
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "All tests passed!"
    exit 0
else
    echo "Some tests failed."
    exit 1
fi
