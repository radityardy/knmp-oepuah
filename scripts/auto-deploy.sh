#!/usr/bin/env bash
# Skrip Auto-Pull & Rebuild Docker untuk Server Linux / VPS (termasuk IP Privat / Lokal)
# Cara pakai otomatis (cron tiap 1 menit):
# * * * * * cd /path/to/knmp-oepuah && ./scripts/auto-deploy.sh >> /var/log/knmp-deploy.log 2>&1

set -e

BRANCH="${1:-main}"

git fetch origin "$BRANCH" --quiet
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
  echo "[$(date -Iseconds)] Pembaruan terdeteksi ($LOCAL_HASH -> $REMOTE_HASH). Memulai auto-deploy..."

  if [ -f data/cms.json ]; then
    cp data/cms.json /tmp/knmp_cms_backup.json
  fi

  git reset --hard "origin/$BRANCH"

  if [ -f /tmp/knmp_cms_backup.json ]; then
    mkdir -p data
    cp /tmp/knmp_cms_backup.json data/cms.json
    rm -f /tmp/knmp_cms_backup.json
  fi

  docker compose up -d --build --remove-orphans
  docker image prune -f
  echo "[$(date -Iseconds)] Auto-deploy selesai!"
fi

