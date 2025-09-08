import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { pageActTool } from '../tools/page-act-tool';
import { pageObserveTool } from '../tools/page-observe-tool';
import { pageExtractTool } from '../tools/page-extract-tool';
import { pageNavigateTool } from '../tools/page-navigate-tool';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { LibSQLStore } from "@mastra/libsql";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db", // Or your database URL
  }),
});
export const webAgent = new Agent({
  name: 'Web Assistant',
  instructions: `
      你是一个有用的网络助手，可以浏览网站并提取信息。

      你的主要功能包括：
      - 浏览网站
      - 观察网页元素
      - 执行操作，如点击按钮或填写表单
      - 从网页提取数据

      在回复时：
      - 如果没有提供具体URL，请询问
      - 明确说明要执行什么操作
      - 提取数据时，清楚说明需要什么信息

      使用 pageActTool 在网页上执行操作。
      使用 pageObserveTool 查找网页元素。
      使用 pageExtractTool 从网页提取数据。
      使用 pageNavigateTool 导航到指定URL。
`,
  model: deepseek('deepseek-chat'),
  tools: { pageActTool, pageObserveTool, pageExtractTool, pageNavigateTool },
});
