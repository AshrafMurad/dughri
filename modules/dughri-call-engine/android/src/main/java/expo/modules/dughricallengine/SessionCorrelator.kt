package expo.modules.dughricallengine

/** Pure diagnostic correlator. A time-adjacent candidate is NOT verified attribution.
 * Screening does not supply the subscription/session key or answered-end evidence
 * needed to authorize the product's automatic shortcut. All endings fail closed.
 */
class SessionCorrelator {
  data class Candidate(val id: String, val direction: String, val e164: String?, val at: Long)
  var candidate: Candidate? = null
    private set
  var state = "unknown"
    private set
  var completion = "unknown"
    private set
  private var ambiguous = false
  private var sawActive = false

  fun metadata(value: Candidate) {
    ambiguous = ambiguous || candidate != null || state == "offhook"
    candidate = if (ambiguous) null else value
    completion = if (ambiguous) "ambiguous" else "candidate-only"
  }

  fun state(next: String, now: Long) {
    if (next == state) return
    val previous = state
    state = next
    if (next != "idle") {
      sawActive = true
      if (previous == "unknown") ambiguous = true
      if (previous == "offhook" && next == "ringing") ambiguous = true
      completion = if (ambiguous) "ambiguous" else "candidate-only"
      return
    }
    if (sawActive) {
      completion = when {
        ambiguous -> "ambiguous"
        candidate == null -> "number-unavailable"
        now - candidate!!.at > 120_000L -> "expired"
        candidate!!.e164 == null -> "number-invalid"
        else -> "eligibility-unproven"
      }
    }
    candidate = null
    sawActive = false
    ambiguous = false
  }

  fun expire(now: Long) {
    if (candidate != null && now - candidate!!.at >= 120_000L) {
      candidate = null
      ambiguous = true
      completion = "expired"
    }
  }

  fun reset() {
    candidate = null
    state = "unknown"
    completion = "unknown"
    ambiguous = false
    sawActive = false
  }
}
