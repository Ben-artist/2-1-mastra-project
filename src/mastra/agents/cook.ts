import { MCPClient } from "@mastra/mcp";
export const mcp = new MCPClient({
  servers: {
    howtocook: {
      "command": "npx",
      "args": [
        "-y",
        "howtocook-mcp"
      ]
    },
  },
});