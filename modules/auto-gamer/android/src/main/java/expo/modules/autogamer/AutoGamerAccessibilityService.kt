
package expo.modules.autogamer

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent

class AutoGamerAccessibilityService : AccessibilityService() {

  companion object {
    @Volatile
    var instance: AutoGamerAccessibilityService? = null
      private set
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    instance = this
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    // تُضاف معالجة أحداث الشاشة لاحقاً.
  }

  override fun onInterrupt() {
    // إيقاف أي إجراء جارٍ عند مقاطعة الخدمة.
  }

  override fun onDestroy() {
    if (instance === this) {
      instance = null
    }
    super.onDestroy()
  }

  fun tap(x: Float, y: Float): Boolean {
    val path = Path().apply {
      moveTo(x, y)
    }

    val gesture = GestureDescription.Builder()
      .addStroke(
        GestureDescription.StrokeDescription(path, 0, 100)
      )
      .build()

    return dispatchGesture(gesture, null, null)
  }

  fun swipe(
    startX: Float,
    startY: Float,
    endX: Float,
    endY: Float,
    durationMs: Long = 350
  ): Boolean {
    if (durationMs <= 0) return false

    val path = Path().apply {
      moveTo(startX, startY)
      lineTo(endX, endY)
    }

    val gesture = GestureDescription.Builder()
      .addStroke(
        GestureDescription.StrokeDescription(
          path,
          0,
          durationMs
        )
      )
      .build()

    return dispatchGesture(gesture, null, null)
  }
}
