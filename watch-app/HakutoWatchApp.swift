import SwiftUI
import SwiftData
import WatchConnectivity

// MARK: - SwiftData Model

@Model
class RoundRecord {
  var id: String
  var place: String?
  var playedAt: Date
  var scores: [Int]
  var totalStrokes: Int
  var synced: Bool

  init(id: String, place: String?, playedAt: Date, scores: [Int], totalStrokes: Int, synced: Bool = false) {
    self.id = id
    self.place = place
    self.playedAt = playedAt
    self.scores = scores
    self.totalStrokes = totalStrokes
    self.synced = synced
  }

  var holeInOneCount: Int { scores.filter { $0 == 1 }.count }

  static func calculateTotalStrokes(_ scores: [Int]) -> Int {
    let raw = scores.reduce(0, +)
    let hio = scores.filter { $0 == 1 }.count
    return raw - 3 * hio
  }
}

// MARK: - Watch App Entry

@main
struct HakutoWatchApp: App {
  @StateObject private var watchManager = WatchManager()

  var body: some Scene {
    WindowGroup {
      RootView()
        .environmentObject(watchManager)
    }
    .modelContainer(for: RoundRecord.self)
  }
}

// MARK: - WatchManager (Connectivity + State)

class WatchManager: NSObject, ObservableObject, WCSessionDelegate {
  @Published var isReachable = false
  @Published var route: AppRoute = .home

  enum AppRoute {
    case home
    case playing
    case history
    case placeInput(holeCount: Int)
  }

  override init() {
    super.init()
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    session.delegate = self
    session.activate()
  }

  // MARK: WCSessionDelegate

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    DispatchQueue.main.async {
      self.isReachable = session.isReachable
    }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    DispatchQueue.main.async {
      self.isReachable = session.isReachable
    }
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    // Phone → Watch command handling (future: remote start etc.)
  }
}

// MARK: - Root View

struct RootView: View {
  @EnvironmentObject var watchManager: WatchManager

  var body: some View {
    switch watchManager.route {
    case .home:
      HomeView()
    case .playing:
      PlayingView()
    case .history:
      HistoryView()
    case .placeInput(let holeCount):
      PlaceInputView(holeCount: holeCount)
    }
  }
}

// MARK: - Home View

struct HomeView: View {
  @EnvironmentObject var watchManager: WatchManager
  @Environment(\.modelContext) private var modelContext
  @Query(sort: \RoundRecord.playedAt, order: .reverse) private var rounds: [RoundRecord]

  var body: some View {
    ScrollView {
      VStack(spacing: 12) {
        // Header
        VStack(spacing: 4) {
          Text("Hakuto")
            .font(.headline)
            .foregroundColor(.green)
          Text("グラウンドゴルフ")
            .font(.caption2)
            .foregroundColor(.secondary)
        }
        .padding(.top, 8)

        // Quick start: 8H
        Button(action: {
          watchManager.route = .placeInput(holeCount: 8)
        }) {
          Label("8H 開始", systemImage: "figure.walk")
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
        }
        .buttonStyle(.borderedProminent)
        .tint(.green)

        // Quick start: 16H
        Button(action: {
          watchManager.route = .placeInput(holeCount: 16)
        }) {
          Label("16H 開始", systemImage: "figure.walk")
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
        }
        .buttonStyle(.bordered)
        .tint(.green)

        // History button
        if !rounds.isEmpty {
          Button(action: {
            watchManager.route = .history
          }) {
            Label("履歴 (\(rounds.count))", systemImage: "list.bullet")
              .frame(maxWidth: .infinity)
              .padding(.vertical, 6)
          }
          .buttonStyle(.bordered)
          .tint(.blue)

          // Recent round preview
          if let latest = rounds.first {
            VStack(alignment: .leading, spacing: 4) {
              Text("前回").font(.caption2).foregroundColor(.secondary)
              HStack {
                Text(formatDate(latest.playedAt))
                  .font(.caption2)
                Spacer()
                Text("\(latest.totalStrokes) 打")
                  .font(.caption2)
                  .foregroundColor(.green)
              }
              if let place = latest.place, !place.isEmpty {
                Text(place)
                  .font(.caption2)
                  .foregroundColor(.secondary)
              }
            }
            .padding(8)
            .background(Color.gray.opacity(0.15))
            .clipShape(RoundedRectangle(cornerRadius: 8))
          }
        }

        // Connectivity indicator
        HStack(spacing: 4) {
          Circle()
            .fill(watchManager.isReachable ? Color.green : Color.gray)
            .frame(width: 6, height: 6)
          Text(watchManager.isReachable ? "Phone 接続中" : "Phone 未接続")
            .font(.caption2)
            .foregroundColor(.secondary)
        }
        .padding(.top, 4)
      }
      .padding(8)
    }
  }

  private func formatDate(_ date: Date) -> String {
    let f = DateFormatter()
    f.dateStyle = .short
    f.timeStyle = .none
    return f.string(from: date)
  }
}

// MARK: - Place Input View (Standalone Start)

struct PlaceInputView: View {
  @EnvironmentObject var watchManager: WatchManager
  let holeCount: Int
  @State private var placeText = ""

  var body: some View {
    ScrollView {
      VStack(spacing: 12) {
        Text("\(holeCount)H 開始")
          .font(.headline)

        TextField("場所（任意）", text: $placeText)
          .textFieldStyle(.roundedBorder)
          .font(.body)

        Button(action: startRound) {
          Text("スタート")
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
        }
        .buttonStyle(.borderedProminent)
        .tint(.green)

        Button(action: { watchManager.route = .home }) {
          Text("戻る")
            .frame(maxWidth: .infinity)
            .padding(.vertical, 4)
        }
        .buttonStyle(.bordered)
      }
      .padding(8)
    }
  }

  private func startRound() {
    let mgr = RoundSessionManager.shared
    mgr.startRound(
      place: placeText.isEmpty ? nil : placeText,
      holeCount: holeCount
    )
    watchManager.route = .playing
  }
}

// MARK: - Round Session Manager (Transient state for current round)

class RoundSessionManager: ObservableObject {
  static let shared = RoundSessionManager()

  @Published var place: String? = nil
  @Published var holeCount = 8
  @Published var scores: [Int] = []
  @Published var currentHole = 1
  @Published var isPlaying = false

  func startRound(place: String?, holeCount: Int) {
    self.place = place
    self.holeCount = holeCount
    self.scores = Array(repeating: 0, count: holeCount)
    self.currentHole = 1
    self.isPlaying = true
  }

  func setScore(_ strokes: Int) {
    guard isPlaying, currentHole <= holeCount else { return }
    let idx = currentHole - 1
    scores[idx] = strokes
    if currentHole < holeCount {
      currentHole += 1
    }
  }

  func nextHole() {
    guard isPlaying, currentHole < holeCount else { return }
    currentHole += 1
  }

  func prevHole() {
    guard isPlaying, currentHole > 1 else { return }
    currentHole -= 1
  }

  func finishRound() -> RoundRecord? {
    guard isPlaying else { return nil }
    isPlaying = false
    let playedScores = scores.filter { $0 > 0 }
    let total = RoundRecord.calculateTotalStrokes(playedScores)
    let record = RoundRecord(
      id: UUID().uuidString,
      place: place,
      playedAt: Date(),
      scores: playedScores,
      totalStrokes: total
    )
    return record
  }

  func cancelRound() {
    isPlaying = false
  }
}

// MARK: - Playing View (Score Input)

struct PlayingView: View {
  @StateObject private var session = RoundSessionManager.shared
  @EnvironmentObject var watchManager: WatchManager
  @Environment(\.modelContext) private var modelContext

  var body: some View {
    ScrollView {
      VStack(spacing: 8) {
        // Header
        HStack {
          if let place = session.place, !place.isEmpty {
            Text(place.prefix(8))
              .font(.caption2)
              .lineLimit(1)
          }
          Spacer()
          Text("\(session.currentHole)/\(session.holeCount)")
            .font(.caption2)
            .foregroundColor(.secondary)
        }
        .padding(.horizontal, 4)

        // Current hole
        Text("\(session.currentHole)")
          .font(.system(size: 48, weight: .bold))
          .foregroundColor(.green)

        Text("打数")
          .font(.caption2)
          .foregroundColor(.secondary)

        // HIO indicator
        if session.scores.filter({ $0 == 1 }).count > 0 {
          Text("HIO ×\(session.scores.filter({ $0 == 1 }).count) (-\(session.scores.filter({ $0 == 1 }).count * 3))")
            .font(.caption2)
            .foregroundColor(.orange)
        }

        // Score buttons — 打数の大半は 1-4 に収まるため主役として大きく表示、
        // 5-8 はまれなので下段に控えめに置く
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 4), spacing: 6) {
          ForEach(1...4, id: \.self) { strokes in
            scoreButton(strokes, primary: true)
          }
        }

        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 4), spacing: 4) {
          ForEach(5...8, id: \.self) { strokes in
            scoreButton(strokes, primary: false)
          }
        }

        // Navigation
        HStack(spacing: 8) {
          Button(action: session.prevHole) {
            Image(systemName: "chevron.left")
              .font(.caption)
          }
          .disabled(session.currentHole <= 1)
          .buttonStyle(.bordered)

          Button(action: session.nextHole) {
            Image(systemName: "chevron.right")
              .font(.caption)
          }
          .disabled(session.currentHole >= session.holeCount)
          .buttonStyle(.bordered)

          Spacer()

          Button(action: finish) {
            Text("終了")
              .font(.caption)
              .foregroundColor(.white)
          }
          .buttonStyle(.borderedProminent)
          .tint(.green)
        }
        .padding(.top, 4)
      }
      .padding(8)
    }
  }

  @ViewBuilder
  private func scoreButton(_ strokes: Int, primary: Bool) -> some View {
    Button(action: { session.setScore(strokes) }) {
      Text("\(strokes)")
        .font(primary ? .title2 : .body)
        .fontWeight(primary ? .bold : .regular)
        .frame(maxWidth: .infinity, minHeight: primary ? 50 : 34)
        .foregroundColor(primary ? .primary : .secondary)
        .background(primary ? Color.green.opacity(0.25) : Color.gray.opacity(0.15))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    .buttonStyle(.plain)
  }

  private func finish() {
    guard let record = session.finishRound() else { return }
    // Save locally
    modelContext.insert(record)
    try? modelContext.save()
    // Sync to Phone if reachable
    if WCSession.default.isReachable {
      sendToPhone(record)
    }
    watchManager.route = .home
  }

  private func sendToPhone(_ record: RoundRecord) {
    let payload: [String: Any] = [
      "action": "syncRound",
      "id": record.id,
      "place": record.place ?? NSNull(),
      "playedAt": ISO8601DateFormatter().string(from: record.playedAt),
      "scores": record.scores,
      "totalStrokes": record.totalStrokes,
    ]
    WCSession.default.sendMessage(payload, replyHandler: nil) { error in
      // Mark as synced after successful send
      if (error as NSError?) == nil {
        DispatchQueue.main.async {
          record.synced = true
          try? modelContext.save()
        }
      }
    }
  }
}

// MARK: - History View

struct HistoryView: View {
  @EnvironmentObject var watchManager: WatchManager
  @Environment(\.modelContext) private var modelContext
  @Query(sort: \RoundRecord.playedAt, order: .reverse) private var rounds: [RoundRecord]

  var body: some View {
    ScrollView {
      VStack(spacing: 8) {
        // Header
        HStack {
          Text("履歴")
            .font(.headline)
          Spacer()
          Text("\(rounds.count) ラウンド")
            .font(.caption2)
            .foregroundColor(.secondary)
        }
        .padding(.horizontal, 4)
        .padding(.top, 4)

        if rounds.isEmpty {
          VStack(spacing: 8) {
            Image(systemName: "tray")
              .font(.title2)
              .foregroundColor(.gray)
            Text("まだラウンドがありません")
              .font(.caption2)
              .foregroundColor(.gray)
          }
          .padding(.top, 40)
        }

        ForEach(rounds) { round in
          NavigationLink(destination: HistoryDetailView(round: round)) {
            HistoryRow(round: round)
          }
          .buttonStyle(.plain)
        }
      }
      .padding(8)
    }

    Button(action: { watchManager.route = .home }) {
      Text("戻る")
        .frame(maxWidth: .infinity)
        .padding(.vertical, 4)
    }
    .buttonStyle(.bordered)
    .padding(.horizontal, 8)
  }
}

// MARK: - History Row

struct HistoryRow: View {
  let round: RoundRecord

  var body: some View {
    HStack {
      VStack(alignment: .leading, spacing: 2) {
        Text(formatDate(round.playedAt))
          .font(.caption)
          .foregroundColor(.primary)
        if let place = round.place, !place.isEmpty {
          Text(place)
            .font(.caption2)
            .foregroundColor(.secondary)
        } else {
          Text("場所未登録")
            .font(.caption2)
            .foregroundColor(.secondary)
        }
      }
      Spacer()
      VStack(alignment: .trailing, spacing: 2) {
        Text("\(round.totalStrokes)")
          .font(.headline)
          .foregroundColor(.green)
        Text("打")
          .font(.caption2)
          .foregroundColor(.secondary)
      }
    }
    .padding(8)
    .background(Color.gray.opacity(0.1))
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }

  private func formatDate(_ date: Date) -> String {
    let f = DateFormatter()
    f.dateStyle = .short
    f.timeStyle = .short
    return f.string(from: date)
  }
}

// MARK: - History Detail View

struct HistoryDetailView: View {
  let round: RoundRecord
  @Environment(\.modelContext) private var modelContext

  var body: some View {
    ScrollView {
      VStack(spacing: 12) {
        // Summary
        VStack(spacing: 4) {
          Text("\(round.totalStrokes) 打")
            .font(.system(size: 40, weight: .bold))
            .foregroundColor(.green)

          if round.holeInOneCount > 0 {
            Text("HIO \(round.holeInOneCount)回 (-\(round.holeInOneCount * 3))")
              .font(.caption)
              .foregroundColor(.orange)
          }

          Text(formatDateTime(round.playedAt))
            .font(.caption2)
            .foregroundColor(.secondary)

          if let place = round.place, !place.isEmpty {
            Text(place)
              .font(.caption2)
              .foregroundColor(.secondary)
          }

          if round.synced {
            Label("Phone 同期済", systemImage: "checkmark.circle.fill")
              .font(.caption2)
              .foregroundColor(.blue)
          } else {
            Label("未同期", systemImage: "clock")
              .font(.caption2)
              .foregroundColor(.orange)
          }
        }
        .padding(.top, 8)

        // Hole by hole scores
        Text("ホール別スコア")
          .font(.subheadline)
          .frame(maxWidth: .infinity, alignment: .leading)

        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 4) {
          ForEach(Array(round.scores.enumerated()), id: \.offset) { index, score in
            VStack(spacing: 2) {
              Text("H\(index + 1)")
                .font(.caption2)
                .foregroundColor(.secondary)
              Text("\(score)")
                .font(.body)
                .fontWeight(score == 1 ? .bold : .regular)
                .foregroundColor(score == 1 ? .orange : .primary)
            }
            .padding(4)
            .background(score == 1 ? Color.orange.opacity(0.15) : Color.gray.opacity(0.05))
            .clipShape(RoundedRectangle(cornerRadius: 6))
          }
        }

        // Sync button (if not synced and reachable)
        if !round.synced && WCSession.default.isReachable {
          Button(action: syncToPhone) {
            Label("Phone に同期", systemImage: "arrow.triangle.2.circlepath")
              .frame(maxWidth: .infinity)
              .padding(.vertical, 6)
          }
          .buttonStyle(.borderedProminent)
          .tint(.blue)
        }
      }
      .padding(8)
    }
  }

  private func syncToPhone() {
    let payload: [String: Any] = [
      "action": "syncRound",
      "id": round.id,
      "place": round.place ?? NSNull(),
      "playedAt": ISO8601DateFormatter().string(from: round.playedAt),
      "scores": round.scores,
      "totalStrokes": round.totalStrokes,
    ]
    WCSession.default.sendMessage(payload, replyHandler: nil) { error in
      if error == nil {
        DispatchQueue.main.async {
          round.synced = true
          try? modelContext.save()
        }
      }
    }
  }

  private func formatDateTime(_ date: Date) -> String {
    let f = DateFormatter()
    f.dateStyle = .short
    f.timeStyle = .short
    return f.string(from: date)
  }
}
