
package expo.modules.autogamer

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class AutoGamerAccessibilityService : AccessibilityService() {

  companion object {
    @Volatile
    var instance: AutoGamerAccessibilityService? = null
      private set
  }

  @Volatile
  private var lastEventPackage: String = ""

  override fun onServiceConnected() {
    super.onServiceConnected()
    instance = this
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    event ?: return

    event.packageName?.toString()?.let { packageName ->
      lastEventPackage = packageName
    }
  }

  override fun onInterrupt() {
    // Android interrupted the accessibility service.
  }

  override fun onDestroy() {
    if (instance === this) {
      instance = null
    }
    super.onDestroy()
  }

  fun readCurrentScreen(): Map<String, Any> {
    val root: AccessibilityNodeInfo? = rootInActiveWindow
    val packageName = root?.packageName?.toString()
      ?: lastEventPackage

    if (root == null) {
      return mapOf(
        "success" to false,
        "message" to "No accessible active window",
        "packageName" to packageName,
        "elements" to emptyList<Map<String, Any>>(),
        "totalElements" to 0,
        "truncated" to false
      )
    }

    return try {
      val snapshot = GameScreenAnalyzer.analyze(root, packageName)
      val result = snapshot.toMap().toMutableMap()
      result["success"] = true
      result["message"] = if (snapshot.elements.isEmpty()) {
        "No readable UI elements; visual analysis may be needed"
      } else {
        "Screen elements collected"
      }
      result
    } catch (error: Exception) {
      mapOf(
        "success" to false,
        "message" to (error.message ?: "Screen analysis failed"),
        "packageName" to packageName,
        "elements" to emptyList<Map<String, Any>>(),
        "totalElements" to 0,
        "truncated" to false
      )
    } finally {
      root.recycle()
    }
  }

  fun tap(x: Float, y: Float): Boolean {
    val path = Path().apply { moveTo(x, y) }
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
