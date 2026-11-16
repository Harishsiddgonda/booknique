# 📱 BOOKNIQUE Mobile Android Application Guide

**Package ID:** `com.booknique.app`  
**Application Name:** `Booknique`  
**Version:** `1.0.0` (Build 1)  
**Target SDK:** Android 14 / Android 15 (API Level 36, Min SDK 24 - Android 7.0+)  
**Primary Deliverable:** [`Booknique-v1.0.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/Booknique-v1.0.apk) (4.27 MB)

---

## 🚀 1. Installable APK Locations

The build has been verified and compiled with Gradle and Microsoft OpenJDK 17:

1. **Root Directory (Ready to Share & Install):**  
   [`c:\Users\HarishRuler\Downloads\rsr-books-toys-rental\Booknique-v1.0.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/Booknique-v1.0.apk)

2. **Gradle Build Output:**  
   [`c:\Users\HarishRuler\Downloads\rsr-books-toys-rental\frontend\android\app\build\outputs\apk\debug\app-debug.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/frontend/android/app/build/outputs/apk/debug/app-debug.apk)

---

## 📲 2. How to Install on Any Physical Android Phone

### Step 1: Transfer the APK
Transfer `Booknique-v1.0.apk` to your Android device using any of these simple methods:
- **USB Cable:** Plug in your phone, copy `Booknique-v1.0.apk` into your phone's `Downloads` folder.
- **WhatsApp Web / Telegram:** Send the APK file to yourself and tap download on the phone.
- **Google Drive / Gmail:** Upload the `.apk` file to Google Drive or email it as an attachment, then open and tap download on your device.
- **ADB Command Line:** If USB Debugging is enabled:
  ```powershell
  adb install -r "c:\Users\HarishRuler\Downloads\rsr-books-toys-rental\Booknique-v1.0.apk"
  ```

### Step 2: Enable "Install Unknown Apps"
When tapping the `.apk` on your phone:
1. Tap **Settings** when prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*.
2. Toggle on **Allow from this source**.
3. Tap **Install**.

---

## 🌐 3. Connecting the Mobile App to Your Backend

The app features an **Intelligent API Host Resolver** that supports both emulators and real physical devices without code changes:

| Environment | Backend Address | Behavior |
| :--- | :--- | :--- |
| **Android Studio Emulator** | `http://10.0.2.2:5000` | Automatically detected; connects directly to your Windows host machine. |
| **Physical Phone (WiFi)** | `http://<YOUR_LAN_IP>:5000` | Ensure your phone and PC are connected to the same WiFi network (e.g. `http://192.168.1.2:5000`). |

### Changing the Host IP Directly in the App:
1. Open Booknique on your phone.
2. Tap the **Profile** tab in the bottom navigation.
3. Scroll down to **"Developer & Network Settings"**.
4. Enter your computer's local WiFi IP (e.g., `192.168.1.2`) or tap the auto-suggested LAN address.
5. Tap **Save IP & Reconnect**. The app will immediately test and connect to your local backend.

---

## 🎨 4. Native Mobile Architecture & Features

### A. Mobile-Optimized Screens
- **Splash Screen:** Royal purple and deep gold branding with a glowing animated logo and Bengaluru Electronic City banner.
- **Onboarding Carousel:** 3-step swipeable visual introduction for first-time users highlighting:
  1. *Curated Children's & Adult Books* (board books to fantasy fiction).
  2. *Educational & STEM Toys* (Lego, Melissa & Doug, Fisher-Price).
  3. *Free Doorstep Delivery & Sanitized Pickups* in Electronic City, Bengaluru.
- **Fixed Mobile Bottom Navigation:** Instant access to 5 primary hubs:
  - 🏠 **Home:** Welcome header, live search, categories carousel, quota tracker, and trending shelves.
  - 🔍 **Explore:** Filterable catalog with toggle for Books / Toys, age categories, search, and sort.
  - 🔄 **My Rentals:** Active borrowings, live due-date countdown chips, late-fee trackers, and instant return requests.
  - 🛍️ **Bag (Cart):** Duration selector (15 vs 30 days), security deposits, and Doorstep Delivery checkout.
  - 👤 **Profile:** Bengaluru address book, Dark/Light mode theme switch, and network IP settings.
- **Native Hardware Back Button:** Handled smoothly by `@capacitor/app` to dismiss open modals, close bottom sheets, return to the Home tab, and double-press to exit.

### B. Currency & Regional Configuration
- All monetary amounts are formatted consistently in Indian Rupees (`₹` / `INR`) with Indian digit grouping (`en-IN`).
- Electronic City, Bengaluru address and delivery options pre-filled for rapid checkout.

---

## 🛠️ 5. Recompiling the APK

Whenever you make frontend changes in `frontend/src`:

1. Build the production web bundle:
   ```powershell
   cd frontend
   npm run build
   ```
2. Sync with Capacitor:
   ```powershell
   npx cap sync android
   ```
3. Run the automated build script:
   ```powershell
   c:\Users\HarishRuler\Downloads\rsr-books-toys-rental\scripts\build_android_apk.bat
   ```
4. The newly compiled APK will be output to:  
   `frontend\android\app\build\outputs\apk\debug\app-debug.apk`
