package expo.modules.dughricallengine

/** Versioned product engine settings, default OFF (BR-09). Nothing in this
 * build writes them: no UI or probe path can enable automatic behavior while
 * G-2 is blocked. Unknown schema or absent values fail closed to disabled.
 * showAfterIncoming/showAfterOutgoing keep the locked product scope (both
 * directions) and trigger nothing in this build. */
object EngineSettings {
  const val SCHEMA_VERSION = 1

  data class Settings(
    val schemaVersion: Int,
    val enabled: Boolean,
    val showAfterIncoming: Boolean,
    val showAfterOutgoing: Boolean,
  )

  fun defaults(): Settings = Settings(
    schemaVersion = SCHEMA_VERSION,
    enabled = false,
    showAfterIncoming = true,
    showAfterOutgoing = true,
  )

  fun decode(
    schema: Int?,
    enabled: Boolean?,
    showAfterIncoming: Boolean? = null,
    showAfterOutgoing: Boolean? = null,
  ): Settings = if (schema == SCHEMA_VERSION) Settings(
    schemaVersion = schema,
    enabled = enabled == true,
    showAfterIncoming = showAfterIncoming ?: true,
    showAfterOutgoing = showAfterOutgoing ?: true,
  ) else defaults()

  /** Enabled is not 'available' (docs/05 §4): while the number source is not
   * verified the engine reports 'suppressed'. A 'listening' mode is
   * intentionally not representable until owner-approved evidence exists. */
  fun effectiveMode(settings: Settings, capabilities: Map<String, String>): String = when {
    !settings.enabled -> "inactive"
    capabilities["numberSource"] != "available" -> "suppressed"
    else -> "suppressed"
  }
}
