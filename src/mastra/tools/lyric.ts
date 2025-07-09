import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import { generateDeepseekApiKey } from '../../utils/api-key-generator';

// 歌词生成回复类型
interface LyricResponse {
  lyrics: string;
  style: string;
  inspiration: string;
  rhyme_scheme: string;
}

// 声明全局类型，解决Cloudflare Worker环境变量访问问题
declare global {
  var env: Record<string, any> | undefined;
}

// Cloudflare Worker的self类型
interface CloudflareWorkerSelf extends Window {
  env?: Record<string, any>;
}

// 获取API密钥的函数，支持多种环境
function getApiKey(): string | undefined {
  // 1. 尝试从process.env获取（Node.js环境）
  console.log('检查环境变量 DEEPSEEK_API_KEY:', !!process.env.DEEPSEEK_API_KEY);
  if (process.env && process.env.DEEPSEEK_API_KEY) {
    const key = process.env.DEEPSEEK_API_KEY;
    console.log('使用环境变量 API 密钥，结尾:', key.slice(-4));
    return key;
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
  
  // 4. 只有在没有环境变量时才使用生成的密钥
  console.log('警告：未找到 DEEPSEEK_API_KEY 环境变量，使用备用密钥');
}

// 预定义的文学知识库（使用简单的内存存储）
const literaryKnowledgeMap = new Map();

// 预定义的文学知识库
const literaryKnowledge = [
  {
    id: '1',
    content: '古文典籍：诗经中的起兴手法，如"关关雎鸠，在河之洲"，通过自然景物引出情感',
    metadata: { type: 'classical', category: 'technique' }
  },
  {
    id: '2', 
    content: '韵脚规律：中文歌词常用韵母相同的字作韵脚，如ao韵（好、道、到、高），增强节奏感',
    metadata: { type: 'rhyme', category: 'technique' }
  },
  {
    id: '3',
    content: '方文山风格：善用古典意象，如"青花瓷"中的"帘外芭蕉惹骤雨"，融合古典与现代',
    metadata: { type: 'style', category: 'reference' }
  },
  {
    id: '4',
    content: '音律节拍：中文歌词注重声调变化，平仄相间产生音乐美感，如"明月几时有"的抑扬顿挫',
    metadata: { type: 'rhythm', category: 'technique' }
  },
  {
    id: '5',
    content: '典故运用："桃花潭水深千尺"引用李白诗句，增加文学底蕴和情感深度',
    metadata: { type: 'classical', category: 'reference' }
  },
  {
    id: '6',
    content: '情感层次：从浅到深，从具象到抽象，如先写"雨"再写"思念"，层层递进',
    metadata: { type: 'emotion', category: 'technique' }
  }
];

// 初始化知识库
function initializeKnowledgeBase() {
  for (const knowledge of literaryKnowledge) {
    literaryKnowledgeMap.set(knowledge.id, knowledge);
  }
  console.log('文学知识库初始化完成');
}

// 创建中文歌词生成工具
export const chineseLyricTool = createTool({
  id: 'chinese-lyric-generator',
  description: '基于RAG的中文歌词生成器，擅长古典文学与现代抒情结合',
  inputSchema: z.object({
    theme: z.string().describe('歌词主题或中心思想'),
    scene: z.string().optional().describe('场景描述'),
    emotion: z.string().optional().describe('情感基调，如忧伤、欢快、思念等'),
    style: z.string().optional().describe('期望的曲风，如民谣、流行、古风等'),
    length: z.enum(['short', 'medium', 'long']).optional().default('medium').describe('歌词长度')
  }),
  outputSchema: z.object({
    lyrics: z.string().describe('完整的歌词内容'),
    style: z.string().describe('推荐的曲风'),
    inspiration: z.string().describe('创作灵感说明'),
    rhyme_scheme: z.string().describe('韵脚规律说明')
  }),
  execute: async ({ context }) => {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error('未找到DeepSeek API密钥，请确保设置了DEEPSEEK_API_KEY环境变量');
    }

    // 确保知识库已初始化
    initializeKnowledgeBase();

    return await generateChineseLyrics(
      context.theme,
      apiKey,
      context.scene,
      context.emotion,
      context.style,
      context.length
    );
  },
});

// 生成中文歌词的核心逻辑
async function generateChineseLyrics(
  theme: string,
  apiKey: string,
  scene?: string,
  emotion?: string,
  style?: string,
  length: 'short' | 'medium' | 'long' = 'medium'
): Promise<LyricResponse> {
  try {
    // 1. 根据主题和情感检索相关知识
    const relevantKnowledge = searchRelevantKnowledge(theme, emotion, style);

    // 2. 构建带有知识的提示词
    const knowledgeContext = relevantKnowledge.map(k => k.content).join('\n');
    
    const lengthGuide = {
      'short': '2段，每段4行',
      'medium': '3-4段，每段4-6行', 
      'long': '4-5段，每段6-8行'
    };

    const systemPrompt = `你是一位精通古文与现代抒情散文的文学大师，同时深谙韵脚、音律之道。你的创作风格深受方文山影响，善于将古典意象与现代情感完美融合。

参考知识：
${knowledgeContext}

创作要求：
1. 引经据典，但不生硬，自然融入现代情感表达
2. 注重韵脚和音律，营造优美的音乐感
3. 使用丰富的意象和比喻，层次分明
4. 语言既有古典韵味又不失现代感
5. 歌词长度：${lengthGuide[length]}`;

    const userPrompt = `请为以下场景和主题创作一首完整的中文歌词：

主题：${theme}
${scene ? `场景：${scene}` : ''}
${emotion ? `情感基调：${emotion}` : ''}
${style ? `期望曲风：${style}` : ''}

请提供：
1. 完整歌词（包含主歌、副歌等结构）
2. 推荐的曲风说明
3. 创作灵感和典故说明
4. 韵脚规律分析`;

    // 3. 调用DeepSeek API生成歌词
    // 设置环境变量以确保DeepSeek能访问到API key
    const originalApiKey = process.env.DEEPSEEK_API_KEY;
    if (!originalApiKey) {
      process.env.DEEPSEEK_API_KEY = apiKey;
    }
    
    const response = await generateText({
      model: deepseek('deepseek-chat'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      maxTokens: 2000
    });

    // 4. 解析回复并结构化输出
    const generatedContent = response.text;
    
    return parseGeneratedLyrics(generatedContent, style);
  } catch (error) {
    console.error('歌词生成失败:', error);
    throw new Error(`歌词生成失败: ${(error as Error).message}`);
  }
}

// 解析生成的歌词内容
function parseGeneratedLyrics(content: string, requestedStyle?: string): LyricResponse {
  // 简单的内容解析逻辑
  const lines = content.split('\n');
  
  let lyrics = '';
  let style = requestedStyle || '古风流行';
  let inspiration = '';
  let rhyme_scheme = '';
  
  let currentSection = 'lyrics';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('曲风') || trimmedLine.includes('风格')) {
      currentSection = 'style';
      continue;
    } else if (trimmedLine.includes('灵感') || trimmedLine.includes('典故')) {
      currentSection = 'inspiration';
      continue;
    } else if (trimmedLine.includes('韵脚') || trimmedLine.includes('韵律')) {
      currentSection = 'rhyme';
      continue;
    }
    
    if (trimmedLine) {
      switch (currentSection) {
        case 'lyrics':
          lyrics += trimmedLine + '\n';
          break;
        case 'style':
          if (!trimmedLine.match(/^\d+\./)) {
            style = trimmedLine;
          }
          break;
        case 'inspiration':
          inspiration += trimmedLine + ' ';
          break;
        case 'rhyme':
          rhyme_scheme += trimmedLine + ' ';
          break;
      }
    }
  }
  
  // 如果解析失败，使用默认值
  if (!lyrics) {
    lyrics = content;
  }
  if (!inspiration) {
    inspiration = '融合古典文学意象与现代情感表达，营造诗意美感';
  }
  if (!rhyme_scheme) {
    rhyme_scheme = '采用押韵结构，注重音律和节奏的和谐统一';
  }
  
  return {
    lyrics: lyrics.trim(),
    style: style.trim(),
    inspiration: inspiration.trim(),
    rhyme_scheme: rhyme_scheme.trim()
  };
}

// 搜索相关知识的简单实现
function searchRelevantKnowledge(theme: string, emotion?: string, style?: string): any[] {
  const searchTerms = [theme, emotion, style].filter(Boolean).join(' ').toLowerCase();
  const relevantKnowledge = [];
  
  for (const [, knowledge] of literaryKnowledgeMap) {
    const content = knowledge.content.toLowerCase();
    
    // 简单的关键词匹配
    if (content.includes('古文') || content.includes('韵脚') || content.includes('音律') ||
        searchTerms.includes('古典') || searchTerms.includes('韵律') || 
        (emotion && (content.includes('情感') || content.includes('抒情'))) ||
        (style && content.includes('风格'))) {
      relevantKnowledge.push(knowledge);
    }
  }
  
  // 如果没有找到相关知识，返回所有知识
  if (relevantKnowledge.length === 0) {
    return Array.from(literaryKnowledgeMap.values()).slice(0, 3);
  }
  
  return relevantKnowledge.slice(0, 3);
}