#!/usr/bin/env bash
# Usage: MONGODB_URI='mongodb://127.0.0.1:27017/eventhub' ./scripts/restore.sh backups/file.archive.gz
# Restore overwrites matching documents; review the target URI before running.
set -euo pipefail
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: $0 path/to/backup.archive.gz" >&2
  exit 1
fi
: "${MONGODB_URI:=mongodb://127.0.0.1:27017/eventhub}"
mongorestore --uri="$MONGODB_URI" --archive="$1" --gzip --drop
echo "Restore finished."
