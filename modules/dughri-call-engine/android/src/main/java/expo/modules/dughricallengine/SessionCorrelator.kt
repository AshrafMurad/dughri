package expo.modules.dughricallengine

/** Runtime session correlator (owner-approved automatic model, 2026-10-23).
 * A completion of 'correlated' means: exactly one screening candidate was
 * received while the line was not off-hook, a call then went active and
 * returned to idle within 120 seconds, with no overlap or state ambiguity.
 * That is the strongest per-call attribution Android offers a sideloaded app
 * without READ_CALL_LOG; every other ending still fails closed.
 */
class SessionCorrelator {
  data class Candidate(val id: String, val direction: String, val e164: String?, val at: Long)
  data class Completed(val candidate: Candidate?, val reason: String)
  var candidate: Candidate? = null
    private set
  var lastCompleted: Completed? = null
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
        else -> "correlated"
      }
      lastCompleted = Completed(candidate, completion)
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
    lastCompleted = null
    state = "unknown"
    completion = "unknown"
    ambiguous = false
    sawActive = false
  }
}
