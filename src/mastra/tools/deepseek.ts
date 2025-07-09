import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateDeepseekApiKey } from '../../utils/api-key-generator';

// DeepSeek API接口类型
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 声明全局类型，解决Cloudflare Worker环境变量访问问题
declare global {
  var env: Record<string, any> | undefined;
}

// Cloudflare Worker的self类型
interface CloudflareWorkerSelf extends Window {
  env?: Record<string, any>;
}

// 创建DeepSeek工具
export const codeReviewTool = createTool({
  id: 'code-review',
  description: '使用DeepSeek API进行代码审查',
  inputSchema: z.object({
    code: z.string().describe('需要审查的代码'),
    language: z.string().optional().describe('代码的编程语言'),
    focus: z.string().optional().describe('审查重点，例如安全性、性能、可读性等'),
  }),
  outputSchema: z.object({
    review: z.string().describe('代码审查结果'),
    suggestions: z.array(z.string()).describe('改进建议'),
  }),
  execute: async ({ context }) => {
    // 运行时获取API密钥，适配不同环境
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('未找到DeepSeek API密钥，请确保设置了DEEPSEEK_API_KEY环境变量');
    }
    
    return await reviewCode(
      context.code, 
      apiKey,
      context.language, 
      context.focus
    );
  },
});

/**
 * 获取API密钥的函数，支持多种环境
 */
function getApiKey(): string | undefined {
  // 1. 尝试从process.env获取（Node.js环境）
  if (process.env && process.env.DEEPSEEK_API_KEY) {
    return process.env.DEEPSEEK_API_KEY;
  }
  
  // 2. 尝试从全局env对象获取（Cloudflare Worker环境）
  if (typeof globalThis !== 'undefined' && 
      typeof globalThis.env !== 'undefined' &&
      globalThis.env.DEEPSEEK_API_KEY) {
    return globalThis.env.DEEPSEEK_API_KEY as string;
  }
  
  // 3. 尝试从self.env获取（另一种Cloudflare Worker访问方式）
  if (typeof self !== 'undefined') {
    const workerSelf = self as unknown as CloudflareWorkerSelf;
    if (workerSelf.env && workerSelf.env.DEEPSEEK_API_KEY) {
      return workerSelf.env.DEEPSEEK_API_KEY as string;
    }
  }
  
  try {
    return generateDeepseekApiKey();
  } catch (error) {
    console.error('无法生成API密钥:', error);
    return undefined;
  }
}

// 代码审查逻辑
async function reviewCode(
  code: string, 
  apiKey: string,
  language?: string, 
  focus?: string
): Promise<{ review: string; suggestions: string[] }> {
  try {
    // 构建提示
    const prompt = `
请审查以下${language || ''}代码${focus ? `，特别关注${focus}方面` : ''}：

\`\`\`
${code}
\`\`\`

请提供:
1. 整体代码质量评估
2. 具体问题和改进建议
3. 代码的优点
`;

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的代码审查助手，擅长分析代码质量并提供具体改进建议。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json() as DeepSeekResponse;
    const reviewText = data.choices[0]?.message?.content || '无法生成审查结果';

    // 从审查文本中提取建议
    const suggestions = extractSuggestions(reviewText);

    return {
      review: reviewText,
      suggestions,
    };
  } catch (error) {
    console.error('代码审查失败:', error);
    throw new Error(`代码审查失败: ${(error as Error).message}`);
  }
}

// 从审查文本中提取建议
function extractSuggestions(reviewText: string): string[] {
  // 简单的建议提取逻辑：寻找数字列表或破折号列表
  const suggestionRegexes = [
    /\d+\.\s+([^\n]+)/g,  // 数字列表：1. 建议内容
    /[-•]\s+([^\n]+)/g,   // 破折号或项目符号列表：- 建议内容
    /建议:\s+([^\n]+)/g,  // "建议："后面的内容
  ];

  const suggestions: string[] = [];
  for (const regex of suggestionRegexes) {
    let match;
    while ((match = regex.exec(reviewText)) !== null) {
      if (match[1] && match[1].length > 10) { // 过滤太短的建议
        suggestions.push(match[1].trim());
      }
    }
  }

  return suggestions.length > 0 ? suggestions : ['查看完整审查报告获取详细建议'];
} 