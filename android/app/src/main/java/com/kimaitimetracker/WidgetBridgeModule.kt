package com.github.f462.kimaitimetracker

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class WidgetBridgeModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
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
      .apply()

    val manager = AppWidgetManager.getInstance(reactApplicationContext)
    val component = ComponentName(reactApplicationContext, TimesheetWidgetProvider::class.java)
    TimesheetWidgetProvider.updateWidgets(reactApplicationContext, manager, manager.getAppWidgetIds(component))
  }
}