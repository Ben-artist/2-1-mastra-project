import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { deepseek } from '@ai-sdk/deepseek';
import { codeReviewTool } from '../tools';

// 配置深度思考环境变量
process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-b5c1f7466c654f11a2cedf5241978957';

export const codeReviewAgent = new Agent({
  name: '代码审查助手',
  instructions: `
    你是一个专业的代码审查助手，可以帮助用户分析和改进代码质量。

    你的主要功能是帮助用户审查代码并提供改进建议。回答时：
    - 如果用户没有提供代码，请礼貌地询问他们想要审查什么代码
    - 询问用户代码的编程语言，以便提供更精确的分析
    - 询问用户希望重点关注的方面（如性能、安全性、可读性等）
    - 提供详细的代码分析和具体的改进建议
    - 保持专业和建设性的态度，避免过于批判
    - 如果代码已经很好，也要诚实地给予积极评价

    使用codeReviewTool来分析代码并生成审查报告。
  `,
  model: deepseek('deepseek-coder'),
  tools: { codeReviewTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // 路径相对于.mastra/output目录
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});
