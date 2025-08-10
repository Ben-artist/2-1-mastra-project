import { Mastra } from '@mastra/core/mastra';
import { ConsoleLogger } from '@mastra/core/logger';
import { Agent } from '@mastra/core/agent';
import { deepseek } from '@ai-sdk/deepseek';
import { mcp } from './agents/baidu';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
// 创建通用助手智能体
const myAgent = new Agent({
  name: 'myAgent',
  instructions: '你是一个有用的助手，可以帮助用户使用各种工具和服务。',
  model: deepseek('deepseek-chat'),
  tools: async () => {
    return await mcp.getTools();
  },
});

// 创建Mastra实例
export const mastra = new Mastra({
  agents: {
    myAgent
  },
  logger: new ConsoleLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    // scope: "672e20737b497a5b4e4ed7cfd3cf9290",
    // projectName: 'mastra-test',
  })
});
