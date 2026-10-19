param(
  [switch]$Offline,
  [switch]$Install
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
if (!$env:ANDROID_HOME) { $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk" }
if (!$env:JAVA_HOME) { $env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr' }
$required = @(
  "$env:JAVA_HOME\bin\java.exe",
  "$env:ANDROID_HOME\platforms\android-37.0\android.jar",
  "$env:ANDROID_HOME\build-tools\37.0.0\aapt2.exe",
  "$env:ANDROID_HOME\ndk\30.0.16248370\source.properties",
  "$env:ANDROID_HOME\cmake\4.1.2\bin\cmake.exe"
)
foreach ($path in $required) {
  if (!(Test-Path -LiteralPath $path)) { throw "Missing prerequisite: $path" }
}
$javaVersion = (& "$env:JAVA_HOME\bin\java.exe" --version | Out-String)
if ($LASTEXITCODE -ne 0 -or $javaVersion -notmatch '\A(?:openjdk|java) 25(?:[.\s]|$)') {
  throw 'This compatibility build requires JAVA_HOME pointing to JDK 25.'
}
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$env:DUGHRI_USE_INSTALLED_TOOLCHAIN = '1'
$env:CMAKE_VERSION = '4.1.2'
$env:EXPO_NO_TELEMETRY = '1'
if ($Offline) { $env:EXPO_OFFLINE = '1' }

# Incremental generation preserves existing native build caches.
& npx expo prebuild --platform android --no-install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$gradleArgs = @(
  '-p', "$root\android",
  ':app:assembleDebug', ':dughri-call-engine:testDebugUnitTest',
  '-I', "$PSScriptRoot\installed-toolchain.init.gradle",
  '-Porg.gradle.java.installations.auto-download=false',
  '-PreactNativeArchitectures=arm64-v8a', '--console=plain'
)
if ($Offline) { $gradleArgs += '--offline' }
& "$root\android\gradlew.bat" @gradleArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$apk = "$root\android\app\build\outputs\apk\debug\app-debug.apk"
Get-FileHash -Algorithm SHA256 -LiteralPath $apk
if ($Install) {
  & "$env:ANDROID_HOME\platform-tools\adb.exe" install -r $apk
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & "$env:ANDROID_HOME\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
  exit $LASTEXITCODE
}
