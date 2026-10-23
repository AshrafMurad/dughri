package expo.modules.dughricallengine

import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.PixelFormat
import android.os.Build
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

  /** Isolated manual P0-C/E probe only; never called by a call-state callback.
   * Showcase card: white rounded surface, app row, heading, number, green CTA. */
  fun showProbe(number: String, business: Boolean, ar: Boolean): String {
    dismiss("dismissed")
    if (!Settings.canDrawOverlays(context)) return "needs-permission"
    if (locked()) return "device-locked"
    if (!allowed()) return "idle-required"
    val canonical = PhoneNumbers.normalize(number) ?: return "number-invalid"
    val density = context.resources.displayMetrics.density
    fun dp(value: Int) = (value * density).toInt()
    fun text(sizeSp: Float, color: Int, bold: Boolean) = android.widget.TextView(context).apply {
      textSize = sizeSp
      setTextColor(color)
      if (bold) paint.isFakeBoldText = true
    }
    val card = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      background = android.graphics.drawable.GradientDrawable().apply {
        setColor(0xFFFFFFFF.toInt())
        cornerRadius = dp(22).toFloat()
      }
      elevation = dp(10).toFloat()
      setPadding(dp(20), dp(16), dp(20), dp(20))
      layoutDirection = if (ar) android.view.View.LAYOUT_DIRECTION_RTL else android.view.View.LAYOUT_DIRECTION_LTR
    }
    val topRow = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = android.view.Gravity.CENTER_VERTICAL
      setPadding(0, 0, 0, dp(12))
    }
    try {
      val icon = android.widget.ImageView(context)
      icon.setImageDrawable(context.packageManager.getApplicationIcon(context.packageName))
      icon.layoutParams = LinearLayout.LayoutParams(dp(28), dp(28))
      topRow.addView(icon)
      val spacer = android.view.View(context)
      spacer.layoutParams = LinearLayout.LayoutParams(dp(10), 1)
      topRow.addView(spacer)
    } catch (_: RuntimeException) { /* icon is decorative; the card works without it */ }
    topRow.addView(text(16f, 0xFF101816.toInt(), true).apply {
      text = context.getString(if (ar) R.string.card_name_ar else R.string.card_name_en)
      layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
    })
    topRow.addView(text(18f, 0xFF727A77.toInt(), false).apply {
      text = "✕"
      contentDescription = context.getString(if (ar) R.string.dismiss_ar else R.string.dismiss_en)
      setPadding(dp(8), dp(8), dp(8), dp(8))
      setOnClickListener { dismiss("dismissed") }
    })
    card.addView(topRow)
    card.addView(text(16f, 0xFF101816.toInt(), true).apply {
      text = context.getString(if (ar) R.string.card_title_ar else R.string.card_title_en)
      setPadding(0, 0, 0, dp(2))
    })
    card.addView(text(16f, 0xFF727A77.toInt(), false).apply {
      text = canonical
      layoutDirection = android.view.View.LAYOUT_DIRECTION_LTR
      setPadding(0, 0, 0, dp(14))
    })
    val open = android.widget.Button(context).apply {
      text = context.getString(if (ar) R.string.card_cta_ar else R.string.card_cta_en)
      setTextColor(0xFFFFFFFF.toInt())
      textSize = 15f
      isAllCaps = false
      minHeight = dp(50)
      background = android.graphics.drawable.GradientDrawable().apply {
        setColor(0xFF0B8F69.toInt())
        cornerRadius = dp(12).toFloat()
      }
      setOnClickListener {
        if (locked() || !Settings.canDrawOverlays(context) || !allowed()) {
          dismiss("device-locked")
        } else {
          dismiss("dismissed")
          changed(WhatsAppLauncher.open(context, canonical, business))
        }
      }
    }
    card.addView(open, LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT))
    return try {
      val flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_SECURE
      val params = WindowManager.LayoutParams(dp(300), WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY, flags, PixelFormat.TRANSLUCENT)
      params.gravity = Gravity.CENTER
      windows.addView(card, params)
      view = card
      expires = SystemClock.elapsedRealtime() + 15_000
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        context.registerReceiver(screenOff, IntentFilter(Intent.ACTION_SCREEN_OFF), Context.RECEIVER_NOT_EXPORTED)
      } else {
        context.registerReceiver(screenOff, IntentFilter(Intent.ACTION_SCREEN_OFF))
      }
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
