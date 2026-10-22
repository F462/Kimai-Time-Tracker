package com.github.f462.kimaitimetracker

import android.app.Activity
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter

class SharedFolderStorageModule(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context), ActivityEventListener {

  private var pickerPromise: Promise? = null
  private val requestCode = 7314

  init {
    context.addActivityEventListener(this)
  }

  override fun getName() = "SharedFolderStorage"

  @ReactMethod
  fun pickFolder(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No activity is available to open the folder picker")
      return
    }
    if (pickerPromise != null) {
      promise.reject("E_PICKER_ACTIVE", "A folder picker is already open")
      return
    }

    pickerPromise = promise
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
    intent.addFlags(
      Intent.FLAG_GRANT_READ_URI_PERMISSION or
        Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
        Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION,
    )
    try {
      activity.startActivityForResult(intent, requestCode)
    } catch (error: Exception) {
      pickerPromise = null
      promise.reject("E_PICKER", "Unable to open the folder picker", error)
    }
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != this.requestCode) return
    val promise = pickerPromise ?: return
    pickerPromise = null
    val uri = data?.data
    if (resultCode != Activity.RESULT_OK || uri == null) {
      promise.reject("E_CANCELLED", "Folder selection was cancelled")
      return
    }

    val persistableFlag = Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
    val accessFlags = data.flags and
      (Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
    if (data.flags and persistableFlag == 0) {
      promise.reject(
        "E_PERSIST_PERMISSION_UNSUPPORTED",
        "This folder provider does not grant access that can be kept after the app closes. Choose a folder from device storage or another provider.",
      )
      return
    }
    if (accessFlags and Intent.FLAG_GRANT_WRITE_URI_PERMISSION == 0) {
      promise.reject(
        "E_WRITE_PERMISSION_MISSING",
        "The selected folder is read-only. Choose a folder that allows writing.",
      )
      return
    }

    try {
      reactApplicationContext.contentResolver.takePersistableUriPermission(uri, accessFlags)
      val permissionWasPersisted = reactApplicationContext.contentResolver
        .persistedUriPermissions
        .any { it.uri == uri && it.isWritePermission }
      if (!permissionWasPersisted) {
        promise.reject(
          "E_PERSIST_PERMISSION_UNSUPPORTED",
          "The folder provider did not retain write access. Choose a folder from device storage or another provider.",
        )
        return
      }

      val result = Arguments.createMap().apply {
        putString("uri", uri.toString())
        putString("name", queryDisplayName(uri) ?: "Shared folder")
      }
      promise.resolve(result)
    } catch (error: UnsupportedOperationException) {
      promise.reject(
        "E_PERSIST_PERMISSION_UNSUPPORTED",
        "This folder provider does not support access that can be kept after the app closes. Choose a folder from device storage or another provider.",
        error,
      )
    } catch (error: Exception) {
      promise.reject("E_FOLDER_PERMISSION", "Unable to retain access to the selected folder", error)
    }
  }

  override fun onNewIntent(intent: Intent) = Unit

  @ReactMethod
  fun releaseFolder(uriString: String, promise: Promise) {
    try {
      reactApplicationContext.contentResolver.releasePersistableUriPermission(
        Uri.parse(uriString),
        Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION,
      )
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("E_FOLDER_PERMISSION", "Unable to release folder access", error)
    }
  }

  @ReactMethod
  fun exists(uriString: String, name: String, promise: Promise) {
    try {
      promise.resolve(findFile(Uri.parse(uriString), name) != null)
    } catch (error: Exception) {
      promise.reject("E_FOLDER_READ", "Unable to inspect the selected folder", error)
    }
  }

  @ReactMethod
  fun readFile(uriString: String, name: String, promise: Promise) {
    try {
      val root = Uri.parse(uriString)
      val file = findFile(root, name)
        ?: throw IllegalStateException("The persisted data file does not exist")
      val input = reactApplicationContext.contentResolver.openInputStream(file)
        ?: throw IllegalStateException("Unable to open the persisted data file")
      val value = BufferedReader(InputStreamReader(input, Charsets.UTF_8)).use { it.readText() }
      promise.resolve(value)
    } catch (error: Exception) {
      promise.reject("E_FOLDER_READ", "Unable to read the persisted data file", error)
    }
  }

  @ReactMethod
  fun writeFile(uriString: String, name: String, value: String, promise: Promise) {
    try {
      val root = Uri.parse(uriString)
      val existing = findFile(root, name)
      val parent = DocumentsContract.buildDocumentUriUsingTree(
        root,
        DocumentsContract.getTreeDocumentId(root),
      )
      val target = existing ?: DocumentsContract.createDocument(
        reactApplicationContext.contentResolver,
        parent,
        "application/json",
        name,
      ) ?: throw IllegalStateException("The selected provider did not create the file")
      val output = reactApplicationContext.contentResolver.openOutputStream(target, "wt")
        ?: throw IllegalStateException("Unable to open the persisted data file")
      OutputStreamWriter(output, Charsets.UTF_8).use { it.write(value) }
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("E_FOLDER_WRITE", "Unable to write the persisted data file", error)
    }
  }

  @ReactMethod
  fun deleteFile(uriString: String, name: String, promise: Promise) {
    try {
      val file = findFile(Uri.parse(uriString), name)
      if (file != null && !DocumentsContract.deleteDocument(reactApplicationContext.contentResolver, file)) {
        throw IllegalStateException("The selected provider did not delete the file")
      }
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("E_FOLDER_DELETE", "Unable to delete the persisted data file", error)
    }
  }

  private fun findFile(treeUri: Uri, name: String): Uri? {
    val rootId = DocumentsContract.getTreeDocumentId(treeUri)
    val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, rootId)
    var cursor: Cursor? = null
    try {
      cursor = reactApplicationContext.contentResolver.query(
        childrenUri,
        arrayOf(DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME),
        null,
        null,
        null,
      )
      val idColumn = cursor?.getColumnIndex(DocumentsContract.Document.COLUMN_DOCUMENT_ID) ?: -1
      val nameColumn = cursor?.getColumnIndex(DocumentsContract.Document.COLUMN_DISPLAY_NAME) ?: -1
      while (cursor?.moveToNext() == true) {
        if (nameColumn >= 0 && cursor.getString(nameColumn) == name && idColumn >= 0) {
          return DocumentsContract.buildDocumentUriUsingTree(treeUri, cursor.getString(idColumn))
        }
      }
      return null
    } finally {
      cursor?.close()
    }
  }

  private fun queryDisplayName(uri: Uri): String? {
    reactApplicationContext.contentResolver.query(uri, null, null, null, null).use { cursor ->
      if (cursor?.moveToFirst() != true) return null
      val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
      return if (index >= 0) cursor.getString(index) else null
    }
  }
}