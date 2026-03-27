#!/bin/bash
set -e
# Usage: deploy.sh

# Cleanup function
cleanup() {
    echo "Stopping local ICP network..."
    dfx stop
    exit $1
}

# Handle interruption (Ctrl+C)
trap 'cleanup 1' INT TERM

echo "Starting local ICP network..."
dfx start --background --clean

echo "Creating canisters..."
dfx canister create frontend || true
dfx canister create backend || true

# Export environment variables (optional)
export BACKEND_CANISTER_ID=$(dfx canister id backend)
export STORAGE_GATEWAY_URL=http://localhost:4943
export II_URL=http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943

echo "Deploying canisters..."
dfx deploy

echo "--------------------------------------"
echo "✅ Deployment successful!"
echo "Frontend URL:"
echo "http://localhost:4943/?canisterId=$(dfx canister id frontend)"
echo "--------------------------------------"

echo "Press Ctrl+C to stop the local network..."

# Keep script running
while true; do
    sleep 2
done