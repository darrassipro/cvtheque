# Mobile App - Server Connection Guide

## Network Configuration

### PC Server Details
- **PC IP Address**: `192.168.1.95`
- **Server Port**: `12000`
- **Full Server URL**: `http://192.168.1.95:12000`

### Mobile App Configuration

The mobile app uses **automatic IP detection** - no hardcoding needed!

**File**: `mobile/lib/api/baseQuery.ts`
- Reads from: `mobile/constants/api.ts`
- Configuration: `mobile/.env.local`

## How IP Detection Works

The app automatically detects the server IP using this priority order:

### 1️⃣ **Auto-Detection (Recommended - No Setup)**
```
When you run: npx expo start
Expo provides the development server IP → App uses it automatically
```
- Works on physical phones via QR code scan
- Works on Android/iOS simulators
- No manual configuration needed ✅

### 2️⃣ **Manual Override (If Auto-Detection Fails)**
```bash
# In mobile/.env.local
EXPO_PUBLIC_LOCAL_IP=192.168.1.95
```

### 3️⃣ **Complete URL Override (Full Control)**
```bash
# In mobile/.env.local
EXPO_PUBLIC_API_URL=http://192.168.1.95:12000
```

## How to Connect Physical Phone to Server

### Prerequisites
1. ✅ Both PC and phone are on the same Wi-Fi network (`192.168.1.x`)
2. ✅ Server is running on PC: `npm run dev` in `server/` folder
3. ✅ Mobile app is configured (already done!)

### Steps to Test Connection

#### 1. **Verify Server is Running**
```bash
cd server
npm run dev
# Should output: listening on port 12000
```

#### 2. **Start Expo Server**
```bash
cd mobile
npx expo start
```
You'll see the QR code and auto-detected IP in the terminal output.

#### 3. **On Physical Phone**
- Install **Expo Go** app from App Store or Google Play
- When prompted, tap the QR code scanner button
- Scan the QR code from terminal
- App connects to your local development server
- Check the logs in the terminal - you'll see:
  ```
  ✅ Local IP auto-detected from Expo hostUri: 192.168.1.95
  ✅ Using auto-detected local IP: http://192.168.1.95:12000
  ```

#### 4. **Verify Backend Connection**
- When you login/register, the app sends requests to your server
- Check server terminal for incoming requests
- You should see logs like: `POST /api/auth/login`

## Environment Variables Reference

### `EXPO_PUBLIC_SERVER_PORT`
- **Default**: `12000`
- **Purpose**: The port your server runs on
- **Usage**: Change this if you run the server on a different port

### `EXPO_PUBLIC_LOCAL_IP`
- **Default**: Auto-detected
- **Purpose**: Manual override for the PC IP address
- **Usage**: Set this only if auto-detection fails
- **Example**: `EXPO_PUBLIC_LOCAL_IP=192.168.1.95`

### `EXPO_PUBLIC_API_URL`
- **Default**: Auto-constructed from IP + port
- **Purpose**: Complete control over the API endpoint
- **Usage**: Set this for production or if you need a custom domain
- **Example**: `EXPO_PUBLIC_API_URL=http://192.168.1.95:12000`
- **Note**: This overrides both IP and port auto-detection

## Troubleshooting

### ❌ "Cannot Connect to Server"

**1. Check server is running:**
```bash
cd server && npm run dev
```

**2. Check firewall:**
- Windows may block port 12000
- Go to Windows Defender → Firewall → Allow an app through firewall
- Or temporarily disable firewall to test

**3. Verify auto-detection is working:**
- Look for this log in the terminal:
  ```
  ✅ Local IP auto-detected from Expo hostUri: 192.168.1.95
  ```
- If you see the IP, auto-detection is working!

**4. Verify phone is on same network:**
- Phone: Settings → Wi-Fi → Same network as PC
- Check both have `192.168.1.x` IP pattern

**5. Manual override as last resort:**
```bash
# In mobile/.env.local, add:
EXPO_PUBLIC_LOCAL_IP=192.168.1.95

# Then restart Expo:
npx expo start
```

### ❌ "Metro Bundle Error"

**Solution:**
1. Stop Expo: `Ctrl+C` in terminal
2. Restart: `npx expo start`
3. Clear cache if still failing: `npx expo start --clear`

### ❌ "Network Request Timeout"

**Checklist:**
1. ✅ Server running on correct port (12000)
2. ✅ Phone connected to same Wi-Fi
3. ✅ Firewall allows port 12000
4. ✅ Logs show correct IP being used
5. ✅ Network cable/Wi-Fi is stable

### ❌ "Wrong IP Detected"

**Check what IP was detected:**
```
Look at terminal output when app starts
Should show: ✅ Local IP auto-detected from Expo hostUri: XXX.XXX.XXX.XXX
```

**If wrong IP was detected:**
```bash
# In mobile/.env.local:
EXPO_PUBLIC_LOCAL_IP=192.168.1.95
EXPO_PUBLIC_SERVER_PORT=12000

# Restart Expo
npx expo start
```

## Network Topology

```
┌─────────────────────────────────┐
│       Wi-Fi Router              │
│      192.168.1.254              │
│                                 │
├──────────────────┬──────────────┤
│                  │              │
│         192.168.1.95    192.168.1.xxx
│    (PC - Server)       (Physical Phone)
│    :12000             ↓
│    Backend ←── Expo Auto-Detects
│                       ↑
│    Expo Dev Server    QR Code Scan
│    :8081              (Auto IP from Expo)
│                             │
└─────────────────────────────┘
      ↑                    ↑
      └────── Connected ───┘
```

## All Set! 🚀

Your mobile app now **automatically detects** the server IP!

### Quick Start:
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start mobile app
cd mobile && npx expo start

# Phone: Scan QR code
# App: Auto-connects to server ✅
```

**That's it!** No manual IP configuration needed for local development. The app will automatically detect your PC's IP from the Expo connection.

### For Production:
Update `mobile/.env.local` with your production API URL when deploying.


