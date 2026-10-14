
package expo.modules.autogamer

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AutoGamerModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("AutoGamer")

    // List launchable apps installed on the device.
    AsyncFunction("getInstalledGames") {
      val context = appContext.reactContext
        ?: throw Exception("Android context is unavailable")

      val pm = context.packageManager
      val intent = Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
      }

      val activities = if (Build.VERSION.SDK_INT >= 33) {
        pm.queryIntentActivities(
          intent,
          PackageManager.ResolveInfoFlags.of(0)
        )
      } else {
        @Suppress("DEPRECATION")
        pm.queryIntentActivities(intent, 0)
      }

      activities
        .filter { it.activityInfo.packageName != context.packageName }
        .distinctBy { it.activityInfo.packageName }
        .mapNotNull { info ->
          val appInfo = info.activityInfo.applicationInfo
          val launchIntent =
            pm.getLaunchIntentForPackage(appInfo.packageName)

          if (launchIntent == null) {
            null
          } else {
            mapOf(
              "name" to pm.getApplicationLabel(appInfo).toString(),
              "packageName" to appInfo.packageName
            )
          }
        }
        .sortedBy { it["name"].toString().lowercase() }
    }

    // Launch a selected installed app.
    AsyncFunction("launchGame") { packageName: String ->
      val context = appContext.reactContext
        ?: throw Exception("Android context is unavailable")

      val launchIntent =
        context.packageManager.getLaunchIntentForPackage(packageName)
          ?: throw Exception("تعذّر العثور على اللعبة أو فتحها")

      launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(launchIntent)

      mapOf("success" to true)
    }

    // Open Android accessibility settings.
    Function("openAccessibilitySettings") {
      val context = appContext.reactContext
        ?: throw Exception("Android context is unavailable")

      context.startActivity(
        Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      )
    }

    Function("isAccessibilityServiceConnected") {
      AutoGamerAccessibilityService.instance != null
    }

    // Read accessible elements from the active screen.
    Function("readCurrentScreen") {
      val service = AutoGamerAccessibilityService.instance

      service?.readCurrentScreen() ?: mapOf(
        "success" to false,
        "message" to "Enable Auto Gamer accessibility service first",
        "packageName" to "",
        "elements" to emptyList<Map<String, Any>>(),
        "totalElements" to 0,
        "truncated" to false
      )
    }

    // Find accessible screen elements by text or description.
    Function("findScreenText") { query: String ->
      val service = AutoGamerAccessibilityService.instance
        ?: throw Exception("Enable accessibility service first")

      val screen = service.readCurrentScreen()
      val elements = screen["elements"] as? List<*>
        ?: emptyList<Any>()

      val normalized = query.trim().lowercase()

      if (normalized.isEmpty()) {
        emptyList<Map<String, Any>>()
      } else {
        elements.filterIsInstance<Map<*, *>>()
          .filter { element ->
            val text = element["text"]?.toString()
              ?.lowercase().orEmpty()
            val description = element["description"]?.toString()
              ?.lowercase().orEmpty()

            element["enabled"] == true &&
              (
                text.contains(normalized) ||
                description.contains(normalized)
              )
          }
          .map { element ->
            element.entries.associate {
              it.key.toString() to it.value
            }
          }
      }
    }

    // Execute a tap through the gesture engine.
    AsyncFunction("tap") { x: Double, y: Double ->
      val context = appContext.reactContext
        ?: throw Exception("Android context is unavailable")

      val metrics = context.resources.displayMetrics
      val result = AutoGamerEngine.tap(
        x.toFloat(),
        y.toFloat(),
        metrics.widthPixels,
        metrics.heightPixels
      )

      if (!result.success) {
        throw Exception(result.message)
      }

      result.success
    }

    // Execute a swipe through the gesture engine.
    AsyncFunction("swipe") {
        startX: Double,
        startY: Double,
        endX: Double,
        endY: Double,
        durationMs: Double ->
      val context = appContext.reactContext
        ?: throw Exception("Android context is unavailable")

      val metrics = context.resources.displayMetrics
      val result = AutoGamerEngine.swipe(
        startX.toFloat(),
        startY.toFloat(),
        endX.toFloat(),
        endY.toFloat(),
        metrics.widthPixels,
        metrics.heightPixels,
        durationMs.toLong()
      )

      if (!result.success) {
        throw Exception(result.message)
      }

      result.success
    }
  }
}
