import { Mastra } from '@mastra/core/mastra';
import { ConsoleLogger } from '@mastra/core/logger';
import { Agent } from '@mastra/core/agent';
import { deepseek } from '@ai-sdk/deepseek';
import { baiduMcp } from './agents/baidu';
// 创建通用助手智能体
const myAgent = new Agent({
  name: 'myAgent',
  instructions: '你是一个有用的助手，可以帮助用户使用各种工具和服务。',
  model: deepseek('deepseek-chat'),
  tools: await baiduMcp.getTools(),
});

// 创建Mastra实例
export const mastra = new Mastra({
  agents: {
    // 通用助手智能体
    myAgent
  },
  // 避免使用数据库存储
  storage: undefined,
  logger: new ConsoleLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

export default {
  async fetch(request: Request) {
    // @ts-ignore
    return Response("Hello, world!");
  },
}
