package expo.modules.mlkitorc

import android.graphics.BitmapFactory
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.japanese.JapaneseTextRecognizerOptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class MlKitOcrModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MlKitOcr")

    AsyncFunction("recognizeText") { imageUri: String ->
      val context = appContext.reactContext ?: throw Error("React context not available")

      val bitmap = if (imageUri.startsWith("content://") || imageUri.startsWith("file://")) {
        val uri = Uri.parse(imageUri)
        val inputStream = context.contentResolver.openInputStream(uri)
          ?: throw Error("Cannot open image: $imageUri")
        BitmapFactory.decodeStream(inputStream)
      } else {
        val url = URL(imageUri)
        val inputStream = url.openStream()
        BitmapFactory.decodeStream(inputStream)
      } ?: throw Error("Failed to decode image: $imageUri")

      val image = InputImage.fromBitmap(bitmap, 0)
      val recognizer = TextRecognition.getClient(JapaneseTextRecognizerOptions.Builder().build())

      try {
        val result = recognizer.process(image)
        val blocks = result.textBlocks
          .sortedBy { it.boundingBox?.top ?: 0 }
          .mapNotNull { block ->
            block.lines
              .sortedBy { it.boundingBox?.left ?: 0 }
              .joinToString(" ") { it.text }
          }
        return@AsyncFunction blocks.joinToString("\n")
      } catch (e: Exception) {
        throw Error("ML Kit OCR failed: ${e.message}")
      } finally {
        recognizer.close()
      }
    }

    Function("isAvailable") {
      return@Function true
    }
  }
}
