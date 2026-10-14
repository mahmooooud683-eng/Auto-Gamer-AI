
package expo.modules.autogamer

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
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

    Function("isAccessibilityServiceConnected") {
      AutoGamerAccessibilityService.instance != null
    }

    AsyncFunction("tap") { x: Double, y: Double ->
      val service = AutoGamerAccessibilityService.instance
        ?: throw Exception("فعّل خدمة التحكم من إعدادات إمكانية الوصول أولاً")

      service.tap(x.toFloat(), y.toFloat())
    }

    AsyncFunction("swipe") {
        startX: Double,
        startY: Double,
        endX: Double,
        endY: Double,
        durationMs: Double ->
      val service = AutoGamerAccessibilityService.instance
        ?: throw Exception("فعّل خدمة التحكم من إعدادات إمكانية الوصول أولاً")

      service.swipe(
        startX.toFloat(),
        startY.toFloat(),
        endX.toFloat(),
        endY.toFloat(),
        durationMs.toLong()
      )
    }
  }
}
