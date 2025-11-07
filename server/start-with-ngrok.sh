#!/bin/bash
# Start the server with ngrok tunnel
# Make sure ngrok is installed: https://ngrok.com/download

echo "Starting server with ngrok tunnel..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ERROR: ngrok is not installed!"
    echo "Download and install from: https://ngrok.com/download"
    echo "Then add it to your PATH"
    exit 1
fi

# Start ngrok in background
echo "Starting ngrok tunnel on port 4000..."
ngrok http 4000 > /tmp/ngrok.log 2>&1 &

# Wait a moment for ngrok to start
sleep 3

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "ERROR: Could not get ngrok URL. Check if ngrok is running."
    echo "You can view ngrok at: http://localhost:4040"
    exit 1
fi

echo "=========================================="
echo "✅ Ngrok tunnel is active!"
echo "Public URL: $NGROK_URL"
echo "=========================================="
echo ""
echo "Update your .env file with:"
echo "EXPO_PUBLIC_API_URL=$NGROK_URL"
echo ""
echo "Then restart your Expo dev server."
echo ""
echo "To stop ngrok, run: pkill ngrok"
echo "=========================================="
echo ""

# Start the server
node server.js

