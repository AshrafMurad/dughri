import expo.modules.dughricallengine.EngineCapabilitiesTest
import expo.modules.dughricallengine.EligibilityGateTest
import expo.modules.dughricallengine.EngineSettingsTest
import expo.modules.dughricallengine.SessionCorrelatorTest

// Runs the same JVM assertions without Gradle/Android SDK downloads.
fun main() {
  val correlator = SessionCorrelatorTest()
  correlator.idleAloneCannotCompleteCall()
  correlator.outgoingCleanSessionCorrelates()
  correlator.incomingCleanSessionCorrelates()
  correlator.idleWithoutActiveCallNeverCompletesOrKeepsCandidate()
  correlator.metadataOverlapFailsClosed()
  correlator.nextCallCannotReusePreviousNumber()
  correlator.expiryDestroysCandidateEvenWithoutIdleCallback()
  correlator.registrationDuringCallIsAmbiguous()
  val capabilities = EngineCapabilitiesTest()
  capabilities.numberSourceReportsRuntimeCorrelationNeverBlanketAvailable()
  capabilities.backgroundStaysUnknownNeverAvailableWithoutEvidence()
  capabilities.callDetectionNeedsBothRoleAndPhoneState()
  capabilities.snapshotNeverReportsAvailableForUnprovenSources()
  capabilities.missingPermissionsDowngradeNeverUpgrade()
  val gate = EligibilityGateTest()
  gate.disabledBlocksEverythingImmediately()
  gate.lockedDeviceSuppressesEvenWhenHypotheticallyCapable()
  gate.permissionGapsSuppressBeforeOverlayAndCompletion()
  gate.correlatedSessionWithRealCapabilitiesAuthorizesShow()
  gate.uncorrelatedSessionsSuppressEvenWithAllPermissionsGranted()
  gate.returnsOnlyKnownSuppressionReasons()
  gate.correlatorSuppressionReasonsPassThroughUnchanged()
  val settings = EngineSettingsTest()
  settings.defaultsAreOffWithBothDirectionsPlanned()
  settings.unknownOrAbsentSchemaFailsClosedToDisabled()
  settings.enabledReachesActiveButStaysRuntimeGated()
  settings.permissionGapsKeepTheModeBelowActive()
  println("PASS: 24 synthetic JVM tests (no Android integration evidence)")
}
