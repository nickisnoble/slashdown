import type { SD } from "../types";

export default class JSONRenderer implements SD.Renderer {
 render(ast: SD.Ast): string {
    return JSON.stringify(ast);
  }
}