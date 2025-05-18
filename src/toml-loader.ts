/**
 * 从wrangler.toml加载配置到process.env
 * 在mastra开发环境中使用
 */
import * as fs from 'fs';
import * as path from 'path';

// 简单的TOML解析函数，专门用于解析vars部分
function parseTomlVars(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  let inVarsSection = false;
  
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 检查是否进入vars部分
    if (trimmedLine === '[vars]') {
      inVarsSection = true;
      continue;
    }
    
    // 检查是否离开vars部分（进入新部分）
    if (inVarsSection && trimmedLine.startsWith('[') && !trimmedLine.startsWith('[vars]')) {
      inVarsSection = false;
      continue;
    }
    
    // 如果在vars部分，解析键值对
    if (inVarsSection && trimmedLine && !trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^(.+?)\s*=\s*["'](.*)["']$/);
      if (match) {
        const [, key, value] = match;
        vars[key.trim()] = value;
      }
    }
  }
  
  return vars;
}

/**
 * 加载wrangler.toml中的变量到process.env
 */
export function loadWranglerConfig() {
  try {
    const wranglerPath = path.resolve(process.cwd(), 'wrangler.toml');
    
    if (!fs.existsSync(wranglerPath)) {
      console.warn('未找到wrangler.toml文件，跳过环境变量加载');
      return;
    }
    
    const content = fs.readFileSync(wranglerPath, 'utf-8');
    const vars = parseTomlVars(content);
    
    // 将变量加载到process.env
    Object.entries(vars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
    
    console.log(`成功从wrangler.toml加载了${Object.keys(vars).length}个环境变量`);
  } catch (error) {
    console.error('加载wrangler.toml配置失败:', error);
  }
}

// 在导入时自动执行
loadWranglerConfig(); 