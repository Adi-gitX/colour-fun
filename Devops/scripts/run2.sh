#!/bin/bash

APP_NAME="solidBackgrounds"
ENV=${1:-"dev"}

echo "Starting $APP_NAME in $ENV mode..."

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js not found!"
    exit 2
fi
echo "Node.js found"

if [ ! -d "./logs" ]; then
    mkdir -p ./logs
    echo "Created logs folder"
else
    echo "logs folder exists, skipping"
fi

if [ ! -f "./.env" ]; then
    echo "APP_ENV=$ENV" > .env
    echo "Created .env file"
else
    echo ".env exists, skipping"
fi

echo "Setup done!"
exit 0
