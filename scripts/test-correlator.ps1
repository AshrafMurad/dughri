$ErrorActionPreference = 'Stop'
$studio = 'C:\Program Files\Android\Android Studio'
$env:JAVA_HOME = "$studio\jbr"
$output = 'C:\Users\ashra\AppData\Local\Temp\opencode\dughri-correlator-tests.jar'
if (!(Test-Path -LiteralPath (Split-Path $output))) { throw 'Temporary output parent is missing' }
$source = 'modules/dughri-call-engine/android/src'
& "$studio\plugins\Kotlin\kotlinc\bin\kotlinc.bat" `
  "$source/main/java/expo/modules/dughricallengine/SessionCorrelator.kt" `
  "$source/main/java/expo/modules/dughricallengine/EngineCapabilities.kt" `
  "$source/main/java/expo/modules/dughricallengine/EligibilityGate.kt" `
  "$source/main/java/expo/modules/dughricallengine/EngineSettings.kt" `
  "$source/test/java/expo/modules/dughricallengine/SessionCorrelatorTest.kt" `
  "$source/test/java/expo/modules/dughricallengine/EngineCapabilitiesTest.kt" `
  "$source/test/java/expo/modules/dughricallengine/EligibilityGateTest.kt" `
  "$source/test/java/expo/modules/dughricallengine/EngineSettingsTest.kt" `
  'tests/RunCorrelator.kt' -classpath "$studio\lib\junit4.jar" -include-runtime -d $output
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& "$env:JAVA_HOME\bin\java.exe" -cp "$output;$studio\lib\junit4.jar" RunCorrelatorKt
exit $LASTEXITCODE
