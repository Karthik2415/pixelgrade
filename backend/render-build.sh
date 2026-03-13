#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Store the Puppeteer cache in the project directory
# Read https://github.com/puppeteer/puppeteer/blob/main/docs/guides/configuration.md#configuration
export PUPPETEER_CACHE_DIR="$HOME/.cache/puppeteer"

# Install Chromium (Puppeteer)
npx puppeteer browsers install chrome
