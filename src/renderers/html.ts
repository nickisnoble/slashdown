import type { SD } from "../types";
import {micromark} from 'micromark';
import {gfm} from 'micromark-extension-gfm';

export default class HTMLRenderer implements SD.Renderer {
  render(ast: SD.Ast): string {
    return ast.map(this.renderNode).join("");
  }

  private renderNode = ( node: SD.Node ): string => {
    switch (node.type) {
      case "Tag":
        return this.renderTag(node as SD.TagNode);
      case "Markdown":
        return this.renderMarkdown(node as SD.MarkdownNode);
      case "Text":
        return this.escapeHtml(node.content);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private renderMarkdown(node: SD.MarkdownNode): string {
    return micromark( node.content, {
      extensions: [gfm()],
    });
  }

  private renderTag(node: SD.TagNode): string {
    const attributes = this.unpackAttributes(node);
    const children = node.children.map(this.renderNode).join("");
    return `<${node.tagName}${attributes}>${children}</${node.tagName}>`;
  }

  private unpackAttributes(node: SD.TagNode): string {
    const attributes: string[] = []

    if (node.ids) {
      attributes.push(`id="${this.escapeHtml(node.ids.join(" "))}"`);
    }

    if (node.classes) {
      attributes.push(`class="${this.escapeHtml(node.classes.join(" "))}"`);
    }

    if (node.attributes) {
      const attrStrings = Object.entries(node.attributes).map(([key, value]) => {
        // Boolean attributes (disabled, readonly, etc.)
        if (value === true) {
          return key;
        }
        // String attributes with proper escaping
        return `${key}="${this.escapeHtml(String(value))}"`;
      });
      attributes.push(...attrStrings);
    }

    return attributes.length ? " " + attributes.join(" ") : "";
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
  }
}