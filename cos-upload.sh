#!/bin/bash
# 上传图片到 COS 图床

# 加载环境变量
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# 运行上传脚本
node "$SCRIPT_DIR/scripts/cos-upload.cjs" "$@"
