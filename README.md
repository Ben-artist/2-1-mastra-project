# My Mastra App - MCP智能助手项目

## 项目简介

这是一个基于Mastra框架的MCP（Model Context Protocol）智能助手项目，集成了多种AI工具和服务，包括百度地图API、歌词生成、天气查询等功能。

## 项目架构

```
my-mastra-app/
├── src/
│   ├── mastra/           # Mastra核心配置
│   │   ├── agents/       # AI智能体
│   │   │   └── lyricGen.ts    # 歌词生成智能体
│   │   ├── tools/        # 工具集合
│   │   │   ├── index.ts       # 天气查询工具
│   │   │   ├── lyric.ts       # 歌词生成工具
│   │   │   └── deepseek.ts    # DeepSeek AI集成
│   │   └── index.ts      # Mastra主配置文件
│   └── toml-loader.ts    # 配置文件加载器
├── package.json          # 项目依赖配置
├── tsconfig.json         # TypeScript配置
└── start-dev.sh          # 开发环境启动脚本
```

## 核心功能

### 1. 百度地图MCP服务
- **地理编码服务**: 将地址转换为经纬度坐标
- **逆地理编码**: 将经纬度坐标转换为地址信息
- **地点检索**: 搜索特定区域内的地点
- **路线规划**: 计算出发地到目的地的路线
- **天气查询**: 获取指定位置的天气信息
- **交通路况**: 查询道路实时拥堵情况

### 2. 中文歌词生成
- **智能创作**: 基于主题和场景自动生成歌词
- **古典融合**: 结合古典文学意象与现代情感
- **韵脚优化**: 自动优化歌词的韵律和节奏
- **风格推荐**: 根据内容推荐合适的曲风

### 3. 天气查询工具
- **全球天气**: 支持全球城市的天气查询
- **实时数据**: 获取当前温度、湿度、风速等信息
- **天气代码**: 自动转换天气代码为可读描述

## 安装和配置

### 环境要求
- Node.js >= 20.9.0
- npm 或 pnpm 或 yarn

### 安装依赖
```bash
# 使用npm
npm install

# 使用pnpm
pnpm install

# 使用yarn
yarn install
```

### 环境变量配置
创建 `.env` 文件并配置以下API密钥：

```bash
# DeepSeek AI API密钥（用于歌词生成）
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 百度地图API密钥（用于地图服务）
BAIDU_MAP_API_KEY=your_baidu_map_api_key_here
```

## 使用方法

### 1. 启动开发环境
```bash
# 使用npm
npm run dev

# 使用pnpm
pnpm dev

# 使用yarn
yarn dev

# 或使用启动脚本
bash ./start-dev.sh
```

### 2. 使用百度地图MCP服务

#### 地理编码（地址转坐标）
```typescript
// 将地址转换为经纬度坐标
const result = await mcp_baidu_map_map_geocode({
  address: "北京市海淀区中关村大街1号"
});
console.log(result);
```

#### 逆地理编码（坐标转地址）
```typescript
// 将经纬度坐标转换为地址
const result = await mcp_baidu_map_map_reverse_geocode({
  latitude: 39.915,
  longitude: 116.404
});
console.log(result);
```

#### 地点检索
```typescript
// 搜索特定区域内的地点
const result = await mcp_baidu_map_map_search_places({
  query: "咖啡厅",
  region: "北京市"
});
console.log(result);
```

#### 路线规划
```typescript
// 计算从起点到终点的路线
const result = await mcp_baidu_map_map_directions({
  origin: "39.915,116.404",
  destination: "39.925,116.414",
  mode: "driving"
});
console.log(result);
```

#### 天气查询
```typescript
// 获取指定位置的天气信息
const result = await mcp_baidu_map_map_weather({
  location: "116.404,39.915"
});
console.log(result);
```

### 3. 使用歌词生成工具

#### 基本歌词生成
```typescript
import { chineseLyricTool } from './src/mastra/tools/lyric';

const result = await chineseLyricTool.execute({
  theme: "思念故乡",
  scene: "月圆之夜",
  emotion: "思乡",
  style: "古风",
  length: "medium"
});

console.log(result.lyrics);        // 生成的歌词
console.log(result.style);         // 推荐曲风
console.log(result.inspiration);   // 创作灵感
console.log(result.rhyme_scheme);  // 韵脚规律
```

#### 高级歌词生成
```typescript
// 生成短篇歌词
const shortLyric = await chineseLyricTool.execute({
  theme: "青春梦想",
  scene: "校园时光",
  emotion: "激情",
  style: "流行",
  length: "short"
});

// 生成长篇歌词
const longLyric = await chineseLyricTool.execute({
  theme: "人生感悟",
  scene: "人生旅途",
  emotion: "深沉",
  style: "民谣",
  length: "long"
});
```

### 4. 使用天气查询工具

```typescript
import { weatherTool } from './src/mastra/tools';

const weather = await weatherTool.execute({
  location: "北京"
});

console.log(`温度: ${weather.temperature}°C`);
console.log(`体感温度: ${weather.feelsLike}°C`);
console.log(`湿度: ${weather.humidity}%`);
console.log(`风速: ${weather.windSpeed} km/h`);
console.log(`天气状况: ${weather.conditions}`);
```

## 开发指南

### 添加新的MCP服务
1. 在 `src/mastra/tools/` 目录下创建新的工具文件
2. 使用 `createTool` 函数定义工具接口
3. 在 `src/mastra/index.ts` 中注册新的工具
4. 更新README文档

### 创建新的智能体
1. 在 `src/mastra/agents/` 目录下创建新的智能体文件
2. 定义智能体的指令和工具
3. 在 `src/mastra/index.ts` 中注册新的智能体

### 自定义工具
```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const myCustomTool = createTool({
  id: 'my-custom-tool',
  description: '我的自定义工具描述',
  inputSchema: z.object({
    // 定义输入参数
    input: z.string().describe('输入描述')
  }),
  outputSchema: z.object({
    // 定义输出结构
    result: z.string().describe('输出结果')
  }),
  execute: async ({ context }) => {
    // 实现工具逻辑
    return { result: `处理结果: ${context.input}` };
  },
});
```

## 部署

### 本地开发
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 云部署
项目支持Cloudflare部署：
```bash
npm run deploy
```

## 故障排除

### 常见问题

1. **API密钥错误**
   - 确保环境变量正确设置
   - 检查API密钥是否有效
   - 验证API服务配额

2. **依赖安装失败**
   - 清除node_modules并重新安装
   - 检查Node.js版本兼容性
   - 使用不同的包管理器

3. **TypeScript编译错误**
   - 检查tsconfig.json配置
   - 确保所有类型定义正确
   - 更新TypeScript版本

### 调试模式
启用详细日志：
```typescript
logger: new ConsoleLogger({
  name: 'Mastra',
  level: 'debug', // 设置为debug级别
}),
```

## 贡献指南

1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request
5. 等待代码审查

## 许可证

ISC License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: your-email@example.com

## 更新日志

### v1.0.0
- 初始版本发布
- 集成百度地图MCP服务
- 实现中文歌词生成功能
- 添加天气查询工具
- 支持Mastra框架集成
