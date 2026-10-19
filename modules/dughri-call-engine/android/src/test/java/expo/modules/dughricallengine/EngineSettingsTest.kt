package expo.modules.dughricallengine

import org.junit.Assert.*
import org.junit.Test

/** Pure settings assertions; no persistence/device behavior implied. */
class EngineSettingsTest {
  @Test fun defaultsAreOffWithBothDirectionsPlanned() {
    val settings = EngineSettings.defaults()
    assertFalse(settings.enabled)
    assertTrue(settings.showAfterIncoming)
    assertTrue(settings.showAfterOutgoing)
    assertEquals(1, settings.schemaVersion)
  }
  @Test fun unknownOrAbsentSchemaFailsClosedToDisabled() {
    assertFalse(EngineSettings.decode(schema = null, enabled = true).enabled)
    assertFalse(EngineSettings.decode(schema = 2, enabled = true).enabled)
    assertFalse(EngineSettings.decode(schema = 1, enabled = null).enabled)
  }
  @Test fun enabledSettingStillCannotReachListeningWhileG2Blocked() {
    val enabled = EngineSettings.decode(schema = 1, enabled = true)
    assertTrue(enabled.enabled)
    val caps = EngineCapabilities.snapshot(roleGranted = true, phonePermissionGranted = true, canDrawOverlays = true)
    assertEquals("suppressed", EngineSettings.effectiveMode(enabled, caps))
    assertEquals("inactive", EngineSettings.effectiveMode(EngineSettings.defaults(), caps))
  }
}
