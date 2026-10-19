# Dughri (دغري) — Phase 0

Minimal Android feasibility probes: Expo/React Native diagnostics and a local Kotlin Expo module.
**Status: Phase 0 only. APK build and device startup passed in the earlier build session; automatic-call feasibility remains BLOCKED.**
See [evidence](docs/phase-0-evidence.md) and [ADR-001](docs/ADR-001-android-call-strategy.md).

An earlier session built and installed the development APK on the Samsung SM-A515U and observed the diagnostic screen with **Native module: Loaded**. All nine Kotlin JVM tests passed. This verifies the diagnostic build, not automatic call integration. The APK was later found absent once; it is present again and its SHA-256 matches the earlier verified build (`9F1CCA60D87D380DFB09EC4048FF72893B575223385629A475F4C2FF17092FC2`). Regenerate it with the shortcut below when a build containing the latest lint fixes is wanted.
Automatic overlays are deliberately suppressed: the selected APIs do not establish answered-call eligibility or verified call-end-to-number attribution. The independent overlay/WhatsApp buttons are labeled test-only; they are not a replacement product mode.

## Fast rebuild with the already installed tools

```powershell
npm run android:installed -- -Offline
# Add -Install to install the rebuilt APK on the connected phone:
npm run android:installed -- -Offline -Install
```

This uses the explicit compatibility setup already exercised: **JDK 25, NDK 30.0.16248370, CMake 4.1.2, Build Tools 37.0.0**, with JVM 17 bytecode targets. It selects the installed tools during incremental prebuild and applies `scripts/installed-toolchain.init.gradle` to the Gradle build, including framework plugin builds. It does not modify dependencies or request Android privileges. Set `JAVA_HOME` to Studio's JBR 25 if your shell points elsewhere; the script checks the Java major version.

`-Offline` prevents dependency downloads and fails clearly if a required artifact is not cached. Omit it only when you want Gradle to fetch missing Maven dependencies. SDK/JDK auto-provisioning remains disabled. The shortcut builds the APK and runs the module's JVM tests; Android lint is separate. After the owner downloaded the previously uncached lint compiler artifact (`kotlin-compiler:32.2.1`, ~53 MB), module lint passes **offline with zero findings**; run it with `.\android\gradlew.bat -p android :dughri-call-engine:lintDebug --offline -I "$PWD\scripts\installed-toolchain.init.gradle"` (set `JAVA_HOME` to Studio's JBR first).

The earlier successful command, from `android/`, was:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:CMAKE_VERSION = '4.1.2'
.\gradlew.bat :app:assembleDebug :dughri-call-engine:testDebugUnitTest -I "..\scripts\installed-toolchain.init.gradle" "-Porg.gradle.java.installations.auto-download=false" --console=plain "-PreactNativeArchitectures=arm64-v8a"
```

For USB development-server access, use IPv4 to avoid the observed IPv6/ADB-reverse connection failure:

```powershell
node scripts/start-metro.mjs
& "$env:ANDROID_HOME\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
& "$env:ANDROID_HOME\platform-tools\adb.exe" shell am start -a android.intent.action.VIEW -d "exp+dughri-phase-zero://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081" com.dughri.phasezero
```

The build shortcut itself is newly added; it has not been used for another full build. The underlying Gradle invocation above previously passed. No additional full build is needed merely for these script/documentation changes.

## Original framework baseline and deferred downloads

Verified on Windows: Node 24.21.0, npm 11.19.0, Android Studio JBR 25.0.3,
SDK `C:\Users\ashra\AppData\Local\Android\Sdk`, platform 37, Build Tools 36.0.0.
Connected physical phone: Samsung SM-A515U, Android 13/API 33, arm64-v8a.

Expo 58.0.14 / RN 0.88.0 select Gradle 9.4.1 / AGP 9.2.1 / Kotlin plugin 2.2.0.
Gradle supports Java 25 as its runtime, but RN explicitly requests **JDK 17** through `jvmToolchain(17)`.
Use JDK 17 for the build after installing it; Java 25 need not be uninstalled or replaced in Android Studio.
No JDK, SDK platform, NDK, CMake, or Gradle distribution was downloaded in this session.

### Download later (owner explicitly deferred)

In Android Studio **SDK Manager → SDK Tools → Show Package Details**, select:

| Component | Version | Why |
|---|---|---|
| Android SDK Build-Tools | 37.0.0 | RN 0.88 version catalog |
| NDK (Side by side) | 27.1.12297006 | RN 0.88 version catalog; substantial download |
| CMake | 3.30.5 | RN source default, explicitly pinned for all app/library native builds |
| JDK, outside SDK Manager | 17, Windows x64 | RN's compilation toolchain |

Existing platform **37** is retained; no additional SDK platform is requested.
For JDK 17 use [Temurin's official download page](https://adoptium.net/temurin/releases/?version=17), or another official JDK 17 distribution. Set `DUGHRI_JDK17` to its actual installation directory.

After you choose to download, the SDK Manager equivalent is (not executed here):

```powershell
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --install "build-tools;37.0.0" "ndk;27.1.12297006" "cmake;3.30.5"
```

The first Gradle build also needs Gradle 9.4.1 and Maven artifacts (AGP, Kotlin, React Native, Expo, libphonenumber, JUnit). These are additional downloads; their total size was not measured. The wrapper URL is `https://services.gradle.org/distributions/gradle-9.4.1-bin.zip`.
Do not change the wrapper to an arbitrary Gradle version. SDK and JDK **automatic** installation are disabled by the reproducible config plugin.

## Build and install after prerequisites

From the repository root in PowerShell:

```powershell
$env:ANDROID_HOME = 'C:\Users\ashra\AppData\Local\Android\Sdk'
$env:DUGHRI_JDK17 = 'C:\path\to\your\jdk-17'
$env:JAVA_HOME = $env:DUGHRI_JDK17
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$env:EXPO_NO_TELEMETRY = '1'
npm ci
npm run android:check
adb devices
npx expo prebuild --platform android --no-install
npx expo run:android --device
```

Alternatively `npm run android:guarded` checks prerequisites before invoking the expected device build command.
If a component is missing, it stops without invoking Gradle. Use Expo Development Build, **not Expo Go**.
Native code changes require rebuilding the APK. No EAS build is used.

The generated native project is ignored; source, manifest, resources and build policy live in `modules/dughri-call-engine/` and `plugins/withPhaseZero.js` and survive clean prebuild.
Probe minimum API is **31** (TelephonyCallback); target 36 / compile 37 follow the framework baseline. This is not a supported-device claim. The default build is arm64-v8a only, matching the attached phone.

To build an APK without installing, run from `android/` after generating it:

```powershell
.\gradlew.bat :app:assembleDebug :dughri-call-engine:testDebugUnitTest :dughri-call-engine:lintDebug
```

Expected artifact: `android/app/build/outputs/apk/debug/app-debug.apk` (development-signed, **not a production release**).
To install and launch once an APK exists:

```powershell
adb install -r "android/app/build/outputs/apk/debug/app-debug.apk"
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client --localhost
```

In another terminal:

```powershell
adb shell am start -n com.dughri.phasezero/.MainActivity
```

Open the local development project in the development launcher when prompted. For Gradle troubleshooting use `--stacktrace`. The app's redacted trace is the preferred call diagnostic; do not collect/share unrestricted telephony logcat, which may contain private system data. No app-authored full numbers or exception details are logged.

## Available source checks

```powershell
npm run typecheck
npm test
npm run test:kotlin
npx expo install --check
npx expo-modules-autolinking resolve --platform android
npx expo export --platform android --output-dir dist
node --check plugins/withPhaseZero.js
```

`test:kotlin` uses Android Studio's existing compiler and JUnit to run six synthetic pure-correlator tests without Gradle. It is not Android/device validation.
The earlier complete Gradle run passed **all nine JVM tests**, including the three number-parser tests. JS export compiles/bundles the screen but does not compile Kotlin. Native loading was separately observed on the physical phone; it does not establish real-call behavior.

## Using the probes after installation

1. Open diagnostics. Observation starts **off** each process; language alone is persisted.
2. Read role disclosure; request call-screening role only if you accept replacing the existing provider. Grant or deny in Android's real consent UI. No ADB grants.
3. Request phone-state permission; open overlay settings, grant or deny, and return. Recheck each distinct status.
4. Tap **Start observation probe**, wait for `Idle`. This registers only the default subscription in the current process, not a persistent background service.
5. Follow [T01–T14](docs/phase-0-evidence.md#required-device-test-matrix). Confirm numbers privately with the other tester; diagnostics show only their last two digits. Masked matching alone cannot prove exact identity.
6. For an **independent** handoff test, enter an explicitly international consenting number and tap the personal/Business test button. No message is populated or sent.
7. To probe overlay lifecycle independently, enter a consenting number again and tap **Show test-only shortcut**, then press Home. Verify tap, dismiss, 15-second expiry, lock and revocation behavior. A native global in-call check also guards the probe; no overlay should be actionable during a managed call. A 200 ms guard runs only during the 15-second probe, not as background telephony polling.
8. Stop clears candidates and removes overlays. Process death/reboot do not auto-restart observation. No foreground/boot service exists.

Do not place emergency calls for testing. Do not treat `Intent dispatched` as verified chat resolution or number registration.
Stop at Phase 0; owner GO and the documented two-phone real-call gate are required before Phase 1.
