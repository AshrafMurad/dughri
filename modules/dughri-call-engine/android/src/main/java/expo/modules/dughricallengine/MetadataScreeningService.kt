package expo.modules.dughricallengine

import android.telecom.Call
import android.telecom.CallScreeningService

class MetadataScreeningService : CallScreeningService() {
  override fun onScreenCall(details: Call.Details) {
    // Respond FIRST: no parser, bridge, network, disk or initialization on the deadline path.
    if (details.callDirection == Call.Details.DIRECTION_INCOMING) {
      respondToCall(details, CallResponse.Builder().build())
    }
    // Never log Call.Details, its handle, or exceptions containing the raw handle.
    ProbeRuntime.get(applicationContext).metadata(details)
  }
}
