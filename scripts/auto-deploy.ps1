# Skrip Auto-Pull & Rebuild Docker untuk Server Windows (PowerShell)
# Cocok untuk server dengan IP lokal/privat yang menjalankan Docker Desktop di Windows.
# Jalankan di terminal: .\scripts\auto-deploy.ps1

param(
  [string]$Branch = "main",
  [int]$IntervalSeconds = 30
)

Write-Host "==> Memantau repositori Git (branch: $Branch) setiap $IntervalSeconds detik..." -ForegroundColor Cyan

while ($true) {
  git fetch origin $Branch --quiet
  $localHash = (git rev-parse HEAD).Trim()
  $remoteHash = (git rev-parse "origin/$Branch").Trim()

  if ($localHash -ne $remoteHash) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Push baru terdeteksi ($localHash -> $remoteHash). Menarik kode & rebuild Docker..." -ForegroundColor Green

    if (Test-Path "data\cms.json") {
      Copy-Item "data\cms.json" "$env:TEMP\knmp_cms_backup.json" -Force
    }

    git reset --hard "origin/$Branch"

    if (Test-Path "$env:TEMP\knmp_cms_backup.json") {
      New-Item -ItemType Directory -Force -Path "data" | Out-Null
      Copy-Item "$env:TEMP\knmp_cms_backup.json" "data\cms.json" -Force
    }

    docker compose up -d --build --remove-orphans
    docker image prune -f
    Write-Host "[$timestamp] Container berhasil diperbarui!" -ForegroundColor Green
  }

  Start-Sleep -Seconds $IntervalSeconds
}

