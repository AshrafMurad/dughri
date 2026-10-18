package expo.modules.dughricallengine

import org.junit.Assert.*
import org.junit.Test

/** Synthetic JVM event sequences, never hardware/caller-number evidence. */
class SessionCorrelatorTest {
  private fun candidate(id: String = "synthetic-1", direction: String = "incoming", at: Long = 0) =
    SessionCorrelator.Candidate(id, direction, "+966501234567", at)

  @Test fun idleAloneCannotCompleteCall() {
    val engine = SessionCorrelator()
    engine.state("idle", 0)
    assertEquals("unknown", engine.completion)
  }
  @Test fun outgoingOffhookNeverProvesAnswerOrAttribution() {
    val engine = SessionCorrelator()
    engine.state("idle", 0)
    engine.metadata(candidate(direction = "outgoing"))
    engine.state("offhook", 5)
    engine.state("idle", 10)
    assertEquals("eligibility-unproven", engine.completion)
    assertNull(engine.candidate)
  }
  @Test fun metadataOverlapFailsClosed() {
    val engine = SessionCorrelator()
    engine.state("idle", 0)
    engine.metadata(candidate())
    engine.metadata(candidate("synthetic-2"))
    engine.metadata(candidate("synthetic-3"))
    engine.state("ringing", 1)
    engine.state("idle", 2)
    assertEquals("ambiguous", engine.completion)
    assertNull(engine.candidate)
  }
  @Test fun nextCallCannotReusePreviousNumber() {
    val engine = SessionCorrelator()
    engine.state("idle", 0)
    engine.metadata(candidate())
    engine.state("ringing", 1)
    engine.state("idle", 2)
    engine.state("ringing", 3)
    engine.state("idle", 4)
    assertEquals("number-unavailable", engine.completion)
  }
  @Test fun expiryDestroysCandidateEvenWithoutIdleCallback() {
    val engine = SessionCorrelator()
    engine.metadata(candidate())
    engine.expire(120_000)
    assertNull(engine.candidate)
    assertEquals("expired", engine.completion)
  }
  @Test fun registrationDuringCallIsAmbiguous() {
    val engine = SessionCorrelator()
    engine.state("offhook", 0)
    engine.metadata(candidate())
    engine.state("idle", 1)
    assertEquals("ambiguous", engine.completion)
  }
}
