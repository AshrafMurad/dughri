package expo.modules.dughricallengine

import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.PixelFormat
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout

class OverlayController(
  private val context: Context,
  private val allowed: () -> Boolean,
  private val changed: (String) -> Unit
) {
  private val windows = context.getSystemService(WindowManager::class.java)
  private val handler = Handler(Looper.getMainLooper())
  private var view: LinearLayout? = null
  private var expires = 0L
  private var receiverRegistered = false
  private val screenOff = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) { dismiss("device-locked") }
  }
  private val check = object : Runnable {
    override fun run() {
      if (view == null) return
      when {
        !allowed() -> dismiss("idle-required")
        !Settings.canDrawOverlays(context) -> dismiss("needs-permission")
        locked() -> dismiss("device-locked")
        SystemClock.elapsedRealtime() >= expires -> dismiss("expired")
        else -> handler.postDelayed(this, 200)
      }
    }
  }
  fun locked(): Boolean = context.getSystemService(KeyguardManager::class.java).isKeyguardLocked ||
    !context.getSystemService(PowerManager::class.java).isInteractive

  /** Isolated manual P0-C/E probe only; never called by a call-state callback. */
  fun showProbe(number: String, business: Boolean, ar: Boolean): String {
    dismiss("dismissed")
    if (!Settings.canDrawOverlays(context)) return "needs-permission"
    if (locked()) return "device-locked"
    if (!allowed()) return "idle-required"
    val canonical = PhoneNumbers.normalize(number) ?: return "number-invalid"
    val root = LinearLayout(context)
    root.orientation = LinearLayout.HORIZONTAL
    root.setBackgroundColor(0xffeeeeee.toInt())
    val open = Button(context).apply {
      text = context.getString(if (ar) R.string.probe_open_ar else R.string.probe_open_en)
      minHeight = (48 * resources.displayMetrics.density).toInt()
      setOnClickListener {
        if (locked() || !Settings.canDrawOverlays(context) || !allowed()) {
          dismiss("device-locked")
        } else {
          dismiss("dismissed")
          changed(WhatsAppLauncher.open(context, canonical, business))
        }
      }
    }
    root.addView(open)
    root.addView(Button(context).apply {
      text = context.getString(if (ar) R.string.dismiss_ar else R.string.dismiss_en)
      minHeight = (48 * resources.displayMetrics.density).toInt()
      setOnClickListener { dismiss("dismissed") }
    })
    return try {
      val flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_SECURE
      val params = WindowManager.LayoutParams(
        WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY, flags, PixelFormat.TRANSLUCENT
      )
      params.gravity = Gravity.CENTER_VERTICAL or Gravity.END
      windows.addView(root, params)
      view = root
      expires = SystemClock.elapsedRealtime() + 15_000
      context.registerReceiver(screenOff, IntentFilter(Intent.ACTION_SCREEN_OFF), Context.RECEIVER_NOT_EXPORTED)
      receiverRegistered = true
      handler.post(check)
      changed("probe-visible")
      "probe-visible"
    } catch (_: RuntimeException) {
      dismiss("overlay-error")
      "overlay-error"
    }
  }
  fun dismiss(reason: String) {
    handler.removeCallbacks(check)
    view?.let { try { windows.removeViewImmediate(it) } catch (_: RuntimeException) { } }
    view = null
    if (receiverRegistered) {
      context.unregisterReceiver(screenOff)
      receiverRegistered = false
    }
    changed(reason)
  }
}
