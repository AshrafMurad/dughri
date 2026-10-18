package expo.modules.dughricallengine

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager

class CallStateObserver(private val context: Context, private val changed: (String) -> Unit) {
  private val manager = context.getSystemService(TelephonyManager::class.java)
  private var registered = false
  private val callback = object : TelephonyCallback(), TelephonyCallback.CallStateListener {
    override fun onCallStateChanged(state: Int) = changed(when (state) {
      TelephonyManager.CALL_STATE_IDLE -> "idle"
      TelephonyManager.CALL_STATE_RINGING -> "ringing"
      TelephonyManager.CALL_STATE_OFFHOOK -> "offhook"
      else -> "unknown"
    })
  }

  fun start(): String {
    if (registered) return "registered"
    if (context.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
      return "needs-permission"
    }
    if (manager == null) return "unsupported"
    return try {
      // Default subscription only. No claim of dual-SIM session attribution.
      manager.registerTelephonyCallback(context.mainExecutor, callback)
      registered = true
      "registered"
    } catch (_: SecurityException) { "needs-permission" }
      catch (_: RuntimeException) { "observer-error" }
  }

  fun stop() {
    if (registered) {
      try { manager?.unregisterTelephonyCallback(callback) } catch (_: RuntimeException) { }
    }
    registered = false
  }
}
