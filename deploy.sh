#!/bin/bash

# 部署脚本 - 构建并部署到Cloudflare Workers

# 输出彩色文本
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Mastra应用部署脚本 ===${NC}"

# 1. 构建应用
echo -e "${BLUE}[1/2] 构建应用...${NC}"
npm run build

# 检查构建结果
if [ $? -ne 0 ]; then
  echo -e "${RED}构建失败，中止部署${NC}"
  exit 1
fi

echo -e "${GREEN}构建成功!${NC}"

# 2. 部署到Cloudflare Workers
echo -e "${BLUE}[2/2] 部署到Cloudflare Workers...${NC}"
npx wrangler deploy --config .mastra/output/wrangler.json

# 检查部署结果
if [ $? -ne 0 ]; then
  echo -e "${RED}部署失败${NC}"
  exit 1
fi

echo -e "${GREEN}部署成功!${NC}"
echo -e "${BLUE}============================${NC}" 