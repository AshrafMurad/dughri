package expo.modules.dughricallengine

/** Honest typed capability mapping (ARCH-04 §5). 'unknown' is never upgraded
 * to 'available'. numberSource is a per-call runtime property, not a blanket
 * grant: the screening role supplies numbers via onScreenCall, and each call
 * is attributed (or suppressed) at runtime by the SessionCorrelator — so the
 * reported value is 'runtime-correlation', never 'available'. background
 * operation has no verified lifecycle evidence and stays non-available. */
object EngineCapabilities {
  const val BACKGROUND_OPERATION_VERIFIED = false

  fun phoneState(permissionGranted: Boolean): String =
    if (permissionGranted) "available" else "needs-permission"

  fun overlay(canDrawOverlays: Boolean): String =
    if (canDrawOverlays) "available" else "needs-permission"

  fun callDetection(roleGranted: Boolean, phonePermissionGranted: Boolean): String =
    if (roleGranted && phonePermissionGranted) "available" else "needs-permission"

  val numberSource: String get() = "runtime-correlation"

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
