# PowerShell Simple Web Server
# Run this script to serve the X app locally

Write-Host "Starting X App Server..." -ForegroundColor Cyan
Write-Host "Server will run on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Change to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Start Python HTTP server (if Python is available)
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 8000
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    python3 -m http.server 8000
} else {
    Write-Host "Python not found. Please install Python or use another web server." -ForegroundColor Red
    Write-Host "Alternatively, you can use VS Code Live Server extension." -ForegroundColor Yellow
    pause
}
