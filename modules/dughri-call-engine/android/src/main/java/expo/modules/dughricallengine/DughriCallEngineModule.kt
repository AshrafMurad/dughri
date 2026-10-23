package expo.modules.dughricallengine

import android.content.Intent
import android.provider.Settings
import androidx.core.net.toUri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.functions.Queues

class DughriCallEngineModule : Module() {
  private var engine: ProbeRuntime? = null
  private fun runtime() = requireNotNull(engine)

  override fun definition() = ModuleDefinition {
    Name("DughriCallEngine")
    Events("diagnosticsChanged")
    OnCreate {
      engine = ProbeRuntime.get(requireNotNull(appContext.reactContext))
      runtime().listener = { sendEvent("diagnosticsChanged", it) }
    }
    OnDestroy {
      runtime().listener = null
      // Destroying React must not leave a probe shortcut with an actionable private target.
      val current = engine
      if (current != null) android.os.Handler(android.os.Looper.getMainLooper()).post {
        current.stop()
      }
    }
    OnActivityEntersForeground { runtime().refresh() }
    AsyncFunction("getSnapshot") { runtime().snapshot() }.runOnQueue(Queues.MAIN)
    AsyncFunction("getArabic") { runtime().arabic() }.runOnQueue(Queues.MAIN)
    // Shell preferences only: separate storage, no probe state or phone data.
    AsyncFunction("getAppPreferences") {
      val context = requireNotNull(appContext.reactContext)
      val stored = context.getSharedPreferences("app-shell", android.content.Context.MODE_PRIVATE)
        .getString("preferences", null)
      val legacy = context.getSharedPreferences("phase0", android.content.Context.MODE_PRIVATE)
      stored ?: org.json.JSONObject().put("schemaVersion", 1)
        .put("language", if (legacy.contains("arabic")) {
          if (legacy.getBoolean("arabic", false)) "ar" else "en"
        } else "system").put("welcomeSeen", false).toString()
    }
    AsyncFunction("setAppPreferences") { payload: String ->
      val context = requireNotNull(appContext.reactContext)
      // TS validates the full v2 schema before sending; Kotlin re-checks shape/version.
      val json = org.json.JSONObject(payload)
      check(json.getInt("schemaVersion") == 2) { "preferences-unsupported-version" }
      check(context.getSharedPreferences("app-shell", android.content.Context.MODE_PRIVATE)
        .edit().putString("preferences", json.toString()).commit()) { "preferences-save-failed" }
    }
    AsyncFunction("setArabic") { value: Boolean -> runtime().setLanguage(value) }.runOnQueue(Queues.MAIN)
    AsyncFunction("setEngineSettings") { enabled: Boolean, incoming: Boolean, outgoing: Boolean, business: Boolean, ar: Boolean, region: String? ->
      runtime().setEngine(enabled, incoming, outgoing, business, ar, region)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("startObservation") { runtime().start() }.runOnQueue(Queues.MAIN)
    AsyncFunction("stopObservation") { runtime().stop() }.runOnQueue(Queues.MAIN)
    AsyncFunction("requestScreeningRole") {
      val activity = requireNotNull(appContext.currentActivity)
      try { ScreeningRole.request(activity) } catch (_: RuntimeException) { "role-error" }
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("openOverlaySettings") {
      val activity = requireNotNull(appContext.currentActivity)
      try {
        activity.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          "package:${activity.packageName}".toUri()))
        "requested"
      } catch (_: RuntimeException) { "settings-error" }
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("dismissOverlay") { runtime().overlay.dismiss("dismissed") }.runOnQueue(Queues.MAIN)
    AsyncFunction("showOverlayProbe") { number: String, business: Boolean, ar: Boolean ->
      runtime().manualProbe(number, business, ar)
    }.runOnQueue(Queues.MAIN)
    AsyncFunction("launchWhatsAppTest") { number: String, business: Boolean ->
      val context = requireNotNull(appContext.currentActivity)
      if (runtime().overlay.locked()) "device-locked"
      else WhatsAppLauncher.open(context, number, business)
    }.runOnQueue(Queues.MAIN)
  }
}
