# Skill Portal — Admin QR Attendance Scanner (Mobile App)

A dedicated mobile application for administrators and instructors to conduct rapid, anti-proxy classroom attendance check-ins using individual student QR codes.

Built with **React Native** + **Expo**, connecting to the Skill Portal **Spring Boot** backend and **MySQL** database.

---

## 📱 Features

1. **High-Speed Camera QR Scanner:**
   - Real-time targeting reticle with corner guides and laser line.
   - Torch / Flashlight toggle for dim classrooms.
   - Front/Rear camera switching.
   - Haptic / audio feedback upon valid scan.
2. **Instant Verification & Anti-Proxy:**
   - Decodes student's unique random token (`QR-...`).
   - Automatically marks attendance `PRESENT` (`source = 'QR_SCAN'`).
   - **Duplicate Scan Detection:** If scanned twice on the same day, warns `ALREADY MARKED TODAY` with the exact previous check-in time (`existingMarkedAt`).
3. **Rapid Check-In Loop:**
   - Modal shows student details, batch, and session topic.
   - Tap **"Scan Next Student"** to immediately resume scanning the next student in line.
4. **Manual Token Entry:**
   - Fallback text input to paste/type token if student screen is cracked or camera is unavailable.
5. **Today's Roster & History:**
   - Live roster of all checked-in students today with search by name/ID.
   - Historical session registers and attendance counts.
6. **Configurable Server Endpoint:**
   - Easily switch between local dev (`http://192.168.x.x:8080/api/v1` or `http://10.0.2.2:8080/api/v1`) and production Render backend.

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli` or via `npx expo`)
- **Expo Go** app on your physical iOS or Android phone (from App Store or Google Play)

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start Expo Development Server
```bash
npx expo start
```

### 3. Open on Your Phone
- **Android:** Scan the QR code shown in the terminal using the **Expo Go** app.
- **iOS:** Open the native **Camera** app, point at the terminal QR code, and tap the prompt to open in Expo Go.
- **Android Emulator:** Press `a` in the terminal.
- **iOS Simulator:** Press `i` in the terminal.

---

## 🔐 Demo Credentials

Use existing authorized admin credentials:
- **Email:** `admin@skillportal.com`
- **Password:** `Admin@123`

---

## 🌐 Connecting to the Backend

By default, the app is configured to connect to `http://10.0.2.2:8080/api/v1` (Android Emulator loopback) or your Render backend URL.

To connect from a physical phone via Wi-Fi:
1. Ensure your phone and development computer are on the same Wi-Fi network.
2. Find your PC's local IP address (e.g., `ipconfig` on Windows &rarr; `192.168.1.5`).
3. On the Login Screen or Settings Screen, tap **"Configure Server Endpoint URL"**.
4. Set the URL to:
   ```
   http://<YOUR_LOCAL_IP>:8080/api/v1
   ```
   (e.g., `http://192.168.1.5:8080/api/v1` or your live Render backend URL).
5. Tap **"Update Endpoint"** &rarr; Log in.

---

## 📂 Project Structure

```
mobile/
├── App.tsx                     # Main navigation & safe area wrapper
├── app.json                    # Expo project configuration & camera permissions
├── package.json                # Dependencies (Expo, react-native, expo-camera, axios)
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── api/
    │   └── client.ts           # Axios instance with AsyncStorage token & URL config
    ├── context/
    │   └── AuthContext.tsx     # Admin authentication state management
    ├── screens/
    │   ├── LoginScreen.tsx     # Admin login & server URL configuration
    │   ├── DashboardScreen.tsx # Metrics, live feed, quick launch buttons
    │   ├── ScannerScreen.tsx   # Expo camera scanner with reticle & flashlight
    │   ├── TodayAttendanceScreen.tsx # Live search & filter of today's check-ins
    │   ├── HistoryScreen.tsx   # Past session records
    │   └── SettingsScreen.tsx  # Server URL, profile info, logout
    ├── components/
    │   └── ScanResultModal.tsx # Color-coded result card & Rapid "Scan Next" action
    └── types/
        └── index.ts            # DTOs and models matching Spring Boot backend
```
