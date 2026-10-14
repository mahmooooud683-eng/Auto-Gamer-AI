
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

      val packageManager = context.packageManager
      val intent = Intent(Intent.ACTION_MAIN).apply {
        addCategory(Intent.CATEGORY_LAUNCHER)
      }

      val activities = if (Build.VERSION.SDK_INT >= 33) {
        packageManager.queryIntentActivities(
          intent,
          PackageManager.ResolveInfoFlags.of(0)
        )
      } else {
        @Suppress("DEPRECATION")
        packageManager.queryIntentActivities(intent, 0)
      }

      activities
        .filter { it.activityInfo.packageName != context.packageName }
        .distinctBy { it.activityInfo.packageName }
        .mapNotNull { info ->
          val appInfo = info.activityInfo.applicationInfo
          val launchIntent =
            packageManager.getLaunchIntentForPackage(appInfo.packageName)

          if (launchIntent == null) {
            null
          } else {
            mapOf(
              "name" to packageManager.getApplicationLabel(appInfo).toString(),
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
  }
}
