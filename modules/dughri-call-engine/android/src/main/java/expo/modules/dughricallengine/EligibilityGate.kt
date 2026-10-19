package expo.modules.dughricallengine

/** Pure suppression-only decision layer (BR-03/04/05/10/16). Every code path
 * returns a suppression reason; no automatic action can be authorized while
 * the per-call number source is unverified (G-2 BLOCKED). Precedence:
 * disabled -> device locked -> call-detection permission -> overlay ->
 * unverified number source -> correlator completion reason. Unknown completion
 * values fail closed to 'eligibility-unproven'. */
object EligibilityGate {
  val suppressionReasons = setOf(
    "disabled", "device-locked", "permission-missing", "overlay-unavailable",
    "number-source-unverified", "ambiguous", "number-unavailable", "expired",
    "number-invalid", "eligibility-unproven",
  )

  fun reason(
    enabled: Boolean,
    deviceLocked: Boolean,
    capabilities: Map<String, String>,
    completion: String,
  ): String = when {
    !enabled -> "disabled"
    deviceLocked -> "device-locked"
    capabilities["callDetection"] != "available" -> "permission-missing"
    capabilities["overlay"] != "available" -> "overlay-unavailable"
    capabilities["numberSource"] != "available" -> "number-source-unverified"
    completion !in suppressionReasons -> "eligibility-unproven"
    else -> completion
  }
}
