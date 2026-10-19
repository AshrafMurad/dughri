package expo.modules.dughricallengine

import org.junit.Assert.*
import org.junit.Test

/** Pure mapping assertions; no device, role or permission evidence implied. */
class EngineCapabilitiesTest {
  @Test fun numberSourceStaysUnsupportedWhileG2Blocked() {
    assertEquals("unsupported", EngineCapabilities.numberSource)
    assertFalse(EngineCapabilities.NUMBER_SOURCE_VERIFIED)
  }
  @Test fun backgroundStaysUnknownNeverAvailableWithoutEvidence() {
    assertEquals("unknown", EngineCapabilities.backgroundOperation)
    assertFalse(EngineCapabilities.BACKGROUND_OPERATION_VERIFIED)
  }
  @Test fun callDetectionNeedsBothRoleAndPhoneState() {
    assertEquals("available", EngineCapabilities.callDetection(roleGranted = true, phonePermissionGranted = true))
    assertEquals("needs-permission", EngineCapabilities.callDetection(roleGranted = false, phonePermissionGranted = true))
    assertEquals("needs-permission", EngineCapabilities.callDetection(roleGranted = true, phonePermissionGranted = false))
  }
  @Test fun snapshotNeverReportsAvailableForUnprovenSources() {
    val caps = EngineCapabilities.snapshot(roleGranted = true, phonePermissionGranted = true, canDrawOverlays = true)
    assertEquals("available", caps["callDetection"])
    assertEquals("available", caps["phoneState"])
    assertEquals("available", caps["overlay"])
    assertEquals("unsupported", caps["numberSource"])
    assertEquals("unknown", caps["backgroundOperation"])
  }
  @Test fun missingPermissionsDowngradeNeverUpgrade() {
    val caps = EngineCapabilities.snapshot(roleGranted = false, phonePermissionGranted = false, canDrawOverlays = false)
    assertEquals(
      setOf("callDetection", "phoneState", "numberSource", "overlay", "backgroundOperation"),
      caps.keys,
    )
    assertTrue(caps.values.all { it == "needs-permission" || it == "unsupported" || it == "unknown" })
  }
}
