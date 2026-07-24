import ExpoModulesCore
import Vision

public class AppleVisionOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppleVisionOcr")

    AsyncFunction("recognizeText") { (imageUri: String) -> String in
      guard let url = URL(string: imageUri) else {
        throw OcrError.invalidUri
      }

      // Load image data
      let imageData = try Data(contentsOf: url)
      guard let image = UIImage(data: imageData) else {
        throw OcrError.imageLoadFailed
      }

      // Run Vision text recognition
      guard let cgImage = image.cgImage else {
        throw OcrError.imageLoadFailed
      }

      return try performTextRecognition(cgImage: cgImage)
    }

    Function("isAvailable") {
      return true
    }
  }

  private func performTextRecognition(cgImage: CGImage) throws -> String {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["ja-JP", "en-US"]
    request.usesLanguageCorrection = true

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try handler.perform([request])

    guard let observations = request.results else {
      return ""
    }

    // Sort by y-coordinate (top to bottom), then x-coordinate (left to right)
    let sorted = observations.sorted { a, b in
      let aY = a.topLeft.y
      let bY = b.topLeft.y
      if abs(aY - bY) < 20 {
        return a.topLeft.x < b.topLeft.x
      }
      return aY < bY
    }

    let recognizedStrings = sorted.compactMap { $0.topCandidates(1).first?.string }
    return recognizedStrings.joined(separator: "\n")
  }
}

enum OcrError: Error {
  case invalidUri
  case imageLoadFailed
}
