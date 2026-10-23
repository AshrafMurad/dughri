package expo.modules.dughricallengine

/** Runtime decision layer (BR-03/04/05/10/16; owner-approved automatic model,
 * 2026-10-23). Precedence: disabled -> device locked -> call-detection
 * permission -> overlay -> per-call completion. 'correlated' is the single
 * outcome that authorizes the automatic shortcut; every other completion
 * passes through as its suppression reason, and unknown values fail closed
 * to 'eligibility-unproven'. */
object EligibilityGate {
  val suppressionReasons = setOf(
    "disabled", "device-locked", "permission-missing", "overlay-unavailable",
    "ambiguous", "number-unavailable", "expired", "number-invalid", "eligibility-unproven",
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
    completion == "correlated" -> "show"
    completion in suppressionReasons -> completion
    else -> "eligibility-unproven"
  }
}
