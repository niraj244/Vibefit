# VibeFit Mobile App — Setup & Publishing Guide

## What this is
A React Native / Expo app that connects to the same backend as the website.
No duplicate server — same MongoDB, same API, same Cloudinary, same payments.

---

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for building): `npm install -g eas-cli`
- Expo account: https://expo.dev/signup (free)
- Android Studio (for Android emulator) OR Xcode (for iOS simulator, Mac only)
- Physical phone with **Expo Go** app installed (easiest for dev)

---

## 1. Install dependencies

```bash
cd MERN_stack_project/mobile
npm install
```

---

## 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
# Your deployed Render backend URL
EXPO_PUBLIC_API_URL=https://vibefit-tz0e.onrender.com

# Firebase (already filled from your project)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAlWcSrFLs4rvuawSEzxXUrxblO9FF_zPs
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ecommerce-website-projec-2b776

# Google OAuth Web Client ID — get this from:
# Firebase Console → Authentication → Sign-in method → Google → Web SDK config → Web client ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=138867943015-XXXXXXXX.apps.googleusercontent.com
```

> **Important:** `EXPO_PUBLIC_API_URL` must be your deployed Render URL, not `localhost`.
> On a physical phone, `localhost` points to the phone itself, not your computer.

---

## 3. Add mobile to CORS on your server

In your Render dashboard, add this env var:
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://adminvibefit.vercel.app,exp://YOUR_EXPO_IP:8081
```

Or set it wide open during dev:
```
ALLOWED_ORIGINS=*
```

---

## 4. Run in development

### On physical phone (easiest):
```bash
npm start
```
Scan the QR code with **Expo Go** (Android) or Camera app (iOS).

### On Android emulator:
```bash
npm run android
```

### On iOS simulator (Mac only):
```bash
npm run ios
```

---

## 5. Add placeholder app icon & splash

Before building, replace these placeholder files in `assets/`:
- `icon.png` — 1024×1024 PNG, your app icon
- `splash.png` — 1242×2436 PNG, splash screen
- `adaptive-icon.png` — 1024×1024 PNG, Android adaptive icon
- `favicon.png` — 48×48 PNG

Use [appicon.co](https://www.appicon.co) to generate all sizes from one image.

---

## 6. Build for production (EAS Build — free tier available)

### First time setup:
```bash
eas login
eas init   # links your project to Expo account
```

### Build Android APK/AAB:
```bash
npm run build:android
# Choose "Android App Bundle (.aab)" for Play Store
# Choose "APK" for direct install / testing
```

### Build iOS IPA:
```bash
npm run build:ios
# Requires Apple Developer account ($99/year)
```

EAS builds in the cloud — no local Xcode/Android SDK needed for production builds.

---

## 7. Publish to Google Play Store (free to set up, $25 one-time)

1. Build `aab` with `npm run build:android`
2. Go to [play.google.com/console](https://play.google.com/console)
3. Create app → fill store listing → upload AAB
4. Complete content rating questionnaire
5. Submit for review (1–3 days)

```bash
# Or use EAS Submit (automates upload):
npm run submit:android
```

---

## 8. Publish to Apple App Store ($99/year developer account)

1. Build IPA with `npm run build:ios`
2. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
3. Create app → upload IPA via Transporter or EAS Submit
4. Fill app metadata, screenshots, pricing
5. Submit for review (1–7 days)

```bash
npm run submit:ios
```

---

## App Features

| Screen | Description |
|--------|-------------|
| Home | Hero banner, category slider, featured & new arrivals |
| Browse | Product grid with search, category filter, sort |
| Product Detail | Images, sizes, add to cart, wishlist |
| Search | Live debounced search |
| Cart | Manage items, quantities, sizes |
| Checkout | Address selection, COD / PayPal / eSewa |
| Orders | Full order history with collapsible detail |
| Order Tracking | Live Pathao status via your API |
| Return Request | Submit return with reason + note |
| Addresses | Add/delete delivery addresses |
| Account | Profile, wishlist, orders, sign out |
| Auth | Login, Register, OTP Verify, Forgot Password, Google OAuth |

---

## Notes

- **Google OAuth** uses `expo-auth-session` — works in Expo Go with no native config needed.
  For production builds, add the OAuth redirect URI to Firebase console:
  `https://auth.expo.io/@YOUR_EXPO_USERNAME/vibefit-mobile`

- **PayPal & eSewa** open in a WebView inside the app and redirect back on success/failure.

- **Admin panel** is the website only: https://adminvibefit.vercel.app

- The app reads the same MongoDB database as the website — no data duplication.
