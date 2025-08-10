import { MCPClient } from "@mastra/mcp";
export const mcp = new MCPClient({
  servers: {
    baiduMap: {
      "command": "npx",
      "args": [
        "-y",
        "@baidumap/mcp-server-baidu-map"
      ],
      "env": {
        "BAIDU_MAP_API_KEY": "iYfNm4eOjzWuxEEtGOoIHcHUHQ5ZE2rA"
      }
    },
  },
});