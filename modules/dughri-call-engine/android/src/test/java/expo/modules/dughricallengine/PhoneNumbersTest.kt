package expo.modules.dughricallengine

import org.junit.Assert.*
import org.junit.Test

class PhoneNumbersTest {
  @Test fun syntheticInternationalNumberNormalizes() {
    assertEquals("+966501234567", PhoneNumbers.normalize("+966 (50) 123-4567"))
  }
  @Test fun noCountryGuessOrPrivateOrEmergencyNumbers() {
    for (value in listOf(null, "0501234567", "private", "112", "+112", "+001555", "+966501234567;123")) {
      assertNull(PhoneNumbers.normalize(value))
    }
  }
  @Test fun diagnosticsOnlyShowTwoTrailingDigits() {
    assertEquals("***67", PhoneNumbers.mask("+966501234567"))
    assertEquals("none", PhoneNumbers.mask(null))
  }
}
