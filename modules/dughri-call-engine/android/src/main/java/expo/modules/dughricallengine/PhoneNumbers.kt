package expo.modules.dughricallengine

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.NumberParseException

object PhoneNumbers {
  // Phase 0 deliberately accepts explicit international numbers only. No region guess.
  fun normalize(raw: String?): String? {
    if (raw == null || !raw.startsWith("+") || raw.length > 40) return null
    if (raw.any { it !in "+0123456789 ()-." }) return null
    return try {
      val util = PhoneNumberUtil.getInstance()
      val number = util.parse(raw, "ZZ")
      if (!util.isValidNumber(number) || number.hasExtension()) null
      else util.format(number, PhoneNumberUtil.PhoneNumberFormat.E164)
    } catch (_: NumberParseException) { null }
  }
  fun mask(e164: String?): String = e164?.let { "***" + it.takeLast(2) } ?: "none"
}
