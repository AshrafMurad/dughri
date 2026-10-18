$ErrorActionPreference = 'Stop'
$sdk = $env:ANDROID_HOME
if (!$sdk) { throw 'ANDROID_HOME is unset' }
$missing = @()
foreach ($part in @('platforms\android-37.0\android.jar', 'build-tools\37.0.0\aapt2.exe', 'ndk\27.1.12297006\source.properties', 'cmake\3.30.5\bin\cmake.exe')) {
  if (!(Test-Path -LiteralPath "$sdk\$part")) { $missing += $part }
}
if (!$env:DUGHRI_JDK17 -or !(Test-Path -LiteralPath "$env:DUGHRI_JDK17\bin\javac.exe")) {
  $missing += 'JDK 17 compilation toolchain: set DUGHRI_JDK17 to its installation path'
}
if ($missing.Count) {
  'BLOCKED: missing SDK components (nothing downloaded):'
  $missing
  exit 1
}
'PASS: expected SDK components present. Gradle/Maven dependencies may still need downloading.'
