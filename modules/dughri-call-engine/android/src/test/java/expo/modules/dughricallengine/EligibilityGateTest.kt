package expo.modules.dughricallengine

import org.junit.Assert.*
import org.junit.Test

/** Pure precedence assertions. The 'capsAvailable' map is a HYPOTHETICAL
 * all-available input used only to test gate ordering; it is not a capability
 * claim. With real constants the gate always suppresses (G-2 BLOCKED). */
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
    assertEquals("disabled", EligibilityGate.reason(enabled = false, deviceLocked = true, capabilities = capsAvailable, completion = "eligibility-unproven"))
  }
  @Test fun lockedDeviceSuppressesEvenWhenHypotheticallyCapable() {
    assertEquals("device-locked", EligibilityGate.reason(enabled = true, deviceLocked = true, capabilities = capsAvailable, completion = "eligibility-unproven"))
  }
  @Test fun permissionGapsSuppressBeforeOverlayAndNumberSource() {
    assertEquals("permission-missing", EligibilityGate.reason(true, false,
      capsAvailable.toMutableMap().apply { put("callDetection", "needs-permission") }, "eligibility-unproven"))
    assertEquals("overlay-unavailable", EligibilityGate.reason(true, false,
      capsAvailable.toMutableMap().apply { put("overlay", "needs-permission") }, "eligibility-unproven"))
  }
  @Test fun unverifiedNumberSourceSuppressesEvenWithAllPermissionsGranted() {
    assertEquals("number-source-unverified", EligibilityGate.reason(enabled = true, deviceLocked = false, capabilities = capsReal, completion = "eligibility-unproven"))
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
