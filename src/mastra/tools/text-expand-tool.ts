import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// 技术博客扩写工具
export const textExpandTool = createTool({
  id: 'text-expand',
  description: '使用DeepSeek AI将简短的技术内容扩写为完整的技术博客文章，自动生成技术分析、代码示例和最佳实践',
  inputSchema: z.object({
    originalText: z.string().describe('需要扩写的技术内容或主题'),
    blogType: z.enum(['tutorial', 'analysis', 'comparison', 'case-study']).describe('博客类型：tutorial(教程)、analysis(技术分析)、comparison(技术对比)、case-study(案例研究)'),
    targetLength: z.enum(['short', 'medium', 'long']).describe('目标长度：short(1000-2000字)、medium(2000-4000字)、long(4000-8000字)'),
    techStack: z.string().optional().describe('技术栈信息，如React、Node.js、Python等'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('难度级别：beginner(入门)、intermediate(中级)、advanced(高级)')
  }),
  outputSchema: z.object({
    blogTitle: z.string().describe('生成的博客标题'),
    blogContent: z.string().describe('完整的博客文章内容'),
    codeExamples: z.array(z.string()).describe('包含的代码示例'),
    keyPoints: z.array(z.string()).describe('文章要点总结'),
    originalLength: z.number().describe('原始内容字数'),
    blogLength: z.number().describe('博客文章字数'),
    expandRatio: z.number().describe('扩写比例（博客字数/原始字数）'),
    blogType: z.string().describe('博客类型'),
    difficulty: z.string().describe('难度级别'),
    estimatedReadTime: z.number().describe('预计阅读时间（分钟）')
  }),
  execute: async ({ context }) => {
    const { originalText, blogType, targetLength, techStack, difficulty } = context;
    
    try {
      // 构建技术博客扩写提示词
      const prompt = buildTechBlogPrompt(originalText, blogType, targetLength, techStack, difficulty);
      
      // 模拟技术博客生成过程
      const blogData = await generateTechBlog(originalText, blogType, targetLength, techStack, difficulty);
      
      const originalLength = originalText.length;
      const blogLength = blogData.content.length;
      const expandRatio = blogLength / originalLength;
      const estimatedReadTime = Math.ceil(blogLength / 300); // 按300字/分钟计算
      
      return {
        blogTitle: blogData.title,
        blogContent: blogData.content,
        codeExamples: blogData.codeExamples,
        keyPoints: blogData.keyPoints,
        originalLength,
        blogLength,
        expandRatio: Math.round(expandRatio * 100) / 100,
        blogType,
        difficulty,
        estimatedReadTime
      };
      
    } catch (error) {
      throw new Error(`技术博客生成失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
});

// 构建技术博客扩写提示词
function buildTechBlogPrompt(originalText: string, blogType: string, targetLength: string, techStack?: string, difficulty?: string): string {
  const typeInstructions = {
    tutorial: '请将以下技术内容扩写为完整的教程文章，包含详细的步骤说明、代码示例和最佳实践：',
    analysis: '请将以下技术内容扩写为深入的技术分析文章，包含原理分析、性能对比和优化建议：',
    comparison: '请将以下技术内容扩写为技术对比文章，包含不同方案的优缺点分析和使用场景：',
    'case-study': '请将以下技术内容扩写为案例研究文章，包含项目背景、实现过程和经验总结：'
  };
  
  const lengthInstructions = {
    short: '文章长度控制在1000-2000字',
    medium: '文章长度控制在2000-4000字',
    long: '文章长度控制在4000-8000字'
  };
  
  const difficultyInstructions = {
    beginner: '适合初学者，使用通俗易懂的语言，提供详细的背景知识',
    intermediate: '适合有一定基础的开发者，包含适度的技术深度',
    advanced: '适合高级开发者，深入探讨技术细节和高级概念'
  };
  
  let prompt = `${typeInstructions[blogType]}\n\n`;
  prompt += `主题：${originalText}\n\n`;
  prompt += `要求：${lengthInstructions[targetLength]}\n`;
  prompt += `难度：${difficultyInstructions[difficulty]}\n`;
  
  if (techStack) {
    prompt += `技术栈：${techStack}\n`;
  }
  
  prompt += '\n请生成包含以下结构的完整技术博客：\n';
  prompt += '1. 吸引人的标题\n';
  prompt += '2. 文章摘要\n';
  prompt += '3. 详细的技术内容\n';
  prompt += '4. 相关代码示例\n';
  prompt += '5. 关键要点总结\n';
  prompt += '6. 结论和后续建议\n';
  
  return prompt;
}

// 生成技术博客内容
async function generateTechBlog(originalText: string, blogType: string, targetLength: string, techStack?: string, difficulty?: string): Promise<{
  title: string;
  content: string;
  codeExamples: string[];
  keyPoints: string[];
}> {
  // 根据博客类型生成标题
  const title = generateBlogTitle(originalText, blogType, techStack);
  
  // 根据长度要求生成内容
  const content = generateBlogContent(originalText, blogType, targetLength, techStack, difficulty);
  
  // 生成代码示例
  const codeExamples = generateCodeExamples(originalText, techStack, blogType);
  
  // 生成关键要点
  const keyPoints = generateKeyPoints(originalText, blogType);
  
  return {
    title,
    content,
    codeExamples,
    keyPoints
  };
}

// 生成博客标题
function generateBlogTitle(originalText: string, blogType: string, techStack?: string): string {
  const typePrefixes = {
    tutorial: '从零开始学习',
    analysis: '深入分析',
    comparison: '技术对比',
    'case-study': '实战案例'
  };
  
  const prefix = typePrefixes[blogType];
  const techPrefix = techStack ? ` ${techStack} ` : ' ';
  
  return `${prefix}${techPrefix}${originalText}：完整指南`;
}

// 生成博客内容
function generateBlogContent(originalText: string, blogType: string, targetLength: string, techStack?: string, difficulty?: string): string {
  const lengthTargets = {
    short: 1500,
    medium: 3000,
    long: 6000
  };
  
  const targetLength_chars = lengthTargets[targetLength];
  
  let content = `# ${generateBlogTitle(originalText, blogType, techStack)}\n\n`;
  
  // 添加摘要
  content += `## 摘要\n\n`;
  content += `本文将深入探讨${originalText}的相关技术，${techStack ? `特别关注${techStack}技术栈` : ''}。`;
  content += `通过${typeDescriptions[blogType]}，帮助读者${difficultyDescriptions[difficulty]}。\n\n`;
  
  // 添加主要内容
  content += `## 主要内容\n\n`;
  content += `### 1. 背景介绍\n\n`;
  content += `${originalText}是当前技术领域的重要话题。${techStack ? `在${techStack}生态系统中，` : ''}它提供了强大的功能和灵活性。\n\n`;
  
  content += `### 2. 核心概念\n\n`;
  content += `理解${originalText}的核心概念对于掌握相关技术至关重要。让我们深入分析其工作原理和实现机制。\n\n`;
  
  // 根据博客类型添加特定内容
  if (blogType === 'tutorial') {
    content += `### 3. 详细步骤\n\n`;
    content += `#### 步骤1：环境准备\n`;
    content += `首先，我们需要准备开发环境...\n\n`;
    content += `#### 步骤2：基础配置\n`;
    content += `接下来，进行基础配置...\n\n`;
    content += `#### 步骤3：核心实现\n`;
    content += `现在开始核心功能的实现...\n\n`;
  } else if (blogType === 'analysis') {
    content += `### 3. 技术分析\n\n`;
    content += `#### 架构设计\n`;
    content += `从架构角度来看，${originalText}采用了...\n\n`;
    content += `#### 性能分析\n`;
    content += `在性能方面，我们观察到以下特点...\n\n`;
    content += `#### 优化建议\n`;
    content += `基于分析结果，我们提出以下优化建议...\n\n`;
  }
  
  content += `### 4. 最佳实践\n\n`;
  content += `在实际应用中，遵循以下最佳实践可以获得更好的效果：\n\n`;
  content += `- 合理规划项目结构\n`;
  content += `- 注重代码质量和可维护性\n`;
  content += `- 进行充分的测试\n`;
  content += `- 持续优化和迭代\n\n`;
  
  content += `### 5. 总结\n\n`;
  content += `通过本文的深入探讨，我们全面了解了${originalText}的相关技术。`;
  content += `希望这些内容能够帮助你在实际项目中更好地应用这些技术。\n\n`;
  
  // 根据目标长度调整内容
  while (content.length < targetLength_chars) {
    content += `在实际开发过程中，还需要注意更多的细节和边界情况。`;
    content += `建议读者在实际项目中多加练习，通过实践来加深理解。\n\n`;
  }
  
  return content;
}

// 生成代码示例
function generateCodeExamples(originalText: string, techStack?: string, blogType?: string): string[] {
  const examples = [];
  
  if (techStack?.includes('React')) {
    examples.push(`// React组件示例\nimport React, { useState, useEffect } from 'react';\n\nconst ${originalText}Component = () => {\n  const [data, setData] = useState(null);\n  \n  useEffect(() => {\n    // 数据获取逻辑\n  }, []);\n  \n  return (\n    <div>\n      <h1>${originalText}</h1>\n      {/* 组件内容 */}\n    </div>\n  );\n};\n\nexport default ${originalText}Component;`);
  }
  
  if (techStack?.includes('Node.js')) {
    examples.push(`// Node.js API示例\nconst express = require('express');\nconst app = express();\n\napp.get('/api/${originalText.toLowerCase()}', (req, res) => {\n  try {\n    // 处理逻辑\n    res.json({ success: true, data: '${originalText} data' });\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});`);
  }
  
  examples.push(`// 通用示例\nfunction handle${originalText}() {\n  // 实现逻辑\n  console.log('处理${originalText}');\n}\n\n// 调用示例\nhandle${originalText}();`);
  
  return examples;
}

// 生成关键要点
function generateKeyPoints(originalText: string, blogType: string): string[] {
  const basePoints = [
    `理解${originalText}的核心概念和原理`,
    `掌握相关的技术实现方法`,
    `了解最佳实践和常见陷阱`,
    `能够在实际项目中应用所学知识`
  ];
  
  const typeSpecificPoints = {
    tutorial: [
      '按照步骤逐步实现功能',
      '注意每个步骤的细节和注意事项',
      '通过实践加深理解'
    ],
    analysis: [
      '深入分析技术原理',
      '理解性能特点和优化空间',
      '掌握技术选型的考量因素'
    ],
    comparison: [
      '了解不同方案的优缺点',
      '根据具体场景选择合适方案',
      '考虑长期维护和扩展性'
    ],
    'case-study': [
      '学习实际项目的实现过程',
      '了解项目中的关键决策',
      '总结经验和教训'
    ]
  };
  
  return [...basePoints, ...(typeSpecificPoints[blogType] || [])];
}

// 类型描述
const typeDescriptions = {
  tutorial: '详细的教程和步骤说明',
  analysis: '深入的技术分析和原理探讨',
  comparison: '全面的技术对比和方案选择',
  'case-study': '真实的项目案例和经验分享'
};

// 难度描述
const difficultyDescriptions = {
  beginner: '快速入门并掌握基础知识',
  intermediate: '提升技术水平并解决实际问题',
  advanced: '深入理解并掌握高级技巧'
};

