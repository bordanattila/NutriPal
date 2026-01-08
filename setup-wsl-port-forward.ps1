# PowerShell script to set up port forwarding from Windows to WSL2
# Run this in PowerShell as Administrator

$port = 4000
$wslIP = (wsl hostname -I).Trim()

Write-Host "Setting up port forwarding for port $port..." -ForegroundColor Cyan
Write-Host "WSL2 IP: $wslIP" -ForegroundColor Yellow
Write-Host ""

# Remove existing port forwarding rule if it exists
netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null

# Add new port forwarding rule
netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIP

# Add firewall rule to allow the port
netsh advfirewall firewall delete rule name="WSL2 Port $port" 2>$null
netsh advfirewall firewall add rule name="WSL2 Port $port" dir=in action=allow protocol=TCP localport=$port

Write-Host "Port forwarding configured!" -ForegroundColor Green
Write-Host "Port $port is now accessible from your local network" -ForegroundColor Green
Write-Host ""
Write-Host "Find your Windows IP with: ipconfig" -ForegroundColor Cyan
Write-Host "Then update your mobile app config with that IP address" -ForegroundColor Cyan

