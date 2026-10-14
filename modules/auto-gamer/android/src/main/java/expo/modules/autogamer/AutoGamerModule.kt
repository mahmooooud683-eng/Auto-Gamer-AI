
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
