import type { SD } from "../types";
import type { Content as MdastContent } from 'mdast'
import { toHast } from 'mdast-util-to-hast'
import { toHtml } from 'hast-util-to-html'

export default class HTMLRenderer implements SD.Renderer {
  render(ast: SD.Ast): string {
    return ast.children.map(this.renderNode).join("");
  }

  private renderNode = (node: SD.Element | MdastContent): string => {
    if (node.type === 'element') {
      return this.renderElement(node);
    } else {
      // It's an mdast node - convert to hast then HTML
      return this.renderMdastNode(node);
    }
  }

  private renderElement(node: SD.Element): string {
    const attributes = this.unpackAttributes(node);
    const children = node.children.map(this.renderNode).join("");
    return `<${node.tagName}${attributes}>${children}</${node.tagName}>`;
  }

  private renderMdastNode(node: MdastContent): string {
    // Convert mdast to hast (HTML AST)
    const hast = toHast(node);

    // Convert hast to HTML string
    if (!hast) return '';

    return toHtml(hast);
  }

  private unpackAttributes(node: SD.Element): string {
    let attributes: string[] = []
    if (node.ids) attributes.push(`id="${node.ids.join(" ")}"`);
    if (node.classes) attributes.push(`class="${node.classes.join(" ")}"`);
    if (node.attributes) {
      attributes.push(
        ...Object.entries(node.attributes).map(([key, value]) => {
          if (value === true) return key; // Boolean attributes
          return `${key}="${value}"`;
        })
      );
    }

    return attributes.length ? " " + attributes.join(" ") : "";
  }
}
