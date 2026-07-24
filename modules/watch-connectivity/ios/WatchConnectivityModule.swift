import ExpoModulesCore
import WatchConnectivity

public class WatchConnectivityModule: Module, WCSessionDelegate {
  private var messageHandler: ((String) -> Void)?

  public func definition() -> ModuleDefinition {
    Name("WatchConnectivity")

    Function("getSessionState") { [weak self] in
      guard let self = self else { return [:] }
      return self.sessionState()
    }

    AsyncFunction("sendMessage") { [weak self] (message: [String: Any]) in
      guard let self = self else { throw WatchError.moduleDeallocated }
      try self.sendToWatch(message)
    }

    Function("onMessage") { [weak self] (handler: @escaping (String) -> Void) in
      guard let self = self else { return }
      self.messageHandler = handler
    }

    Function("removeMessageHandler") { [weak self] in
      self?.messageHandler = nil
    }

    OnStartObserving {
      activateSession()
    }
  }

  private func activateSession() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    session.delegate = self
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
      NSLog("WatchConnectivity: send failed: %@", error.localizedDescription)
    }
  }

  // MARK: - WCSessionDelegate

  public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

  public func sessionDidBecomeInactive(_ session: WCSession) {}

  public func sessionDidDeactivate(_ session: WCSession) {
    WCSession.default.activate()
  }

  public func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    guard let handler = messageHandler else { return }
    if let data = try? JSONSerialization.data(withJSONObject: message),
       let jsonString = String(data: data, encoding: .utf8) {
      handler(jsonString)
    }
  }

  public func sessionReachabilityDidChange(_ session: WCSession) {
    // Notify listeners — future: event emitter
  }
}

enum WatchError: Error {
  case moduleDeallocated
  case watchNotReachable
}
