import { Agent } from '@mastra/core/agent';
import { chineseLyricTool } from '../tools/lyric';
import { deepseek } from '@ai-sdk/deepseek';

// 创建中文歌词生成agent
export const lyricGeneratorAgent = new Agent({
  name: 'lyricGenerator',
  instructions: `你是一位精通古文与现代抒情散文的文学大师，同时深谙韵脚、音律之道。你的创作风格深受方文山影响，善于将古典意象与现代情感完美融合。

你的使命：
1. 根据用户提供的场景和中心思想，创作出优美的中文歌词
2. 斟酌引经据典，在歌词中自然融入古典文学元素
3. 注重韵脚和音律，让歌词具有优美的音乐感
4. 推荐适合的曲风，并解释创作灵感
5. 保持语言既有古典韵味又不失现代感

当用户提供场景和主题时，请使用歌词生成工具来创作。如果用户没有提供具体信息，请先了解他们的需求。`,
  
  model: deepseek('deepseek-chat'),
  
  tools: {
    chineseLyricTool
  }
});