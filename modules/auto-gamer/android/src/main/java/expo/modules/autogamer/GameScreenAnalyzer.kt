
package expo.modules.autogamer

import android.graphics.Rect
import android.view.accessibility.AccessibilityNodeInfo
import java.util.Locale

/**
 * Reads the accessibility tree of the active Android window.
 *
 * This provides structured screen information when an app exposes
 * accessible UI elements. It is not a replacement for image analysis
 * in games rendered entirely on a canvas or a GPU surface.
 */
object GameScreenAnalyzer {

  private const val MAX_NODES = 500
  private const val MAX_DEPTH = 20
  private const val MAX_TEXT_LENGTH = 300

  data class ScreenElement(
    val text: String,
    val description: String,
    val className: String,
    val bounds: Rect,
    val clickable: Boolean,
    val enabled: Boolean,
    val scrollable: Boolean,
    val focused: Boolean
  ) {
    fun toMap(): Map<String, Any> {
      return mapOf(
        "text" to text,
        "description" to description,
        "className" to className,
        "left" to bounds.left,
        "top" to bounds.top,
        "right" to bounds.right,
        "bottom" to bounds.bottom,
        "centerX" to bounds.centerX(),
        "centerY" to bounds.centerY(),
        "width" to bounds.width(),
        "height" to bounds.height(),
        "clickable" to clickable,
        "enabled" to enabled,
        "scrollable" to scrollable,
        "focused" to focused
      )
    }
  }

  data class ScreenSnapshot(
    val packageName: String,
    val elements: List<ScreenElement>,
    val totalElements: Int,
    val truncated: Boolean
  ) {
    fun toMap(): Map<String, Any> {
      return mapOf(
        "packageName" to packageName,
        "elements" to elements.map { it.toMap() },
        "totalElements" to totalElements,
        "truncated" to truncated
      )
    }
  }

  fun analyze(
    root: AccessibilityNodeInfo?,
    packageName: String
  ): ScreenSnapshot {
    if (root == null) {
      return ScreenSnapshot(
        packageName = packageName,
        elements = emptyList(),
        totalElements = 0,
        truncated = false
      )
    }

    val results = mutableListOf<ScreenElement>()
    var visited = 0
    var truncated = false

    fun visit(node: AccessibilityNodeInfo, depth: Int) {
      if (visited >= MAX_NODES || depth > MAX_DEPTH) {
        truncated = true
        return
      }

      visited++

      val text = node.text
        ?.toString()
        ?.take(MAX_TEXT_LENGTH)
        .orEmpty()

      val description = node.contentDescription
        ?.toString()
        ?.take(MAX_TEXT_LENGTH)
        .orEmpty()

      val rect = Rect()
      node.getBoundsInScreen(rect)

      val hasBounds = rect.width() > 0 && rect.height() > 0

      if (
        hasBounds &&
        (
          text.isNotBlank() ||
          description.isNotBlank() ||
          node.isClickable ||
          node.isScrollable
        )
      ) {
        results.add(
          ScreenElement(
            text = text,
            description = description,
            className = node.className?.toString().orEmpty(),
            bounds = Rect(rect),
            clickable = node.isClickable,
            enabled = node.isEnabled,
            scrollable = node.isScrollable,
            focused = node.isFocused
          )
        )
      }

      for (index in 0 until node.childCount) {
        if (visited >= MAX_NODES) {
          truncated = true
          break
        }

        val child = node.getChild(index) ?: continue

        try {
          visit(child, depth + 1)
        } finally {
          @Suppress("DEPRECATION")
          child.recycle()
        }
      }
    }

    try {
      visit(root, 0)
    } catch (_: Exception) {
      // Return the elements collected before an accessibility error.
    }

    return ScreenSnapshot(
      packageName = packageName,
      elements = results,
      totalElements = visited,
      truncated = truncated
    )
  }

  /**
   * Finds visible elements by matching text or content description.
   */
  fun findMatching(
    snapshot: ScreenSnapshot,
    query: String
  ): List<ScreenElement> {
    val normalizedQuery = query
      .trim()
      .lowercase(Locale.ROOT)

    if (normalizedQuery.isEmpty()) return emptyList()

    return snapshot.elements.filter { element ->
      element.enabled &&
        (
          element.text.lowercase(Locale.ROOT)
            .contains(normalizedQuery) ||
          element.description.lowercase(Locale.ROOT)
            .contains(normalizedQuery)
        )
    }
  }

  /**
   * Returns likely interactive elements for a decision engine.
   * This is a heuristic, not proof that tapping an element is safe.
   */
  fun getInteractiveElements(
    snapshot: ScreenSnapshot
  ): List<ScreenElement> {
    return snapshot.elements.filter { element ->
      element.enabled &&
        (
          element.clickable ||
          element.scrollable
        ) &&
        element.bounds.width() > 0 &&
        element.bounds.height() > 0
    }
  }
}
