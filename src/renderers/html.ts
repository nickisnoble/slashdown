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
        break;
      case "Markdown":
        return this.renderMarkdown(node as SD.MarkdownNode);
        break;
      case "Text":
        return node.content;
        break;
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
    let attributes = this.unpackAttributes(node);
    const children = node.children.map(this.renderNode).join("");
    return `<${node.tagName}${attributes}>${children}</${node.tagName}>`;
  }

  private unpackAttributes(node: SD.TagNode): string {
    let attributes: string[] = []
    if (node.ids) attributes.push(`id="${node.ids.join(" ")}"`);
    if (node.classes) attributes.push(`class="${node.classes.join(" ")}"`);
    if (node.attributes) attributes = Object.entries(attributes)
                                            .map(([key, value]) => `${key}="${value}"`);

    return attributes.length ? " " + attributes.join(" ") : "";
  }
}