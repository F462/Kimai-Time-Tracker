package com.github.f462.kimaitimetracker

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import java.util.Calendar

class TimesheetWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    updateWidgets(context, manager, ids)
  }

  companion object {
    const val PREFERENCES_NAME = "timesheet_widget"

    fun updateWidgets(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val preferences = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
      val workedSeconds = preferences.getInt("workedSeconds", 0).coerceAtLeast(0)
      val active = preferences.getBoolean("active", false)
      val activeBeginAt = preferences.getLong("activeBeginAt", 0)
      val snapshotAt = preferences.getLong("snapshotAt", 0)
      val primaryContainer = preferences.getString("primaryContainer", "#99FA7A") ?: "#99FA7A"
      val parsedColor = runCatching { Color.parseColor(primaryContainer) }.getOrDefault(Color.rgb(153, 250, 122))
      val backgroundColor = Color.argb(128, Color.red(parsedColor), Color.green(parsedColor), Color.blue(parsedColor))
      val now = System.currentTimeMillis()
      val snapshotIsToday = isToday(snapshotAt, now)
      val activeStartedToday = isToday(activeBeginAt, now)
      val displayedSeconds = if (snapshotIsToday) {
        workedSeconds + if (active && activeStartedToday) ((now - snapshotAt) / 1000L).toInt().coerceAtLeast(0) else 0
      } else {
        0
      }

      ids.forEach { widgetId ->
        val views = RemoteViews(context.packageName, R.layout.timesheet_widget)
        views.setInt(R.id.widget_root, "setBackgroundColor", backgroundColor)
        views.setViewVisibility(R.id.chronometer, if (active) View.VISIBLE else View.GONE)
        views.setViewVisibility(R.id.static_duration, if (active) View.GONE else View.VISIBLE)
        if (active) {
          views.setChronometer(
            R.id.chronometer,
            SystemClock.elapsedRealtime() - displayedSeconds * 1000L,
            "%s",
            true,
          )
        } else {
          views.setTextViewText(R.id.static_duration, formatDuration(displayedSeconds))
        }

        val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse("kimai://active-timesheet"), context, MainActivity::class.java)
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val pendingIntent = PendingIntent.getActivity(
          context,
          1,
          intent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
        manager.updateAppWidget(widgetId, views)
      }
    }

    private fun formatDuration(seconds: Int): String =
      "%02d:%02d:%02d".format(seconds / 3600, (seconds % 3600) / 60, seconds % 60)

    private fun isToday(timestamp: Long, now: Long): Boolean {
      if (timestamp <= 0) return false
      val timestampDate = Calendar.getInstance().apply { timeInMillis = timestamp }
      val currentDate = Calendar.getInstance().apply { timeInMillis = now }
      return timestampDate.get(Calendar.YEAR) == currentDate.get(Calendar.YEAR) &&
        timestampDate.get(Calendar.DAY_OF_YEAR) == currentDate.get(Calendar.DAY_OF_YEAR)
    }
  }
}