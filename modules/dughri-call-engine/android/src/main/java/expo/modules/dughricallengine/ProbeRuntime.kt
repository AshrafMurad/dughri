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
    return mapOf(
      "role" to ScreeningRole.status(context),
      "phonePermission" to if (phoneGranted()) "granted" else "needs-permission",
      "overlayPermission" to if (Settings.canDrawOverlays(context)) "granted" else "needs-permission",
      "observing" to observing, "observer" to observerStatus,
      "state" to sessions.state, "direction" to direction, "maskedNumber" to masked,
      "completion" to sessions.completion, "overlay" to overlayStatus,
      "automatic" to "unsupported", "background" to "unknown",
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
  fun metadata(details: Call.Details) {
    overlay.dismiss("dismissed")
    if (!observing || !phoneGranted() || ScreeningRole.status(context) != "granted") return
    direction = when (details.callDirection) {
      Call.Details.DIRECTION_INCOMING -> "incoming"
      Call.Details.DIRECTION_OUTGOING -> "outgoing"
      else -> "unknown"
    }
    val handle = details.handle
    val e164 = if (handle?.scheme == "tel") PhoneNumbers.normalize(handle.schemeSpecificPart) else null
    masked = PhoneNumbers.mask(e164)
    sessions.metadata(SessionCorrelator.Candidate(UUID.randomUUID().toString(), direction, e164,
      SystemClock.elapsedRealtime()))
    record("screening-candidate")
    handler.removeCallbacks(expiry)
    handler.postDelayed(expiry, 120_000)
    publish()
    // No automatic overlay: missing subscription/session identity and participation evidence.
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
