import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

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
    const apiKey = process.env.DEEPSEEK_API_KEY || '';
    if (!apiKey) {
      throw new Error('未找到DeepSeek API密钥，请确保设置了DEEPSEEK_API_KEY环境变量');
    }
    
    return await reviewCode(context.code, context.language, context.focus, apiKey);
  },
});

// 调用DeepSeek API进行代码审查
const reviewCode = async (
  code: string,
  language: string = '',
  focus: string = '',
  apiKey: string
) => {
  const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  
  // 构建审查提示
  let prompt = `请对以下${language ? language + '语言的' : ''}代码进行全面审查`;
  if (focus) {
    prompt += `，重点关注${focus}方面`;
  }
  prompt += `:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n请提供详细的审查意见，指出代码中的问题并给出改进建议。`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-coder',
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API请求失败: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as DeepSeekResponse;
    
    // 解析API响应
    const reviewContent = data.choices[0].message.content;
    
    // 提取建议
    const suggestionPattern = /(?:建议|推荐|应该|可以|最好|需要)[^。！？\n]+/g;
    const suggestions = (reviewContent.match(suggestionPattern) || [])
      .filter(s => s.length > 5)
      .slice(0, 10);
    
    return {
      review: reviewContent,
      suggestions: suggestions.length > 0 ? suggestions : ['根据代码分析不需要特别改进'],
    };
  } catch (error) {
    throw new Error(`代码审查失败: ${(error as Error).message}`);
  }
}; 