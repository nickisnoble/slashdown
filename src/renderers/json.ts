import type { SD } from "../types";

const JSONRenderer: SD.Renderer = (ast) => {
  return JSON.stringify(ast);
}

export default JSONRenderer;