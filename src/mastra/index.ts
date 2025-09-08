import { Mastra } from '@mastra/core/mastra';
import { ConsoleLogger } from '@mastra/core/logger';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { calculatorAgent } from './agents/calculator';
import { webAgent } from './agents/web-agent';
import { textExpandAgent } from './agents/text-expand-agent';

// 创建Mastra实例
export const mastra = new Mastra({
  agents: {
    calculatorAgent,
    webAgent,
    textExpandAgent
  },
  logger: new ConsoleLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    env: {
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    }
  })
});
