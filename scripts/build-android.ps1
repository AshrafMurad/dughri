$ErrorActionPreference = 'Stop'
& "$PSScriptRoot\check-android-toolchain.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$env:JAVA_HOME = $env:DUGHRI_JDK17
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:EXPO_NO_TELEMETRY = '1'
& npx expo run:android --device
exit $LASTEXITCODE
