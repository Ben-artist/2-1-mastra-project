#!/bin/bash

# 检查4111端口占用情况
PORT_PID=$(lsof -t -i:4111)

# 如果有进程占用此端口，杀死它们
if [ ! -z "$PORT_PID" ]; then
  echo "端口4111被进程 $PORT_PID 占用，正在终止..."
  kill -9 $PORT_PID
  echo "✅ 端口4111已释放"
else
  echo "✅ 端口4111空闲，可以启动服务"
fi

# 启动开发服务器
echo "🚀 启动Mastra开发服务器..."
npm run dev 