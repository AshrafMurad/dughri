package expo.modules.dughricallengine

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context

object ScreeningRole {
  fun status(context: Context): String {
    val roles = context.getSystemService(RoleManager::class.java) ?: return "unsupported"
    return when {
      !roles.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING) -> "unsupported"
      roles.isRoleHeld(RoleManager.ROLE_CALL_SCREENING) -> "granted"
      else -> "not-granted"
    }
  }

  fun request(activity: Activity): String {
    if (status(activity) != "not-granted") return status(activity)
    activity.startActivityForResult(
      activity.getSystemService(RoleManager::class.java)
        .createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING), 4100
    )
    return "requested"
  }
}
