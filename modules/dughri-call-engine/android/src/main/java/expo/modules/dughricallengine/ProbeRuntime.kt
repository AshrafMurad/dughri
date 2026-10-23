package expo.modules.dughricallengine

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.telecom.Call
import android.telecom.TelecomManager
import androidx.core.content.edit
import java.util.UUID

/** Process-local probes only. No FGS, boot resurrection, persistent numbers or JS dependency. */
class ProbeRuntime private constructor(appContext: Context) {
  companion object {
    // False positive: the only Context retained is applicationContext (assigned via
    // getApplicationContext at both the construction call site and the context field initializer).
    @SuppressLint("StaticFieldLeak")
    @Volatile private var instance: ProbeRuntime? = null
    fun get(context: Context): ProbeRuntime = instance ?: synchronized(this) {
      instance ?: ProbeRuntime(context.applicationContext).also { instance = it }
    }
  }
  private val context: Context = appContext.applicationContext
  private val handler = Handler(Looper.getMainLooper())
  private val prefs = context.getSharedPreferences("phase0", Context.MODE_PRIVATE)
  // Product engine settings live separately; nothing writes them in this build (BR-09).
  private val enginePrefs = context.getSharedPreferences("engine", Context.MODE_PRIVATE)
  private fun engineSettings() = EngineSettings.decode(
    if (enginePrefs.contains("schema")) enginePrefs.getInt("schema", -1) else null,
    if (enginePrefs.contains("enabled")) enginePrefs.getBoolean("enabled", false) else null,
    if (enginePrefs.contains("incoming")) enginePrefs.getBoolean("incoming", true) else null,
    if (enginePrefs.contains("outgoing")) enginePrefs.getBoolean("outgoing", true) else null,
  )
  private val sessions = SessionCorrelator()
  private var observing = false // Explicit start each process; preference is NOT a running claim.
  private var observerStatus = "stopped"
  private var direction = "unknown"
  private var masked = "none"
  private var overlayStatus = "dismissed"
  private var diagnostic = "unknown"
  private val trace = ArrayDeque<Map<String, String>>()
  var listener: ((Map<String, Any>) -> Unit)? = null
  val overlay = OverlayController(context, { probeAllowed() }) { value -> overlayStatus = value; publish() }
  private val observer = CallStateObserver(context) { state ->
    if (observing) {
      if (state != "idle") overlay.dismiss("dismissed")
      sessions.state(state, SystemClock.elapsedRealtime())
      record("state-$state")
      if (state == "idle") autoShortcut()
      publish()
    }
  }
  private val expiry = Runnable {
    sessions.expire(SystemClock.elapsedRealtime())
    masked = "none"
    direction = "unknown"
    publish()
  }

  fun snapshot(): Map<String, Any> {
    sessions.expire(SystemClock.elapsedRealtime())
    val capabilities = EngineCapabilities.snapshot(
      ScreeningRole.status(context) == "granted", phoneGranted(), Settings.canDrawOverlays(context),
    )
    return mapOf(
      "role" to ScreeningRole.status(context),
      "phonePermission" to if (phoneGranted()) "granted" else "needs-permission",
      "overlayPermission" to if (Settings.canDrawOverlays(context)) "granted" else "needs-permission",
      "observing" to observing, "observer" to observerStatus,
      "state" to sessions.state, "direction" to direction, "maskedNumber" to masked,
      "completion" to sessions.completion, "overlay" to overlayStatus,
      "automatic" to EngineSettings.effectiveMode(engineSettings(), capabilities),
      "background" to "unknown",
      // Typed Phase-2 contract; diagnostics only, probe behavior unchanged.
      "capabilities" to capabilities,
      "engine" to EngineSettings.effectiveMode(engineSettings(), capabilities),
      "diagnostic" to diagnostic,
      "whatsapp" to WhatsAppLauncher.installed(context, "com.whatsapp"),
      "business" to WhatsAppLauncher.installed(context, "com.whatsapp.w4b"),
      "trace" to trace.toList()
    )
  }
  private fun phoneGranted() = context.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) ==
    PackageManager.PERMISSION_GRANTED

  private fun probeAllowed(): Boolean {
    if (!observing || sessions.state != "idle") return false
    if (ScreeningRole.status(context) != "granted") return false
    if (context.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) return false
    return try {
      // Global managed-call guard in addition to the default-subscription diagnostic state.
      context.getSystemService(TelecomManager::class.java)?.isInCall == false
    } catch (_: SecurityException) { false } catch (_: RuntimeException) { false }
  }

  fun refresh() {
    if (observing && (!phoneGranted() || ScreeningRole.status(context) != "granted")) stop()
    if (!Settings.canDrawOverlays(context) || overlay.locked()) overlay.dismiss("dismissed")
    publish()
  }
  fun start(): String {
    if (!phoneGranted()) return "needs-permission"
    if (ScreeningRole.status(context) != "granted") return "role-required"
    observing = true
    observerStatus = observer.start()
    if (observerStatus != "registered") observing = false
    record(observerStatus)
    publish()
    return observerStatus
  }
  fun stop() {
    observing = false
    observer.stop()
    observerStatus = "stopped"
    handler.removeCallbacks(expiry)
    sessions.reset()
    masked = "none"
    direction = "unknown"
    overlay.dismiss("dismissed")
    record("stopped")
    publish()
  }
  fun setEngine(enabled: Boolean, incoming: Boolean, outgoing: Boolean, business: Boolean, ar: Boolean, region: String?) {
    enginePrefs.edit {
      putInt("schema", EngineSettings.SCHEMA_VERSION)
      putBoolean("enabled", enabled)
      putBoolean("incoming", incoming)
      putBoolean("outgoing", outgoing)
      putBoolean("business", business)
      putBoolean("arabic", ar)
      putString("region", region)
    }
    publish()
  }
  private fun engineBusiness() = enginePrefs.getBoolean("business", false)
  private fun engineArabic() = enginePrefs.getBoolean("arabic", arabic())
  private fun engineRegion(): String? = enginePrefs.getString("region", null)

  /** Automatic post-call shortcut (owner-approved runtime model, 2026-10-23).
   * Fires only when this exact session completed 'correlated' — one pre-call
   * E.164 screening candidate, no overlap, idle within expiry — and the
   * engine is enabled for that call direction. Anything else records
   * 'auto-suppressed' and shows nothing. */
  private fun autoShortcut() {
    val settings = engineSettings()
    val capabilities = EngineCapabilities.snapshot(
      ScreeningRole.status(context) == "granted", phoneGranted(), Settings.canDrawOverlays(context))
    val completion = sessions.lastCompleted?.reason ?: "eligibility-unproven"
    val decision = EligibilityGate.reason(settings.enabled, overlay.locked(), capabilities, completion)
    if (decision != "show") { record("auto-suppressed"); return }
    val session = sessions.lastCompleted
    val candidate = session?.candidate
    val e164 = candidate?.e164
    if (candidate == null || e164 == null) { record("auto-suppressed"); return }
    val directionEnabled = when (candidate.direction) {
      "incoming" -> settings.showAfterIncoming
      "outgoing" -> settings.showAfterOutgoing
      else -> false
    }
    if (!directionEnabled) { record("auto-suppressed"); return }
    val outcome = overlay.showProbe(e164, engineBusiness(), engineArabic())
    record(if (outcome == "probe-visible") "auto-shown" else "auto-suppressed")
  }

  fun metadata(details: Call.Details) {
    overlay.dismiss("dismissed")
    if (!observing || !phoneGranted() || ScreeningRole.status(context) != "granted") return
    direction = when (details.callDirection) {
      Call.Details.DIRECTION_INCOMING -> "incoming"
      Call.Details.DIRECTION_OUTGOING -> "outgoing"
      else -> "unknown"
    }
    val handle = details.handle
    val e164 = if (handle?.scheme == "tel")
      PhoneNumbers.normalize(handle.schemeSpecificPart, engineRegion()) else null
    masked = PhoneNumbers.mask(e164)
    sessions.metadata(SessionCorrelator.Candidate(UUID.randomUUID().toString(), direction, e164,
      SystemClock.elapsedRealtime()))
    record("screening-candidate")
    handler.removeCallbacks(expiry)
    handler.postDelayed(expiry, 120_000)
    publish()
    // The automatic decision happens at idle via autoShortcut(); an ambiguous
    // or overlapping candidate never reaches the overlay.
  }
  fun manualProbe(number: String, business: Boolean, ar: Boolean): String {
    if (!probeAllowed()) return "idle-required"
    return overlay.showProbe(number, business, ar)
  }
  fun setLanguage(ar: Boolean) { prefs.edit { putBoolean("arabic", ar) } }
  fun arabic() = prefs.getBoolean("arabic", context.resources.configuration.locales[0].language == "ar")
  private fun record(code: String) {
    diagnostic = code
    if (trace.size >= 24) trace.removeFirst()
    trace.addLast(mapOf("at" to SystemClock.elapsedRealtime().toString(), "code" to code))
  }
  private fun publish() { listener?.invoke(snapshot()) }
}
