import expo.modules.dughricallengine.EngineCapabilitiesTest
import expo.modules.dughricallengine.EligibilityGateTest
import expo.modules.dughricallengine.EngineSettingsTest
import expo.modules.dughricallengine.SessionCorrelatorTest

// Runs the same JVM assertions without Gradle/Android SDK downloads.
fun main() {
  val correlator = SessionCorrelatorTest()
  correlator.idleAloneCannotCompleteCall()
  correlator.outgoingOffhookNeverProvesAnswerOrAttribution()
  correlator.metadataOverlapFailsClosed()
  correlator.nextCallCannotReusePreviousNumber()
  correlator.expiryDestroysCandidateEvenWithoutIdleCallback()
  correlator.registrationDuringCallIsAmbiguous()
  val capabilities = EngineCapabilitiesTest()
  capabilities.numberSourceStaysUnsupportedWhileG2Blocked()
  capabilities.backgroundStaysUnknownNeverAvailableWithoutEvidence()
  capabilities.callDetectionNeedsBothRoleAndPhoneState()
  capabilities.snapshotNeverReportsAvailableForUnprovenSources()
  capabilities.missingPermissionsDowngradeNeverUpgrade()
  val gate = EligibilityGateTest()
  gate.disabledBlocksEverythingImmediately()
  gate.lockedDeviceSuppressesEvenWhenHypotheticallyCapable()
  gate.permissionGapsSuppressBeforeOverlayAndNumberSource()
  gate.unverifiedNumberSourceSuppressesEvenWithAllPermissionsGranted()
  gate.returnsOnlyKnownSuppressionReasons()
  gate.correlatorSuppressionReasonsPassThroughUnchanged()
  val settings = EngineSettingsTest()
  settings.defaultsAreOffWithBothDirectionsPlanned()
  settings.unknownOrAbsentSchemaFailsClosedToDisabled()
  settings.enabledSettingStillCannotReachListeningWhileG2Blocked()
  println("PASS: 20 synthetic JVM tests (no Android integration evidence)")
}
