# PowerShell dev runner for Scam Shield v2 (FastAPI backend + Next.js frontend)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting Scam Shield v2 Dev Services  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if ports 8000 and 3000 are clear
$apiJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    python -m uvicorn v2.api.main:app --host 127.0.0.1 --port 8000 --reload
}

$webJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\v2\web"
    npm run dev
}

Write-Host "[+] Backend API starting at: http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)" -ForegroundColor Green
Write-Host "[+] Frontend Web starting at: http://127.0.0.1:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow

try {
    while ($true) {
        Receive-Job -Job $apiJob
        Receive-Job -Job $webJob
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping dev servers..." -ForegroundColor Red
    Stop-Job -Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job -Job $apiJob -ErrorAction SilentlyContinue
    Stop-Job -Job $webJob -ErrorAction SilentlyContinue
    Remove-Job -Job $webJob -ErrorAction SilentlyContinue
    Write-Host "Dev servers stopped." -ForegroundColor Gray
}
