#!/bin/bash
# Load Testing Runner Script

set -e

echo "=== ChatGPT Philippines Load Testing ==="
echo ""

# Configuration
TARGET_URL="${TARGET_URL:-http://localhost:3000}"
USERS="${USERS:-100}"
DURATION="${DURATION:-5m}"

echo "Target URL: $TARGET_URL"
echo "Users: $USERS"
echo "Duration: $DURATION"
echo ""

# Check if locust is installed
if ! command -v locust &> /dev/null; then
    echo "Locust not found. Installing..."
    pip install locust
fi

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "k6 not found. Please install from: https://k6.io/docs/getting-started/installation/"
    echo "Skipping k6 tests..."
    K6_AVAILABLE=false
else
    K6_AVAILABLE=true
fi

echo ""
echo "--- Running Locust Load Test ---"
echo "Access Locust UI at: http://localhost:8089"
echo ""

# Run Locust
locust -f locustfile.py \
    --host=$TARGET_URL \
    --users=$USERS \
    --spawn-rate=10 \
    --run-time=$DURATION \
    --headless \
    --html=report-locust.html \
    --csv=results-locust

echo ""
echo "Locust test completed. Report saved to: report-locust.html"
echo ""

# Run k6 if available
if [ "$K6_AVAILABLE" = true ]; then
    echo "--- Running k6 Load Test ---"
    echo ""

    BASE_URL=$TARGET_URL k6 run \
        --vus=$USERS \
        --duration=$DURATION \
        --out json=results-k6.json \
        k6-test.js

    echo ""
    echo "k6 test completed. Results saved to: results-k6.json"
fi

echo ""
echo "=== Load Testing Complete ==="
echo ""
echo "Reports generated:"
echo "  - Locust HTML: report-locust.html"
echo "  - Locust CSV: results-locust*.csv"
if [ "$K6_AVAILABLE" = true ]; then
    echo "  - k6 JSON: results-k6.json"
fi
echo ""
