import SwiftUI
import WatchConnectivity

@main
struct HakutoWatchApp: App {
  @StateObject private var sessionManager = WatchSessionManager()

  var body: some Scene {
    WindowGroup {
      ContentView()
        .environmentObject(sessionManager)
    }
  }
}

// MARK: - Session Manager

class WatchSessionManager: NSObject, ObservableObject, WCSessionDelegate {
  @Published var isReachable = false
  @Published var courseName = ""
  @Published var holeCount = 8
  @Published var scores: [Int] = []
  @Published var currentHole = 1
  @Published var isPlaying = false

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
    DispatchQueue.main.async {
      guard let action = message["action"] as? String else { return }
      switch action {
      case "startRound":
        self.courseName = message["courseName"] as? String ?? ""
        self.holeCount = message["holeCount"] as? Int ?? 8
        self.scores = Array(repeating: 0, count: self.holeCount)
        self.currentHole = 1
        self.isPlaying = true

      case "endRound":
        self.isPlaying = false

      case "updateScores":
        if let newScores = message["scores"] as? [Int] {
          self.scores = newScores
        }

      default:
        break
      }
    }
  }

  // MARK: Actions

  func setScore(_ strokes: Int) {
    guard isPlaying, currentHole <= holeCount else { return }
    let idx = currentHole - 1
    scores[idx] = strokes
    if currentHole < holeCount {
      currentHole += 1
    }
    sendScoresToPhone()
  }

  func nextHole() {
    guard isPlaying, currentHole < holeCount else { return }
    currentHole += 1
  }

  func prevHole() {
    guard isPlaying, currentHole > 1 else { return }
    currentHole -= 1
  }

  func finishRound() {
    isPlaying = false
    sendScoresToPhone()
  }

  private func sendScoresToPhone() {
    guard WCSession.default.isReachable else { return }
    WCSession.default.sendMessage(
      ["action": "roundData", "scores": scores, "currentHole": currentHole, "completed": !isPlaying],
      replyHandler: nil
    )
  }
}

// MARK: - Content View

struct ContentView: View {
  @EnvironmentObject var session: WatchSessionManager

  var body: some View {
    if !session.isReachable {
      DisconnectedView()
    } else if session.isPlaying {
      PlayingView()
        .environmentObject(session)
    } else {
      HomeView()
        .environmentObject(session)
    }
  }
}

// MARK: - Disconnected View

struct DisconnectedView: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "applewatch.slash")
        .font(.title2)
        .foregroundColor(.gray)
      Text("iPhoneに接続できません")
        .font(.caption2)
        .multilineTextAlignment(.center)
        .foregroundColor(.gray)
    }
  }
}

// MARK: - Home View

struct HomeView: View {
  @EnvironmentObject var session: WatchSessionManager

  var body: some View {
    ScrollView {
      VStack(spacing: 12) {
        Text("Hakuto")
          .font(.headline)
          .foregroundColor(.green)

        Text("グラウンドゴルフ")
          .font(.caption2)
          .foregroundColor(.secondary)

        if !session.courseName.isEmpty {
          Text(session.courseName)
            .font(.caption)
            .foregroundColor(.secondary)
        }
      }
      .padding(.top, 8)
    }
  }
}

// MARK: - Playing View (score input)

struct PlayingView: View {
  @EnvironmentObject var session: WatchSessionManager

  var body: some View {
    ScrollView {
      VStack(spacing: 8) {
        // Header
        HStack {
          Text(session.courseName.prefix(8))
            .font(.caption2)
            .lineLimit(1)
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

        // Score buttons
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 6) {
          ForEach([1, 2, 3, 4, 5, 6, 7, 8], id: \.self) { strokes in
            Button(action: { session.setScore(strokes) }) {
              Text("\(strokes)")
                .font(.title3)
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity, minHeight: 44)
                .background(Color.green.opacity(0.2))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .buttonStyle(.plain)
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

          Button(action: session.finishRound) {
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
}
