import expo.modules.dughricallengine.SessionCorrelatorTest

// Runs the same JVM assertions without Gradle/Android SDK downloads.
fun main() {
  val suite = SessionCorrelatorTest()
  suite.idleAloneCannotCompleteCall()
  suite.outgoingOffhookNeverProvesAnswerOrAttribution()
  suite.metadataOverlapFailsClosed()
  suite.nextCallCannotReusePreviousNumber()
  suite.expiryDestroysCandidateEvenWithoutIdleCallback()
  suite.registrationDuringCallIsAmbiguous()
  println("PASS: 6 synthetic correlator JVM tests (no Android integration evidence)")
}
