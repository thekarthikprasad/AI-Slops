# APK Build Plan - Expense Manager

## Overview
Convert the React Vite expense manager web app to an Android APK using Capacitor.

## Prerequisites
- Node.js and npm (already installed ✓)
- Android Studio (required for building APK)
- Java Development Kit (JDK) 17 or higher

## Implementation Steps

### 1. Install Capacitor Dependencies
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 2. Initialize Capacitor
```bash
npx cap init
```
You'll need to provide:
- **App name**: Expense Manager
- **App ID**: `com.karth.expensemanager` (or your preferred package name)
- **Web directory**: `dist`

### 3. Build the Web App
```bash
npm run build
```

### 4. Add Android Platform
```bash
npx cap add android
```

### 5. Sync Web Assets to Android
```bash
npx cap sync android
```

### 6. Configure Android App
Update `android/app/src/main/res/values/strings.xml`:
- Set app name
- Configure theme colors

### 7. Build APK Options

#### Option A: Using Android Studio (Recommended)
1. Open Android Studio
2. Run: `npx cap open android`
3. Build → Build Bundle(s) / APK(s) → Build APK(s)
4. APK will be in `android/app/build/outputs/apk/debug/`

#### Option B: Using Gradle Command Line
```bash
cd android
./gradlew assembleDebug
```

### 8. Install APK on Device
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Configuration Files to Create

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.karth.expensemanager',
  appName: 'Expense Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

## Next Steps
1. Install Android Studio if not already installed
2. Run the commands in sequence
3. Build and test the APK

## Notes
- First build will take longer as Gradle downloads dependencies
- Debug APK is suitable for testing
- For production, create a signed release APK with a keystore
