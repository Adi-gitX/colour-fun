#!/bin/bash
set -euo pipefail

APP_NAME="colour-fun"
ENV=${1:-"dev"}
PORT=${2:-5173}

echo "Starting setup for $APP_NAME ($ENV)..."

command -v node >/dev/null 2>&1 || { echo "Node.js not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm not installed"; exit 1; }
echo "Node $(node -v), npm $(npm -v)"

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)/solid-colour"
[ -d "$APP_DIR" ] || { echo "App directory not found: $APP_DIR"; exit 1; }
cd "$APP_DIR"

if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "Dependencies up to date"
fi

mkdir -p ./logs

if [ ! -f ".env.local" ]; then
    echo "VITE_APP_ENV=$ENV" > .env.local
    echo "Created .env.local"
else
    echo ".env.local exists, skipping"
fi

echo "Setup complete for $APP_NAME"
