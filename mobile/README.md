# OBMMS Mobile

[![React Native](https://img.shields.io/badge/React%20Native-0.7x-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

The **React Native mobile app** for the Online Bus Monitoring & Management System (OBMMS). Built with React Native and TypeScript for Android (iOS support is limited — see [Building](#building)).

This README covers how to run the mobile app locally in development and how to build a release APK. For the backend, see [../backend/README.md](../backend/README.md). For the admin dashboard, see [../frontend/README.md](../frontend/README.md).

## Overview

The mobile app is the **rider and driver experience** of OBMMS. Riders see live vehicle locations, dues, and schedules. Drivers can share their vehicle's location from the phone. It talks to the same OBMMS backend that powers the admin dashboard.

Unlike the frontend, the mobile app is **not served by the backend** — it runs as a native app on the device. In development it connects to the backend via `adb reverse` (see [Setup](#setup)).

## Requirements

- **Android device or emulator running Android 11 or newer** — a physical device is recommended
- **OpenJDK 17** — required by React Native's Android build
- **Android Studio** with:
  - Android SDK Platform 36
  - Android 16 (Baklava) system image
  - Android SDK Build-Tools
- **Node.js 20 LTS or newer** — [download](https://nodejs.org/)
- **npm** — bundled with Node
- **A running backend** on `:8000` — see [../backend/README.md](../backend/README.md)

Verify:

```bash
java -version        # → openjdk 17.x
node --version       # → v20.x
adb devices          # → lists connected devices
```

## Setup

### 1. Enable developer options on the device

On your Android device:

1. Open **Settings → About phone**.
2. Find **Build number** (or **Serial number** on some devices).
3. Tap it **seven times** until a message says "You are now a developer."

### 2. Enable USB debugging

1. Open **Settings → Developer options**.
2. Turn on **Stay awake** (keeps the screen on while charging — useful during development).
3. Turn on **USB debugging**.
4. Connect the device to your development machine via USB.
5. Accept the "Allow USB debugging?" prompt on the device when it appears.

If the prompt doesn't appear, revoke USB debugging authorizations in Developer options and reconnect.

### 3. Enter the mobile folder

```bash
cd mobile/obmms
```

### 4. Install the WebSocket handler package

Download `mr-wshandler-react` **v0.1.0** from:

https://github.com/moeezraza35/mr-wshandler-react/releases/tag/v0.1.0

Extract the release archive into `mobile/obmms/dist/` — that is, save the folder contents as a directory named **`dist`** inside `mobile/obmms/`. The mobile source imports from this local path (`../dist`), so the folder must exist before `npm install`.

The final layout should look like:

<pre>
mobile/obmms/
├── dist/               ← extracted mr-wshandler-react contents
├── src/
├── android/
├── package.json
└── ...
</pre>

### 5. Install node packages

```bash
npm install
```

Run this once after cloning, and again whenever `package.json` changes.

### 6. Connect the device to Metro

Metro (React Native's bundler) and the backend both need to be reachable from the device. Use `adb reverse` to forward the device's ports to your machine.

First, find your device ID:

```bash
adb devices
```

You'll see output like:

```
List of devices attached
R58N123ABCD     device
```

The hex string on the left is your device ID.

Then run:

```bash
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8000 tcp:8000
adb reverse --list
```

The `--list` command should print both forwards. This lets the app use `http://localhost:8000` on the device and have it reach your dev machine's backend, and `:3000` reach Metro.

### 7. Run the app

```bash
npm run android -- --deviceId=<your-device-id>
```

Replace `<your-device-id>` with the ID printed by `adb devices`. For example:

```bash
npm run android -- --deviceId=R58N123ABCD
```

The first build takes several minutes (Gradle compiles native dependencies). Subsequent builds are much faster.

If you have only one device connected, you can usually omit `--deviceId`:

```bash
npm run android
```

Stop Metro with **Ctrl + C**. To reload the app after a JS change, press **R** twice in the Metro terminal, or shake the device to open the developer menu.

## Building

### Development build

A debug build, installable on any connected device, is produced by:

```bash
npm run android
```

The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Release APK

For a signed release APK (the format the mobile self-updater expects — see [Self-Update](#self-update)):

```bash
cd android
./gradlew assembleRelease
```

Output:

<pre>
android/app/build/outputs/apk/release/app-release.apk
</pre>

This is the file attached to `mobile-v*` GitHub releases by the CI workflow.

### Release AAB (Play Store)

If you plan to publish on Google Play:

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`.

> Release builds require a signing key. See the [React Native signing guide](https://reactnative.dev/docs/signed-apk-android) for setting up `android/gradle.properties` and a keystore. The CI workflow uses the repository's configured secrets.

### iOS

Direct iOS builds require macOS with Xcode. The app's iOS support is limited — the self-updater opens the release page in Safari instead of installing an IPA, since iOS does not allow sideloading. To build locally on macOS:

```bash
cd ios && pod install && cd ..
npm run ios
```

## Self-Update

In production, the mobile app checks GitHub for newer `mobile-v*` releases on startup (via `src/utils/updateManager.ts`). If one is found, it shows a native alert:

- **Cancel** — dismiss for this session
- **OK** — checks the `REQUEST_INSTALL_PACKAGES` permission, downloads the APK via Android's `DownloadManager`, and hands off to the system installer

This only works on Android. On iOS, the alert opens the release page in Safari instead.

The updater expects the release to include an `.apk` asset (the CI workflow attaches `obmms.apk`). See [TECHNICAL.md → Update Manager](../TECHNICAL.md#6-update-manager) for the full design.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `adb: no devices/emulators found` | Device not connected, or USB debugging not authorized | Reconnect USB; accept the authorization prompt on the device; run `adb kill-server && adb start-server` |
| `Failed to install the app` | Developer options / USB debugging not enabled, or device storage full | Verify settings from [Setup step 1](#1-enable-developer-options-on-the-device); free space on device |
| App opens but shows network error | Backend not running, or `adb reverse` not set up | Start the backend; rerun `adb reverse tcp:8000 tcp:8000` |
| Metro bundle 404 in the app | `adb reverse tcp:3000 tcp:3000` missing | Rerun the reverse command and reload the app |
| `Cannot find module '../dist'` | `mr-wshandler-react` not extracted into `mobile/obmms/dist/` | Redo [Setup step 4](#4-install-the-websocket-handler-package) |
| `SDK location not found` | `ANDROID_HOME` not set | Set `ANDROID_HOME` to your Android SDK path, or create `android/local.properties` with `sdk.dir=<path>` |
| Gradle build fails with Java error | Wrong JDK version | Ensure `JAVA_HOME` points to JDK 17 (`java -version` should show 17) |
| App launches the wrong device (emulator instead of physical) | Multiple devices connected | Always pass `--deviceId=<id>` from `adb devices` |

## License

Copyright (c) 2026 Moeez Raza. Released under the **MIT License**. See [../LICENSE.md](../LICENSE.md).