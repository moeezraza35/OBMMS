package dev.moeezraza.obmms

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File

class AppUpdateModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppUpdateModule"
    }

    @ReactMethod
    fun canRequestPackageInstalls(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val canInstall = reactContext.packageManager.canRequestPackageInstalls()
                promise.resolve(canInstall)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openInstallPermissionSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                data = Uri.parse("package:${reactContext.packageName}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun downloadAndInstallApk(
        downloadUrl: String,
        fileName: String,
        promise: Promise
    ) {
        try {
            val safeFileName = if (fileName.endsWith(".apk")) fileName else "$fileName.apk"
            val downloadDir = reactContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: reactContext.cacheDir

            val targetFile = File(downloadDir, safeFileName)
            if (targetFile.exists()) {
                targetFile.delete()
            }

            val request = DownloadManager.Request(Uri.parse(downloadUrl)).apply {
                setTitle("OBMMS Update")
                setDescription("Downloading latest version of OBMMS...")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationUri(Uri.fromFile(targetFile))
                setAllowedOverMetered(true)
                setAllowedOverRoaming(true)
            }

            val downloadManager =
                reactContext.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val downloadId = downloadManager.enqueue(request)

            // Register BroadcastReceiver to catch download completion
            val onCompleteReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) ?: -1
                    if (id == downloadId) {
                        try {
                            reactContext.unregisterReceiver(this)
                        } catch (e: Exception) {
                            // Already unregistered
                        }

                        // Trigger installation
                        try {
                            installApk(targetFile)
                            promise.resolve("DOWNLOAD_AND_INSTALL_TRIGGERED")
                        } catch (e: Exception) {
                            promise.reject("INSTALL_ERROR", "Failed to launch installer: ${e.message}", e)
                        }
                    }
                }
            }

            val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactContext.registerReceiver(
                    onCompleteReceiver,
                    filter,
                    Context.RECEIVER_EXPORTED
                )
            } else {
                reactContext.registerReceiver(onCompleteReceiver, filter)
            }

        } catch (e: Exception) {
            promise.reject("DOWNLOAD_ERROR", "Error enqueuing download: ${e.message}", e)
        }
    }

    private fun installApk(file: File) {
        val apkUri = FileProvider.getUriForFile(
            reactContext,
            "${reactContext.packageName}.fileprovider",
            file
        )

        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
        }

        reactContext.startActivity(installIntent)
    }
}
