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
  @Test fun outgoingCleanSessionCorrelates() {
    // Owner-approved runtime model: candidate while idle, single, offhook, idle.
    val engine = SessionCorrelator()
    engine.state("idle", 0)
    engine.metadata(candidate(direction = "outgoing"))
    engine.state("offhook", 5)
    engine.state("idle", 10)
    assertEquals("correlated", engine.completion)
    assertNull(engine.candidate)
    assertEquals("correlated", engine.lastCompleted?.reason)
    assertEquals("+966501234567", engine.lastCompleted?.candidate?.e164)
    assertEquals("outgoing", engine.lastCompleted?.candidate?.direction)
  }
  @Test fun incomingCleanSessionCorrelates() {
    val engine = SessionCorrelator()
    engine.state("idle", 0)
    engine.metadata(candidate())
    engine.state("ringing", 1)
    engine.state("offhook", 2)
    engine.state("idle", 3)
    assertEquals("correlated", engine.completion)
    assertEquals("+966501234567", engine.lastCompleted?.candidate?.e164)
  }
  @Test fun idleWithoutActiveCallNeverCompletesOrKeepsCandidate() {
    val engine = SessionCorrelator()
    engine.state("idle", 0)
    engine.metadata(candidate())
    engine.state("idle", 5) // No-op: no active call happened, so nothing can complete.
    assertEquals("candidate-only", engine.completion)
    assertNull(engine.lastCompleted)
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
    assertNull(engine.lastCompleted?.candidate)
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
