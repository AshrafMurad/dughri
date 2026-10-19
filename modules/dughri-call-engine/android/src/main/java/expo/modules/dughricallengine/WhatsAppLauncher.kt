package expo.modules.dughricallengine

import android.content.Context
import android.content.Intent
import androidx.core.net.toUri

object WhatsAppLauncher {
  fun installed(context: Context, name: String): Boolean = try {
    context.packageManager.getApplicationInfo(name, 0).enabled
  } catch (_: android.content.pm.PackageManager.NameNotFoundException) { false }

  fun open(context: Context, raw: String, business: Boolean): String {
    val number = PhoneNumbers.normalize(raw) ?: return "number-invalid"
    val name = if (business) "com.whatsapp.w4b" else "com.whatsapp"
    if (!installed(context, name)) return "whatsapp-unavailable"
    val intent = Intent(Intent.ACTION_VIEW, "https://wa.me/${number.drop(1)}".toUri())
      .setPackage(name).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return try {
      context.startActivity(intent)
      "intent-dispatched" // Not proof of target resolution, registration or delivery.
    } catch (_: android.content.ActivityNotFoundException) { "whatsapp-unavailable" }
      catch (_: SecurityException) { "launch-denied" }
  }
}
