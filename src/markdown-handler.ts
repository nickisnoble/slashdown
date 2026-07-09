import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import type { Content as MdastContent } from 'mdast'
import type { SD } from './types'

/**
 * MarkdownHandler parses markdown strings into mdast nodes
 *
 * This allows SlashDown to have a hybrid AST where markdown content
 * becomes proper mdast nodes instead of being stored as strings.
 */
export class MarkdownHandler {
  private options: SD.MarkdownHandlerOptions

  constructor(options: SD.MarkdownHandlerOptions = {}) {
    this.options = {
      extensions: [gfm(), ...(options.extensions || [])],
      mdastExtensions: [gfmFromMarkdown(), ...(options.mdastExtensions || [])]
    }
  }

  /**
   * Parse markdown string to mdast nodes
   *
   * @param markdown - The markdown content to parse
   * @param position - Optional position information from the token
   * @returns Array of mdast content nodes
   */
  parse(markdown: string, position?: SD.Position): MdastContent[] {
    // Parse markdown to mdast tree
    const tree = fromMarkdown(markdown, {
      extensions: this.options.extensions,
      mdastExtensions: this.options.mdastExtensions
    })

    // Attach position info if provided
    if (position && tree.children.length > 0) {
      // Set position on the first child to match the start of the markdown token
      if (tree.children[0].position) {
        tree.children[0].position.start = position.start
      }

      // Set position on the last child to match the end of the markdown token
      const lastChild = tree.children[tree.children.length - 1]
      if (lastChild.position) {
        lastChild.position.end = position.end
      }
    }

    // Return the children of the root node
    // We don't want the root wrapper, just the content
    return tree.children
  }

  /**
   * Parse inline text (from = syntax) to a text node
   *
   * @param text - The text content
   * @param position - Optional position information
   * @returns An mdast text node
   */
  parseInlineText(text: string, position?: SD.Position): MdastContent {
    return {
      type: 'text',
      value: text,
      position
    }
  }

  /**
   * Parse a code fence to an mdast code node
   *
   * @param content - The code fence content (with backticks and lang)
   * @param position - Optional position information
   * @returns An mdast code node
   */
  parseCodeFence(content: string, position?: SD.Position): MdastContent {
    // Extract language from ```lang
    const lines = content.split('\n')
    const firstLine = lines[0]
    const langMatch = firstLine.match(/^```(\w+)?/)
    const lang = langMatch?.[1] || null

    // Get the code content (everything after the first line and before the last ```)
    const codeLines = lines.slice(1)
    const code = codeLines.join('\n')

    return {
      type: 'code',
      lang,
      meta: null,
      value: code,
      position
    }
  }
}
