import ExpoModulesCore
import WatchConnectivity

// WCSessionDelegate は NSObjectProtocol を継承するため、
// NSObject を継承した別クラスとして実装する
private class SessionDelegateImpl: NSObject, WCSessionDelegate {
  var onMessage: ((String) -> Void)?
  var onReachabilityChange: ((Bool) -> Void)?

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

  func sessionDidBecomeInactive(_ session: WCSession) {}

  func sessionDidDeactivate(_ session: WCSession) {
    WCSession.default.activate()
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: message),
          let jsonString = String(data: data, encoding: .utf8)
    else { return }
    onMessage?(jsonString)
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    onReachabilityChange?(session.isReachable)
  }
}

public class HakutoWatchModule: Module {
  private let sessionDelegate = SessionDelegateImpl()

  public func definition() -> ModuleDefinition {
    Name("HakutoWatchKit")

    Function("getSessionState") { [weak self] in
      guard let self = self else { return [:] }
      return self.sessionState()
    }

    AsyncFunction("sendMessage") { [weak self] (message: [String: Any]) in
      guard let self = self else { throw WatchError.moduleDeallocated }
      try self.sendToWatch(message)
    }

    // Events API: receive messages from Watch
    Events("onMessage")

    OnStartObserving {
      activateSession()
    }
  }

  private func activateSession() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    session.delegate = sessionDelegate
    sessionDelegate.onMessage = { [weak self] json in
      self?.sendEvent("onMessage", json)
    }
    sessionDelegate.onReachabilityChange = { [weak self] reachable in
      self?.sendEvent("onMessage", ["action": "reachabilityChanged", "isReachable": reachable])
    }
    session.activate()
  }

  private func sessionState() -> [String: Any] {
    let session = WCSession.default
    return [
      "isPaired": session.isPaired,
      "isReachable": session.isReachable,
      "activationState": string(from: session.activationState),
    ]
  }

  private func string(from state: WCSessionActivationState) -> String {
    switch state {
    case .activated: return "activated"
    case .inactive: return "inactive"
    case .notActivated: return "inactive"
    @unknown default: return "inactive"
    }
  }

  private func sendToWatch(_ message: [String: Any]) throws {
    let session = WCSession.default
    guard session.isReachable else {
      throw WatchError.watchNotReachable
    }
    session.sendMessage(message, replyHandler: nil) { error in
      NSLog("HakutoWatchKit: send failed: %@", error.localizedDescription)
    }
  }
}

enum WatchError: Error {
  case moduleDeallocated
  case watchNotReachable
}
