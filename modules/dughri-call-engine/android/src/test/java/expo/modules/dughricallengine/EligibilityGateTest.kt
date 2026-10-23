package expo.modules.dughricallengine

import org.junit.Assert.*
import org.junit.Test

/** Pure precedence assertions. The 'capsAvailable' map is a HYPOTHETICAL
 * all-available input used only to test gate ordering; it is not a capability
 * claim. Under the owner-approved runtime model, a 'correlated' completion
 * with real capabilities authorizes the automatic shortcut ('show'). */
class EligibilityGateTest {
  private val capsAvailable = mapOf(
    "callDetection" to "available",
    "phoneState" to "available",
    "numberSource" to "available",
    "overlay" to "available",
    "backgroundOperation" to "available",
  )
  private val capsReal = EngineCapabilities.snapshot(roleGranted = true, phonePermissionGranted = true, canDrawOverlays = true)

  @Test fun disabledBlocksEverythingImmediately() {
    assertEquals("disabled", EligibilityGate.reason(enabled = false, deviceLocked = true, capabilities = capsAvailable, completion = "correlated"))
  }
  @Test fun lockedDeviceSuppressesEvenWhenHypotheticallyCapable() {
    assertEquals("device-locked", EligibilityGate.reason(enabled = true, deviceLocked = true, capabilities = capsAvailable, completion = "correlated"))
  }
  @Test fun permissionGapsSuppressBeforeOverlayAndCompletion() {
    assertEquals("permission-missing", EligibilityGate.reason(true, false,
      capsAvailable.toMutableMap().apply { put("callDetection", "needs-permission") }, "correlated"))
    assertEquals("overlay-unavailable", EligibilityGate.reason(true, false,
      capsAvailable.toMutableMap().apply { put("overlay", "needs-permission") }, "correlated"))
  }
  @Test fun correlatedSessionWithRealCapabilitiesAuthorizesShow() {
    assertEquals("show", EligibilityGate.reason(true, false, capsReal, "correlated"))
  }
  @Test fun uncorrelatedSessionsSuppressEvenWithAllPermissionsGranted() {
    assertEquals("eligibility-unproven", EligibilityGate.reason(true, false, capsReal, "eligibility-unproven"))
    assertEquals("ambiguous", EligibilityGate.reason(true, false, capsReal, "ambiguous"))
    assertEquals("number-unavailable", EligibilityGate.reason(true, false, capsReal, "number-unavailable"))
  }
  @Test fun returnsOnlyKnownSuppressionReasons() {
    for (completion in listOf("unknown", "candidate-only", "", "eligible", "authorized")) {
      val reason = EligibilityGate.reason(true, false, capsAvailable, completion)
      assertTrue(EligibilityGate.suppressionReasons.contains(reason))
    }
  }
  @Test fun correlatorSuppressionReasonsPassThroughUnchanged() {
    for (completion in listOf("ambiguous", "number-unavailable", "expired", "number-invalid", "eligibility-unproven")) {
      assertEquals(completion, EligibilityGate.reason(true, false, capsAvailable, completion))
    }
  }
}
