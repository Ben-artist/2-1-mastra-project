import { Mastra } from '@mastra/core/mastra';
import { ConsoleLogger } from '@mastra/core/logger';
import { Agent } from '@mastra/core/agent';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { mcp } from './agents/cook';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
const deepseek = createDeepSeek({
  apiKey: "sk-3e407cd7b7e2428285ce5e28973d6073",
}); 
// 创建通用助手智能体
const myAgent = new Agent({
  name: 'cook-agent',
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
    workerNamespace: 'cook-agent',
  })
});
