import '../toml-loader.js';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { Mastra } from '@mastra/core/mastra';
import { ConsoleLogger } from '@mastra/core/logger';

import { codeReviewAgent } from './agents/codeReview';
import { lyricGeneratorAgent } from './agents/lyricGen';

// Cloudflare Workers配置
const isCloudflareWorker = process.env.IS_CLOUDFLARE_WORKER === 'true';

// 创建Mastra实例（不初始化数据库和连接）
export const mastra = new Mastra({
  agents: { 
    codeReviewAgent,
    lyricGeneratorAgent 
  },
  // 避免使用数据库存储
  storage: undefined,
  logger: new ConsoleLogger({
    name: 'Mastra',
    level: 'info',
  }),
  deployer: new CloudflareDeployer({
    scope: 'e79f0ee042d7704594ac39d671ae2135',
    projectName: 'icy-glade-7be0',
    auth: {
      apiToken: process.env.CLOUDFLARE_API_TOKEN || 'your-api-token',
    },
  }),
});

// 针对Cloudflare Workers的导出
export default {
  // 完全在请求处理函数内执行初始化，避免全局异步操作
  async fetch(request: Request, env: any, ctx: any) {
    try {
      // 将Cloudflare Worker环境变量保存到全局，供其他模块访问
      if (typeof globalThis !== 'undefined') {
        // @ts-ignore - Cloudflare Worker环境使用
        globalThis.env = env;
      }
      
      // 日志信息，测试环境变量访问 
      console.log('请求处理开始, 检查环境变量:', {
        hasDeepseekKey: !!env.DEEPSEEK_API_KEY,
        hasCloudflareToken: !!env.CLOUDFLARE_API_TOKEN,
        isWorker: !!env.IS_CLOUDFLARE_WORKER
      });
      
      // 简单地响应请求
      return new Response('Mastra代码审查API已启动', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8'
        }
      });
    } catch (error) {
      // 简单错误处理
      console.error('请求处理失败:', error);
      return new Response('发生错误: ' + (error as Error).message, { status: 500 });
    }
  }
};
