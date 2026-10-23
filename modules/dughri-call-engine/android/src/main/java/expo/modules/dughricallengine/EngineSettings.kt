package expo.modules.dughricallengine

/** Versioned product engine settings, default OFF (BR-09). Written by the
 * shell when the owner toggles the shortcut switch (owner-approved automatic
 * model, 2026-10-23). Unknown schema or absent values fail closed to
 * disabled. 'active' means armed and runtime-gated: each call still has to
 * pass the SessionCorrelator/EligibilityGate chain before anything shows. */
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

  fun effectiveMode(settings: Settings, capabilities: Map<String, String>): String = when {
    !settings.enabled -> "inactive"
    capabilities["callDetection"] != "available" -> "permission-missing"
    capabilities["overlay"] != "available" -> "overlay-unavailable"
    else -> "active" // Per-call runtime gating still applies (EligibilityGate).
  }
}
