# Troubleshooting Mobile App Network Connection

## Problem
iOS device can't reach the API server at `http://192.168.1.16:4000`

## Solutions

### Solution 1: Set up Windows Port Forwarding (Recommended)

**On Windows PowerShell (Run as Administrator):**

```powershell
# Get WSL2 IP address
$wslIP = (wsl hostname -I).Trim()
Write-Host "WSL2 IP: $wslIP"

# Remove any existing port forwarding
netsh interface portproxy delete v4tov4 listenport=4000 listenaddress=0.0.0.0

# Add port forwarding from Windows to WSL2
netsh interface portproxy add v4tov4 listenport=4000 listenaddress=0.0.0.0 connectport=4000 connectaddress=$wslIP

# Allow through Windows Firewall
netsh advfirewall firewall delete rule name="WSL2 Port 4000" 2>$null
netsh advfirewall firewall add rule name="WSL2 Port 4000" dir=in action=allow protocol=TCP localport=4000

# Verify
netsh interface portproxy show all
```

**Then verify:**
1. Find your Windows IP: `ipconfig` (look for IPv4 under WiFi adapter)
2. Update `.env` file: `EXPO_PUBLIC_API_URL=http://YOUR_WINDOWS_IP:4000`
3. Restart Expo dev server

### Solution 2: Use ngrok for API Tunneling

If port forwarding doesn't work, use ngrok to tunnel the API server:

1. Install ngrok: https://ngrok.com/download
2. In WSL2, run: `ngrok http 4000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update `.env`: `EXPO_PUBLIC_API_URL=https://abc123.ngrok.io`
5. Restart Expo dev server

### Solution 3: Test Connection

**Test if the server is reachable:**

From your iOS device's Safari browser, try:
- `http://192.168.1.16:4000/graphql` (should show GraphQL playground or error)

If this doesn't load, the network connectivity is the issue.

**Test from WSL2:**
```bash
curl http://localhost:4000/graphql -X POST -H "Content-Type: application/json" -d '{"query":"{ __typename }"}'
```

**Test from Windows:**
```powershell
Invoke-WebRequest -Uri http://localhost:4000/graphql -Method POST -ContentType "application/json" -Body '{"query":"{ __typename }"}'
```

## Common Issues

1. **Windows Firewall blocking**: Check Windows Firewall settings
2. **Wrong IP address**: Make sure you're using the Windows host IP, not WSL2 IP
3. **Port forwarding not set up**: Run the PowerShell commands above
4. **Network changed**: If your IP changed, update `.env` file

