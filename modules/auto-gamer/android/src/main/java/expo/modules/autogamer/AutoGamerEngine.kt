
package expo.modules.autogamer

import android.graphics.Path
import android.os.SystemClock
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Core gesture engine for Auto Gamer AI.
 *
 * Executes user-authorized accessibility gestures.
 * It does not independently understand game objectives.
 */
object AutoGamerEngine {

  private val busy = AtomicBoolean(false)

  data class Result(
    val success: Boolean,
    val message: String
  )

  fun isBusy(): Boolean = busy.get()

  fun tap(
    x: Float,
    y: Float,
    screenWidth: Int,
    screenHeight: Int
  ): Result {
    if (!validPoint(x, y, screenWidth, screenHeight)) {
      return Result(false, "Touch coordinates are outside the screen")
    }

    return executeGesture {
      val path = Path().apply {
        moveTo(x, y)
      }

      dispatch(path, 70L)
    }
  }

  fun swipe(
    startX: Float,
    startY: Float,
    endX: Float,
    endY: Float,
    screenWidth: Int,
    screenHeight: Int,
    durationMs: Long = 250L
  ): Result {
    if (
      !validPoint(startX, startY, screenWidth, screenHeight) ||
      !validPoint(endX, endY, screenWidth, screenHeight)
    ) {
      return Result(false, "Swipe coordinates are outside the screen")
    }

    if (durationMs !in 80L..3000L) {
      return Result(false, "Swipe duration must be 80–3000 ms")
    }

    return executeGesture {
      val path = Path().apply {
        moveTo(startX, startY)
        lineTo(endX, endY)
      }

      dispatch(path, durationMs)
    }
  }

  private fun validPoint(
    x: Float,
    y: Float,
    width: Int,
    height: Int
  ): Boolean {
    return x.isFinite() &&
      y.isFinite() &&
      width > 0 &&
      height > 0 &&
      x >= 0f &&
      y >= 0f &&
      x < width &&
      y < height
  }

  private inline fun executeGesture(
    action: () -> Result
  ): Result {
    if (!busy.compareAndSet(false, true)) {
      return Result(false, "A gesture is already running")
    }

    return try {
      action()
    } catch (e: Exception) {
      Result(false, e.message ?: "Gesture execution failed")
    } finally {
      busy.set(false)
    }
  }

  private fun dispatch(
    path: Path,
    durationMs: Long
  ): Result {
    val service = AutoGamerAccessibilityService.instance
      ?: return Result(
        false,
        "Enable Auto Gamer accessibility service first"
      )

    val gesture = android.accessibilityservice.GestureDescription
      .Builder()
      .addStroke(
        android.accessibilityservice.GestureDescription.StrokeDescription(
          path,
          0L,
          durationMs
        )
      )
      .build()

    val accepted = service.dispatchGesture(
      gesture,
      null,
      android.os.Handler(
        android.os.Looper.getMainLooper()
      )
    )

    SystemClock.uptimeMillis()

    return if (accepted) {
      Result(true, "Gesture submitted")
    } else {
      Result(false, "Android rejected the gesture")
    }
  }
}
