import SwiftUI
import WidgetKit

private let appGroup = "group.com.github.f462.kimaitimetracker"

struct TimesheetWidgetEntry: TimelineEntry {
  let date: Date
  let workedSeconds: Int
  let active: Bool
  let primaryContainer: String
  let projectName: String
  let activityName: String
}

struct TimesheetWidgetProvider: TimelineProvider {
  func placeholder(in context: Context) -> TimesheetWidgetEntry {
    TimesheetWidgetEntry(
      date: .now,
      workedSeconds: 0,
      active: false,
      primaryContainer: "#99FA7A",
      projectName: "",
      activityName: ""
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (TimesheetWidgetEntry) -> Void) {
    completion(makeEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<TimesheetWidgetEntry>) -> Void) {
    let entry = makeEntry()
    let refreshInterval: TimeInterval = entry.active ? 60 : 900
    completion(Timeline(entries: [entry], policy: .after(.now.addingTimeInterval(refreshInterval))))
  }

  private func makeEntry() -> TimesheetWidgetEntry {
    let state = UserDefaults(suiteName: appGroup)?.dictionary(forKey: "timesheetWidgetState") ?? [:]
    let now = Date.now
    let snapshotAt = Date(timeIntervalSince1970: (state["snapshotAt"] as? Double ?? 0) / 1000)
    let activeBeginAt = Date(timeIntervalSince1970: (state["activeBeginAt"] as? Double ?? 0) / 1000)
    let active = state["active"] as? Bool ?? false
    let snapshotIsToday = Calendar.current.isDateInToday(snapshotAt)
    let activeStartedToday = Calendar.current.isDateInToday(activeBeginAt)
    let workedSeconds = max(0, state["workedSeconds"] as? Int ?? 0)
    let elapsedSinceSnapshot = active && activeStartedToday && snapshotIsToday
      ? max(0, Int(now.timeIntervalSince(snapshotAt)))
      : 0
    let primaryContainer = state["primaryContainer"] as? String ?? "#99FA7A"
    let projectName = state["projectName"] as? String ?? ""
    let activityName = state["activityName"] as? String ?? ""
    return TimesheetWidgetEntry(
      date: now,
      workedSeconds: snapshotIsToday ? workedSeconds + elapsedSinceSnapshot : 0,
      active: active,
      primaryContainer: primaryContainer,
      projectName: projectName,
      activityName: activityName
    )
  }
}

struct TimesheetWidgetView: View {
  let entry: TimesheetWidgetEntry

  private var backgroundColor: Color {
    color(from: entry.primaryContainer)
  }

  private func color(from colorString: String) -> Color {
    let hex = colorString.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
    guard hex.count == 6, let value = UInt32(hex, radix: 16) else {
      return Color(red: 153.0 / 255, green: 250.0 / 255, blue: 122.0 / 255)
    }
    return Color(
      red: Double((value >> 16) & 0xff) / 255,
      green: Double((value >> 8) & 0xff) / 255,
      blue: Double(value & 0xff) / 255
    )
  }

  private var durationText: String {
    String(format: "%02d:%02d", entry.workedSeconds / 3600, (entry.workedSeconds % 3600) / 60)
  }

  private var projectActivityText: String {
    [entry.projectName, entry.activityName]
      .filter { !$0.isEmpty }
      .joined(separator: " · ")
  }

  var body: some View {
    Link(destination: URL(string: "kimai://active-timesheet")!) {
      VStack(alignment: .center, spacing: 2) {
        Text(durationText)
          .font(.system(size: 32, weight: .semibold, design: .rounded).monospacedDigit())
          .minimumScaleFactor(0.7)
          .lineLimit(1)
          .frame(maxWidth: .infinity, alignment: .center)
        if !projectActivityText.isEmpty {
          Text(projectActivityText)
            .font(.caption)
            .foregroundStyle(.secondary)
            .lineLimit(2)
            .minimumScaleFactor(0.8)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity, alignment: .center)
        }
      }
          .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
      .contentShape(Rectangle())
    }
    .accessibilityLabel("Open Active Timesheet")
    .padding(8)
    .containerBackground(backgroundColor.opacity(0.5), for: .widget)
  }
}

struct TimesheetWidget: Widget {
  let kind = "TimesheetWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: TimesheetWidgetProvider()) { entry in
      TimesheetWidgetView(entry: entry)
    }
    .configurationDisplayName("Kimai time")
    .description("Track today's worked time and control the active timesheet.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct TimesheetWidgetBundle: WidgetBundle {
  var body: some Widget {
    TimesheetWidget()
  }
}