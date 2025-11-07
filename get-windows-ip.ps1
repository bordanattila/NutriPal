# PowerShell script to get Windows host IP address
# Run this in PowerShell on Windows to find your local network IP

Write-Host "Finding your Windows host IP address..." -ForegroundColor Cyan
Write-Host ""

# Get IPv4 addresses
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.IPAddress -notlike "10.255.*"
} | Select-Object IPAddress, InterfaceAlias

Write-Host "Your Windows host IP addresses on local network:" -ForegroundColor Green
$ipAddresses | ForEach-Object {
    Write-Host "  $($_.IPAddress) - $($_.InterfaceAlias)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Use one of these IPs in your mobile app config (usually the WiFi adapter)" -ForegroundColor Cyan

