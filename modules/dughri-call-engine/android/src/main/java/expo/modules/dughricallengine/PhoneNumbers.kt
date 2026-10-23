package expo.modules.dughricallengine

import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.NumberParseException
import com.google.i18n.phonenumbers.Phonenumber

object PhoneNumbers {
  /** Explicit international numbers always parse with no region guess.
   * 00-prefix is treated as international. With a user-selected default
   * region, local national numbers (e.g. 0501234567) normalize to E.164
   * using that region's rules. Without a region, non-international input
   * still fails closed. Invalid or extended numbers always return null. */
  fun normalize(raw: String?, defaultRegion: String? = null): String? {
    if (raw == null || raw.length > 40) return null
    if (raw.any { it !in "+0123456789 ()-." }) return null
    val trimmed = raw.trim()
    return try {
      val util = PhoneNumberUtil.getInstance()
      when {
        trimmed.startsWith("+") -> e164(util.parse(trimmed, "ZZ"), util)
        trimmed.startsWith("00") -> e164(util.parse("+${trimmed.drop(2)}", "ZZ"), util)
        defaultRegion != null && defaultRegion.length == 2 ->
          e164(util.parse(trimmed, defaultRegion.uppercase()), util)
        else -> null
      }
    } catch (_: NumberParseException) { null }
  }
  private fun e164(number: Phonenumber.PhoneNumber, util: PhoneNumberUtil): String? =
    if (!util.isValidNumber(number) || number.hasExtension()) null
    else util.format(number, PhoneNumberUtil.PhoneNumberFormat.E164)
  fun mask(e164: String?): String = e164?.let { "***" + it.takeLast(2) } ?: "none"
}
