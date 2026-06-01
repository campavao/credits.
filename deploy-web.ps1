# credits. — one-shot web deploy to Vercel
# Run `vercel login` ONCE first, then run this script: ./deploy-web.ps1 -Name creditz
# Re-run it any time to ship an update (after the first run you can omit -Name).

param(
  [string]$Name = "creditz"  # becomes <name>.vercel.app — change to whatever you claim
)

$ErrorActionPreference = "Stop"

# 1. Link (or create) the Vercel project with your chosen name
vercel link --yes --project $Name

# 2. Push EXPO_PUBLIC_* env vars from .env.local to Vercel (production)
$envFile = Join-Path $PSScriptRoot ".env.local"
Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -and $line.StartsWith("EXPO_PUBLIC_")) {
    $name, $value = $line -split "=", 2
    foreach ($target in @("production", "preview", "development")) {
      # remove existing value (ignore error if absent), then add fresh
      try { vercel env rm $name $target --yes 2>$null } catch {}
      $value | vercel env add $name $target
    }
    Write-Host "set $name" -ForegroundColor Green
  }
}

# 3. Build on Vercel and deploy to production
vercel --prod
