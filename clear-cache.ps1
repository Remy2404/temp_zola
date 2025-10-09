# Clear Next.js cache and restart development server

Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Cyan

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Removed .next directory" -ForegroundColor Green
}

# Remove node_modules/.cache if exists
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Cache cleared! Now run: npm run dev" -ForegroundColor Green
Write-Host ""
