package com.github.f462.kimaitimetracker

import android.appwidget.AppWidgetManager
import android.app.Activity
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.DocumentsContract
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.io.File
import java.io.IOException

class WidgetBridgeModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context), ActivityEventListener {
  private var backupPromise: Promise? = null
  private var importPromise: Promise? = null

  init {
    context.addActivityEventListener(this)
  }

  override fun getName() = "WidgetBridge"

  @ReactMethod
  fun publishState(state: ReadableMap) {
    val preferences = reactApplicationContext.getSharedPreferences(
      TimesheetWidgetProvider.PREFERENCES_NAME,
      Context.MODE_PRIVATE,
    )
    preferences.edit()
      .putInt("workedSeconds", state.getInt("workedSeconds"))
      .putBoolean("active", state.getBoolean("active"))
      .putLong("activeBeginAt", state.getDouble("activeBeginAt").toLong())
      .putLong("snapshotAt", state.getDouble("snapshotAt").toLong())
      .putString("primaryContainer", state.getString("primaryContainer"))
      .putString("projectName", state.getString("projectName"))
      .putString("activityName", state.getString("activityName"))
      .apply()

    val manager = AppWidgetManager.getInstance(reactApplicationContext)
    val component = ComponentName(reactApplicationContext, TimesheetWidgetProvider::class.java)
    TimesheetWidgetProvider.updateWidgets(reactApplicationContext, manager, manager.getAppWidgetIds(component))
  }

  @ReactMethod
  fun getBackupFolder(promise: Promise) {
    promise.resolve(backupFolderUri() != null)
  }

  @ReactMethod
  fun getBackupFolderPath(promise: Promise) {
    promise.resolve(backupFolderUri()?.let(::backupFolderPath))
  }

  @ReactMethod
  fun chooseBackupFolder(promise: Promise) {
    if (backupPromise != null || importPromise != null) {
      promise.reject("E_BACKUP_IN_PROGRESS", "A backup operation is already in progress")
      return
    }

    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No activity is available to save the backup")
      return
    }

    backupPromise = promise
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
      addFlags(
        Intent.FLAG_GRANT_READ_URI_PERMISSION or
          Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
          Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION,
      )
    }
    try {
      activity.startActivityForResult(intent, BACKUP_FOLDER_REQUEST_CODE)
    } catch (error: Exception) {
      backupPromise = null
      promise.reject("E_BACKUP_PICKER", "Could not open the backup destination picker", error)
    }
  }

  @ReactMethod
  fun chooseBackupFile(promise: Promise) {
    if (backupPromise != null || importPromise != null) {
      promise.reject("E_BACKUP_IN_PROGRESS", "A backup operation is already in progress")
      return
    }

    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No activity is available to open a backup")
      return
    }

    importPromise = promise
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
      addCategory(Intent.CATEGORY_OPENABLE)
      type = "application/json"
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    try {
      activity.startActivityForResult(intent, BACKUP_FILE_REQUEST_CODE)
    } catch (error: Exception) {
      importPromise = null
      promise.reject("E_BACKUP_PICKER", "Could not open the backup file picker", error)
    }
  }

  @ReactMethod
  fun saveBackup(contents: String, fileName: String, promise: Promise) {
    val folderUri = backupFolderUri()
    if (folderUri == null) {
      promise.reject("E_NO_BACKUP_FOLDER", "Choose a backup folder first")
      return
    }

    try {
      val existingDocument = findBackupDocument(folderUri, fileName)
      val destinationUri = existingDocument ?: DocumentsContract.createDocument(
        reactApplicationContext.contentResolver,
        DocumentsContract.buildDocumentUriUsingTree(
          folderUri,
          DocumentsContract.getTreeDocumentId(folderUri),
        ),
        "application/json",
        fileName,
      ) ?: throw IOException("Could not create the backup file")
      val output = reactApplicationContext.contentResolver.openOutputStream(destinationUri, "wt")
        ?: throw IOException("Could not open the backup file")
      output.use { it.write(contents.toByteArray(Charsets.UTF_8)) }
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject(
        "E_BACKUP_WRITE",
        "Could not write the backup: ${error.message ?: error.javaClass.simpleName}",
        error,
      )
    }
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode == BACKUP_FILE_REQUEST_CODE) {
      val promise = importPromise ?: return
      importPromise = null
      val uri = data?.data
      if (resultCode != Activity.RESULT_OK || uri == null) {
        promise.resolve(null)
        return
      }

      try {
        val contents = reactApplicationContext.contentResolver.openInputStream(uri)
          ?.bufferedReader(Charsets.UTF_8)
          ?.use { it.readText() }
          ?: throw IOException("Could not read the selected backup file")
        promise.resolve(contents)
      } catch (error: Exception) {
        promise.reject("E_BACKUP_READ", "Could not read the selected backup file", error)
      }
      return
    }
    if (requestCode != BACKUP_FOLDER_REQUEST_CODE) return

    val promise = backupPromise ?: return
    backupPromise = null
    val uri = data?.data
    if (resultCode != Activity.RESULT_OK || uri == null) {
      promise.resolve(false)
      return
    }

    try {
      val flags = data.flags and (Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
      reactApplicationContext.contentResolver.takePersistableUriPermission(uri, flags)
      reactApplicationContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
        .edit()
        .putString(BACKUP_FOLDER_URI_KEY, uri.toString())
        .apply()
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("E_BACKUP_FOLDER", "Could not remember the selected backup folder", error)
    }
  }

  override fun onNewIntent(intent: Intent) = Unit

  private fun backupFolderUri(): Uri? = reactApplicationContext
    .getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
    .getString(BACKUP_FOLDER_URI_KEY, null)
    ?.let(Uri::parse)

  private fun backupFolderPath(folderUri: Uri): String {
    val documentId = DocumentsContract.getTreeDocumentId(folderUri)
    val separator = documentId.indexOf(':')
    if (separator < 0) return folderUri.toString()

    val volumeId = documentId.substring(0, separator)
    val relativePath = documentId.substring(separator + 1)
    val volumePath = if (volumeId.equals("primary", ignoreCase = true)) {
      Environment.getExternalStorageDirectory().absolutePath
    } else {
      File("/storage", volumeId).absolutePath
    }
    return File(volumePath, relativePath).absolutePath
  }

  private fun findBackupDocument(folderUri: Uri, fileName: String): Uri? = try {
    val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(
      folderUri,
      DocumentsContract.getTreeDocumentId(folderUri),
    )
    val projection = arrayOf(
      DocumentsContract.Document.COLUMN_DOCUMENT_ID,
      DocumentsContract.Document.COLUMN_DISPLAY_NAME,
    )
    reactApplicationContext.contentResolver.query(childrenUri, projection, null, null, null)?.use { cursor ->
      val idIndex = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_DOCUMENT_ID)
      val nameIndex = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_DISPLAY_NAME)
      if (idIndex < 0 || nameIndex < 0) {
        return@use null
      }

      var existingUri: Uri? = null
      while (cursor.moveToNext()) {
        if (cursor.getString(nameIndex) == fileName) {
          existingUri = DocumentsContract.buildDocumentUriUsingTree(folderUri, cursor.getString(idIndex))
          break
        }
      }
      existingUri
    }
  } catch (error: Exception) {
    Log.w(TAG, "Could not list the backup folder; creating a new backup document", error)
    null
  }

  companion object {
    private const val TAG = "WidgetBridge"
    private const val BACKUP_FOLDER_REQUEST_CODE = 7301
    private const val BACKUP_FILE_REQUEST_CODE = 7302
    private const val PREFERENCES_NAME = "kimai-time-tracker"
    private const val BACKUP_FOLDER_URI_KEY = "backupFolderUri"
  }
}