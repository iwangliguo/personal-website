#!/usr/bin/env node
/**
 * cos-upload - 上传图片到 COS 并自动替换 markdown 中的引用
 * 
 * 支持:
 * - Typora 正文图片上传
 * - frontmatter 中的 coverImage, covers, images, videos, audios
 * 
 * Typora 配置:
 * 偏好设置 → 图像 → 上传本地图片 → Custom Command
 * 命令: /path/to/project/scripts/cos-upload.cjs
 */

const COS = require('cos-nodejs-sdk-v5');
const pathModule = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ============ 环境变量加载 ============
const envPath = pathModule.join(__dirname, '..', '.env');
let envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.substring(0, idx).trim();
        const value = line.substring(idx + 1).trim();
        envVars[key] = value;
      }
    }
  });
}

const secretId = process.env.COS_SECRET_ID || envVars.COS_SECRET_ID;
const secretKey = process.env.COS_SECRET_KEY || envVars.COS_SECRET_KEY;

if (!secretId || !secretKey) {
  console.error('错误: 请设置 COS_SECRET_ID 和 COS_SECRET_KEY');
  process.exit(1);
}

const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
const bucket = 'hins-1417576783';
const region = 'ap-shanghai';
const cosBaseUrl = `https://${bucket}.cos.${region}.myqcloud.com`;
const tempDir = '/tmp/picgo-upload';

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ============ 工具函数 ============
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============ Typora 交互 ============

// 从 Typora 的 TMPDIR 获取最新图片
function getTyporaImage() {
  try {
    const tmpFiles = fs.readdirSync(process.env.TMPDIR);
    const now = Date.now();
    // 只选择最近 30 秒内修改的图片，避免获取到旧的缓存文件
    const recentImages = tmpFiles
      .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
      .map(f => {
        const stat = fs.statSync(pathModule.join(process.env.TMPDIR, f));
        return { name: f, path: pathModule.join(process.env.TMPDIR, f), mtime: stat.mtime, age: now - stat.mtimeMs };
      })
      .filter(f => f.age < 30000) // 30秒内的文件
      .sort((a, b) => b.mtime - a.mtime);
    
    if (recentImages.length > 0) {
      return recentImages[0].path;
    }
  } catch (e) {}
  return null;
}

// 获取 Typora 进程 PID
function getTyporaPid() {
  const { execSync } = require('child_process');
  try {
    const pid = execSync("pgrep -ix Typora", { encoding: 'utf-8', timeout: 3000 }).trim();
    return pid ? pid.split('\n')[0] : null;
  } catch (e) {
    try {
      const output = execSync("ps aux | grep -i 'Typora.app' | grep -v grep | head -1", { encoding: 'utf-8', timeout: 3000 }).trim();
      const match = output.match(/\d+/);
      return match ? match[0] : null;
    } catch (e2) {
      return null;
    }
  }
}

// 通过 lsof 获取 Typora 当前打开的 markdown 文件
function getTyporaMarkdownPath() {
  const { execSync } = require('child_process');
  try {
    const pid = getTyporaPid();
    if (!pid) return null;
    
    // 获取该进程打开的所有文件
    const lsof = execSync(`lsof -p ${pid} -a -c Typora 2>/dev/null`, { encoding: 'utf-8', timeout: 5000 });
    
    // 查找 personal-website 目录下的 md 文件
    const lines = lsof.split('\n');
    for (const line of lines) {
      if (line.includes('personal-website') && (line.includes('.md') || line.includes('.markdown'))) {
        const parts = line.split(/\s+/);
        const filePath = parts[parts.length - 1];
        if (filePath && fs.existsSync(filePath)) {
          return filePath;
        }
      }
    }
  } catch (e) {}
  
  // 如果 lsof 失败，尝试查找最近修改的 md 文件
  return getRecentMarkdownFile();
}

// 查找最近修改的 md 文件（在 personal-website 目录下）
function getRecentMarkdownFile() {
  const publicDir = pathModule.join(__dirname, '..', 'public');
  const now = Date.now();
  let recentFile = null;
  let recentTime = 0;
  
  function scanDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          scanDir(pathModule.join(dir, entry.name));
        } else if (entry.name.endsWith('.md')) {
          const filePath = pathModule.join(dir, entry.name);
          try {
            const stat = fs.statSync(filePath);
            const age = now - stat.mtimeMs;
            // 优先选择最近 5 分钟内修改的 md 文件
            if (age < 5 * 60 * 1000 && stat.mtimeMs > recentTime) {
              recentTime = stat.mtimeMs;
              recentFile = filePath;
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
  
  scanDir(publicDir);
  return recentFile;
}

// ============ 类型检测 ============

// 从 Markdown 文件解析 type
function getTypeFromMarkdown(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return 'diary';
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // 读取前 15 行查找 type 字段
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    const match = line.match(/^type\s*[:=]\s*(\w+)/i);
    if (match) {
      const type = match[1].toLowerCase();
      const validTypes = ['diary', 'technique', 'publication', 'project'];
      if (validTypes.includes(type)) {
        return type;
      }
    }
  }
  
  // 从路径推断
  if (filePath.includes('/diary/')) return 'diary';
  if (filePath.includes('/techniques/')) return 'technique';
  if (filePath.includes('/projects/')) return 'project';
  if (filePath.includes('/publications/')) return 'publication';
  
  return 'diary';
}

// ============ Frontmatter 解析 ============

// 解析 frontmatter 中的媒体文件路径
function parseFrontmatterMedia(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const mediaFiles = [];
  
  // 检查是否有 frontmatter
  if (!content.startsWith('---')) return mediaFiles;
  
  const endIndex = content.indexOf('\n---', 3);
  if (endIndex === -1) return mediaFiles;
  
  const frontmatter = content.substring(3, endIndex).trim();
  const lines = frontmatter.split('\n');
  
  let currentArray = null;
  
  for (const line of lines) {
    // 检测数组开始 (2空格 + -)
    if (line.match(/^  - /)) {
      const value = line.replace(/^  - /, '').trim();
      // 只收集非 http 的本地文件
      if (value && !value.startsWith('http')) {
        if (currentArray === 'images' || currentArray === 'covers') {
          mediaFiles.push({ field: 'images', value, line });
        } else if (currentArray === 'videos') {
          mediaFiles.push({ field: 'videos', value, line });
        } else if (currentArray === 'audios') {
          mediaFiles.push({ field: 'audios', value, line });
        }
      }
      continue;
    }
    
    // 检测键值对
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const value = kvMatch[2].trim();
      
      // 更新当前数组状态
      if (['images', 'covers', 'videos', 'audios'].includes(key)) {
        currentArray = key;
      } else {
        currentArray = null;
      }
      
      // 处理 coverImage
      if (key === 'coverImage' && value && !value.startsWith('http')) {
        mediaFiles.push({ field: 'coverImage', value, line });
      }
      
      // 空数组重置
      if (value === '[]') {
        currentArray = null;
      }
    } else if (!line.match(/^  /)) {
      // 非缩进行，重置数组状态
      currentArray = null;
    }
  }
  
  return mediaFiles;
}

// 将本地路径转换为绝对路径
function resolveMediaPath(relativePath, mdFilePath) {
  const mdDir = pathModule.dirname(mdFilePath);
  
  if (relativePath.startsWith('./')) {
    return pathModule.join(mdDir, relativePath.slice(2));
  } else if (relativePath.startsWith('../')) {
    return pathModule.join(mdDir, relativePath);
  } else {
    return pathModule.join(mdDir, relativePath);
  }
}

// ============ 文件上传 ============

// 生成 COS 路径
function generateKey(sourcePath, mdPath, fileType, mediaType) {
  const ext = pathModule.extname(sourcePath) || '.png';
  const basename = pathModule.basename(sourcePath, ext);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '-');
  
  // 清理文件名
  const cleanName = basename.replace(/[^\w\u4e00-\u9fa5-]/g, '-').replace(/-+/g, '-');
  
  // 从 markdown 文件名提取标识
  let cleanMdName = 'unknown';
  if (mdPath) {
    const mdBasename = pathModule.basename(mdPath, pathModule.extname(mdPath));
    cleanMdName = mdBasename.replace(/[^\w\u4e00-\u9fa5-]/g, '-').replace(/-+/g, '-');
  }
  
  return `${fileType}/${timestamp}-${cleanMdName}-${cleanName}${ext}`;
}

// 解析 Data URL
function parseDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    try {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) { reject(new Error('无效的 Data URL')); return; }
      const extMap = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/webp': '.webp' };
      const ext = extMap[match[1]] || '.png';
      const tempPath = pathModule.join(tempDir, 'upload-' + Date.now() + ext);
      fs.writeFileSync(tempPath, Buffer.from(match[2], 'base64'));
      resolve(tempPath);
    } catch (e) { reject(e); }
  });
}

// 下载网络文件
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const tempPath = pathModule.join(tempDir, 'upload-' + Date.now() + '.png');
    const file = fs.createWriteStream(tempPath);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if ([301, 302].includes(response.statusCode)) {
        file.close();
        downloadFile(response.headers.location).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(() => resolve(tempPath)); });
    }).on('error', (err) => { file.close(); reject(err); });
  });
}

// 上传到 COS
function uploadToCos(filePath, key) {
  return new Promise((resolve, reject) => {
    try {
      const body = fs.readFileSync(filePath);
      cos.putObject({
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: body,
        ContentLength: body.length
      }, (err) => {
        // 清理临时文件
        try { fs.unlinkSync(filePath); } catch (e) {}
        if (err) {
          reject(err);
        } else {
          resolve(`${cosBaseUrl}/${key}`);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

// 处理单个文件
async function processFile(input, mdPath, fileType) {
  let filePath;
  
  if (input.startsWith('data:')) {
    filePath = await parseDataUrl(input);
  } else if (input.startsWith('http')) {
    filePath = await downloadFile(input);
  } else {
    filePath = decodeURIComponent(input.replace('file://', ''));
  }
  
  // 注意：sourcePath 必须是实际的图片文件路径，不能用 mdPath
  const key = generateKey(filePath, mdPath, fileType, 'image');
  return uploadToCos(filePath, key);
}

// ============ Frontmatter 媒体处理 ============

// 上传并替换 frontmatter 中的本地媒体
async function uploadFrontmatterMedia(mdPath, fileType) {
  const mediaFiles = parseFrontmatterMedia(mdPath);
  
  if (mediaFiles.length === 0) {
    return [];
  }
  
  console.log(`发现 ${mediaFiles.length} 个 frontmatter 本地媒体文件`);
  
  const results = [];
  let content = fs.readFileSync(mdPath, 'utf-8');
  
  for (const media of mediaFiles) {
    const localPath = resolveMediaPath(media.value, mdPath);
    
    if (!fs.existsSync(localPath)) {
      console.log(`  [跳过] 文件不存在: ${localPath}`);
      continue;
    }
    
    // 检测媒体类型
    let mediaType = 'image';
    if (/\.(mp4|webm|ogg|mov)$/i.test(localPath)) mediaType = 'video';
    if (/\.(mp3|wav|ogg|m4a)$/i.test(localPath)) mediaType = 'audio';
    
    const key = generateKey(localPath, mdPath, fileType, mediaType);
    
    console.log(`  [上传] ${media.value}...`);
    try {
      const url = await uploadToCos(localPath, key);
      console.log(`  [成功] ${url}`);
      results.push({ original: media.value, url });
      
      // 替换 markdown 中的路径
      if (media.field === 'coverImage') {
        // coverImage: ./covers/xxx.jpg -> coverImage: https://...
        content = content.replace(
          new RegExp(`^${escapeRegex(media.line)}$`, 'm'),
          media.line.replace(media.value, url)
        );
      } else {
        // 数组中的值
        content = content.replace(
          new RegExp(`^  - ${escapeRegex(media.value)}$`, 'm'),
          `  - ${url}`
        );
      }
    } catch (e) {
      console.log(`  [失败] ${e.message}`);
    }
  }
  
  // 写入更新后的内容
  if (results.length > 0) {
    fs.writeFileSync(mdPath, content, 'utf-8');
    console.log(`[完成] 已更新 ${results.length} 个媒体链接`);
  }
  
  return results;
}

// ============ Frontmatter 检查模式 ============

async function checkAndUploadFrontmatterMedia(mdPath) {
  if (!fs.existsSync(mdPath)) {
    console.error(`文件不存在: ${mdPath}`);
    return;
  }
  
  const mediaFiles = parseFrontmatterMedia(mdPath);
  
  if (mediaFiles.length === 0) {
    console.log('无本地媒体文件');
    return;
  }
  
  console.log(`\n=== ${pathModule.basename(mdPath)} ===`);
  console.log(`发现 ${mediaFiles.length} 个本地媒体文件:`);
  mediaFiles.forEach((m, i) => console.log(`  ${i + 1}. [${m.field}] ${m.value}`));
  
  const fileType = getTypeFromMarkdown(mdPath);
  await uploadFrontmatterMedia(mdPath, fileType);
}

async function checkAllMarkdown() {
  const publicDir = pathModule.join(__dirname, '..', 'public');
  const mdFiles = [];
  
  function findMdFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = pathModule.join(dir, entry.name);
      if (entry.isDirectory()) {
        findMdFiles(fullPath);
      } else if (entry.name.endsWith('.md')) {
        mdFiles.push(fullPath);
      }
    }
  }
  
  findMdFiles(publicDir);
  console.log(`找到 ${mdFiles.length} 个 markdown 文件\n`);
  
  let totalUpdated = 0;
  for (const mdFile of mdFiles) {
    const mediaFiles = parseFrontmatterMedia(mdFile);
    if (mediaFiles.length > 0) {
      const fileType = getTypeFromMarkdown(mdFile);
      const results = await uploadFrontmatterMedia(mdFile, fileType);
      totalUpdated += results.length;
    }
  }
  
  console.log(`\n=== 总计 ===`);
  console.log(`更新了 ${totalUpdated} 个媒体链接`);
}

// ============ 主程序 ============

const args = process.argv.slice(2);

// 从命令行参数或 lsof 获取 md 文件路径
function resolveMdPath() {
  // 优先使用命令行参数中的 md 文件路径
  for (const arg of args) {
    if (arg.endsWith('.md') && arg.includes('personal-website') && fs.existsSync(arg)) {
      return pathModule.resolve(arg);
    }
  }
  
  // 其次使用 lsof 获取 Typora 当前打开的文件
  return getTyporaMarkdownPath();
}

// 帮助信息
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
cos-upload - 上传图片到 COS

用法:
  node cos-upload.cjs [options] [image-file]
  
选项:
  --check <md-file>   检测并上传指定 markdown 的 frontmatter 本地媒体
  --check-all         检测并上传所有 markdown 的 frontmatter 本地媒体
  --help, -h          显示帮助信息

示例:
  # Typora 触发（自动检测当前文件）
  node cos-upload.cjs
  
  # 检测并上传单个文件
  node cos-upload.cjs --check public/diary/xxx.md
  
  # 检测并上传所有文件
  node cos-upload.cjs --check-all
`);
  process.exit(0);
}

// 检查模式
if (args.includes('--check-all')) {
  checkAllMarkdown().then(() => process.exit(0));
  return;
}

if (args.includes('--check')) {
  const idx = args.indexOf('--check');
  const mdFile = args[idx + 1];
  if (!mdFile) {
    console.error('请指定 markdown 文件');
    process.exit(1);
  }
  const mdPath = pathModule.resolve(mdFile);
  checkAndUploadFrontmatterMedia(mdPath).then(() => process.exit(0));
  return;
}

// 正常上传模式
async function getInputFiles() {
  let inputs = args.filter(arg => !arg.startsWith('-'));
  
  // 如果没有命令行参数，从 Typora TMPDIR 获取
  if (inputs.length === 0) {
    const typoraImage = getTyporaImage();
    if (typoraImage) {
      inputs.push(typoraImage);
    } else {
      console.error('无输入文件');
      process.exit(1);
    }
  }
  
  return inputs;
}

(async () => {
  const inputs = await getInputFiles();
  
  // 获取当前编辑的 Markdown 文件（优先命令行参数，其次 lsof）
  const mdPath = resolveMdPath();
  
  // 调试信息
  console.error(`[DEBUG] 输入文件: ${JSON.stringify(inputs)}`);
  console.error(`[DEBUG] 检测到的 MD 文件: ${mdPath}`);
  
  // 从 Markdown 文件解析 type
  const fileType = getTypeFromMarkdown(mdPath);
  console.error(`[DEBUG] 解析的文件类型: ${fileType}`);
  
  // 1. 先处理 frontmatter 中的本地媒体
  if (mdPath) {
    await uploadFrontmatterMedia(mdPath, fileType);
  }
  
  // 2. 处理当前输入的图片（Typora 上传的图片）
  const urls = await Promise.all(inputs.map(fp => processFile(fp, mdPath, fileType)));
  console.log(urls.join('\n'));
  
  process.exit(0);
})().catch(err => {
  console.error('上传失败:', err.message || err);
  process.exit(1);
});
