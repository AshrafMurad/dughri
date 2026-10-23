package expo.modules.dughricallengine

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.PhoneStateListener
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager

class CallStateObserver(private val context: Context, private val changed: (String) -> Unit) {
  private val manager = context.getSystemService(TelephonyManager::class.java)
  private var registered = false
  private var modern = false

  private fun name(state: Int) = when (state) {
    TelephonyManager.CALL_STATE_IDLE -> "idle"
    TelephonyManager.CALL_STATE_RINGING -> "ringing"
    TelephonyManager.CALL_STATE_OFFHOOK -> "offhook"
    else -> "unknown"
  }

  // lazy is load-bearing: TelephonyCallback exists only on API 31+, and an
  // eager field initializer loads the class on API 26–30 (NoClassDefFoundError
  // at construction). First access happens only inside the S+ branches.
  private val modernCallback by lazy {
    object : TelephonyCallback(), TelephonyCallback.CallStateListener {
      override fun onCallStateChanged(state: Int) = changed(name(state))
    }
  }

  // API 26–30 fallback: state-only PhoneStateListener; the number argument is
  // empty without READ_CALL_LOG and is intentionally ignored.
  @Suppress("DEPRECATION")
  private val legacyCallback = object : PhoneStateListener() {
    @Deprecated("Deprecated in Java")
    override fun onCallStateChanged(state: Int, phoneNumber: String?) = changed(name(state))
  }

  fun start(): String {
    if (registered) return "registered"
    if (context.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
      return "needs-permission"
    }
    if (manager == null) return "unsupported"
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        // Default subscription only. No claim of dual-SIM session attribution.
        manager.registerTelephonyCallback(context.mainExecutor, modernCallback)
        modern = true
      } else {
        manager.listen(legacyCallback, PhoneStateListener.LISTEN_CALL_STATE)
        modern = false
      }
      registered = true
      "registered"
    } catch (_: SecurityException) { "needs-permission" }
      catch (_: RuntimeException) { "observer-error" }
  }

  fun stop() {
    if (registered) {
      try {
        if (modern) manager?.unregisterTelephonyCallback(modernCallback)
        else manager?.listen(legacyCallback, PhoneStateListener.LISTEN_NONE)
      } catch (_: RuntimeException) { }
    }
    registered = false
  }
}
