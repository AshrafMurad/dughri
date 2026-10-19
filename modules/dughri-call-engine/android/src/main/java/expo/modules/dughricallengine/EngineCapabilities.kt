package expo.modules.dughricallengine

/** Honest typed capability mapping (ARCH-04 §5). 'unknown' is never upgraded to
 * 'available'. numberSource and backgroundOperation reflect verified Phase-0
 * evidence only: no verified per-call number acquisition (G-2 BLOCKED) and no
 * verified background lifecycle exist, so both stay non-available constants
 * until real-device evidence recorded by the owner changes them.
 * Permission-state 'available' never implies automatic behavior is verified. */
object EngineCapabilities {
  const val NUMBER_SOURCE_VERIFIED = false
  const val BACKGROUND_OPERATION_VERIFIED = false

  fun phoneState(permissionGranted: Boolean): String =
    if (permissionGranted) "available" else "needs-permission"

  fun overlay(canDrawOverlays: Boolean): String =
    if (canDrawOverlays) "available" else "needs-permission"

  fun callDetection(roleGranted: Boolean, phonePermissionGranted: Boolean): String =
    if (roleGranted && phonePermissionGranted) "available" else "needs-permission"

  val numberSource: String get() = if (NUMBER_SOURCE_VERIFIED) "available" else "unsupported"

  val backgroundOperation: String get() = if (BACKGROUND_OPERATION_VERIFIED) "available" else "unknown"

  fun snapshot(roleGranted: Boolean, phonePermissionGranted: Boolean, canDrawOverlays: Boolean): Map<String, String> =
    mapOf(
      "callDetection" to callDetection(roleGranted, phonePermissionGranted),
      "phoneState" to phoneState(phonePermissionGranted),
      "numberSource" to numberSource,
      "overlay" to overlay(canDrawOverlays),
      "backgroundOperation" to backgroundOperation,
    )
}
