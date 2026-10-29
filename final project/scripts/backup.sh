#!/usr/bin/env bash
# Usage: ./scripts/backup.sh
# Requires mongodump and a reachable MongoDB URI in MONGODB_URI.
set -euo pipefail
: "${MONGODB_URI:=mongodb://127.0.0.1:27017/eventhub}"
STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups
mongodump --uri="$MONGODB_URI" --archive="backups/eventhub_${STAMP}.archive.gz" --gzip
echo "Backup created: backups/eventhub_${STAMP}.archive.gz"
