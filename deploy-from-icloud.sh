#!/bin/bash

# =========================================
# 从 iCloud Drive 日记构建并部署网站
# =========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}==========================================${NC}"
echo -e "${BLUE}${BOLD}  iCloud 日记同步部署工具${NC}"
echo -e "${BLUE}${BOLD}==========================================${NC}"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ICLOUD_PATH="$HOME/Library/Mobile Documents/com~apple~CloudDocs/personal-website-diary/diary"

# 检查 iCloud Drive 文件夹是否存在
echo -e "${BLUE}📂 检查 iCloud Drive 同步状态...${NC}"

if [ ! -d "$ICLOUD_PATH" ]; then
    echo -e "${RED}❌ 错误：iCloud Drive 日记文件夹不存在${NC}"
    echo ""
    echo "💡 请先创建 iCloud Drive 同步文件夹："
    echo "1. 创建文件夹："
    echo "   mkdir -p ~/Library/Mobile\\ Documents/com~apple~CloudDocs/personal-website-diary/diary"
    echo "2. 迁移现有日记："
    echo "   cp -r public/diary/* ~/Library/Mobile\\ Documents/com~apple~CloudDocs/personal-website-diary/diary/"
    echo "3. 创建软链接："
    echo "   rm -rf public/diary && ln -s ~/Library/Mobile\\ Documents/com~apple~CloudDocs/personal-website-diary/diary public/diary"
    exit 1
fi

echo -e "${GREEN}✅ 检测到 iCloud Drive: ${ICLOUD_PATH}${NC}"

# 检查软链接
if [ ! -L "$PROJECT_DIR/public/diary" ]; then
    echo -e "${YELLOW}⚠️  public/diary 不是软链接${NC}"
    echo ""
    read -p "是否现在创建软链接？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_DIR/public"
        rm -rf diary
        ln -s "$ICLOUD_PATH" diary
        echo -e "${GREEN}✅ 软链接创建成功${NC}"
    else
        echo -e "${YELLOW}⚠️  跳过软链接创建，可能影响日记读取${NC}"
    fi
fi

echo -e "${GREEN}✅ iCloud Drive 同步正常${NC}"
echo ""

# 显示最新日记
echo -e "${BLUE}📚 最近的日记:${NC}"
ls -lt "$ICLOUD_PATH" 2>/dev/null | head -6
echo ""

# 统计日记数量
DIARY_COUNT=$(find "$ICLOUD_PATH" -maxdepth 1 -type d | wc -l)
DIARY_COUNT=$((DIARY_COUNT - 1))
echo -e "${BLUE}📊 共有 ${BOLD}$DIARY_COUNT${NC}${BLUE} 篇日记${NC}"
echo ""

# 询问是否继续
read -p "是否继续构建并部署？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  已取消操作${NC}"
    exit 0
fi

cd "$PROJECT_DIR"

# 转换伪装成图片的 HEIC 文件（iPhone 截图/照片改后缀后仍是 HEIC，浏览器无法显示）
echo ""
echo -e "${BLUE}🖼️  检查并转换 HEIC 图片...${NC}"
HEIC_COUNT=0
while IFS= read -r -d '' f; do
  if file "$f" | grep -q "HEIF\|HEIC"; then
    sips -s format png "$f" --out "$f" > /dev/null 2>&1 && \
      echo "  转换: $(basename "$f")" && HEIC_COUNT=$((HEIC_COUNT+1))
  fi
done < <(find "$ICLOUD_PATH" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)
if [ $HEIC_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ 转换了 $HEIC_COUNT 个 HEIC 文件${NC}"
else
  echo -e "${GREEN}✅ 无需转换${NC}"
fi

# 修复媒体文件权限（确保 Vercel 静态服务可读）
echo ""
echo -e "${BLUE}🔑 修复媒体文件权限...${NC}"
find "$ICLOUD_PATH" -type f ! -perm 644 -exec chmod 644 {} \;
echo -e "${GREEN}✅ 权限修复完成${NC}"

# 生成日记数据
echo ""
echo -e "${BLUE}🔧 生成日记数据...${NC}"
npm run generate:diaries

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 生成日记数据失败${NC}"
    exit 1
fi

# 构建
echo ""
echo -e "${BLUE}🏗️  构建网站...${NC}"
vercel build --prod --yes

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi

# 部署
echo ""
echo -e "${BLUE}🚀 部署到 Vercel...${NC}"
vercel --prod --yes --prebuilt

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}${BOLD}✅ 部署完成！${NC}"
    echo ""
    echo -e "${BLUE}🌐 访问：https://hins-wong.vercel.app${NC}"
else
    echo ""
    echo -e "${RED}❌ 部署失败，请检查网络连接${NC}"
    exit 1
fi
