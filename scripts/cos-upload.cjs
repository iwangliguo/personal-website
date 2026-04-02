#!/usr/bin/env node
const COS = require('cos-nodejs-sdk-v5');
const pathModule = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// 自动读取 .env 文件
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

// 从环境变量或 .env 文件读取 COS 密钥
const secretId = process.env.COS_SECRET_ID || envVars.COS_SECRET_ID;
const secretKey = process.env.COS_SECRET_KEY || envVars.COS_SECRET_KEY;

if (!secretId || !secretKey) {
  console.error('错误: 请设置 COS_SECRET_ID 和 COS_SECRET_KEY');
  process.exit(1);
}

const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
const bucket = 'hins-1417576783';
const region = 'ap-shanghai';
const tempDir = '/tmp/picgo-upload';

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 从 Typora 的 TMPDIR 获取最新图片
function getTyporaImage() {
  try {
    const tmpFiles = fs.readdirSync(process.env.TMPDIR);
    const recentImages = tmpFiles
      .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
      .map(f => {
        const stat = fs.statSync(pathModule.join(process.env.TMPDIR, f));
        return { name: f, path: pathModule.join(process.env.TMPDIR, f), mtime: stat.mtime };
      })
      .sort((a, b) => b.mtime - a.mtime);
    
    if (recentImages.length > 0) {
      return recentImages[0].path;
    }
  } catch (e) {}
  return null;
}

// 通过 lsof 获取 Typora 当前打开的 markdown 文件
function getTyporaMarkdownPath() {
  const { execSync } = require('child_process');
  fs.appendFileSync('/tmp/picgo-debug.log', `getTyporaMarkdownPath 开始\n`);
  try {
    // 获取 Typora 进程 PID
    let pid = null;
    try {
      pid = execSync("pgrep -ix Typora", { encoding: 'utf-8', timeout: 3000 }).trim().split('\n')[0];
    } catch (e) {}
    
    if (!pid) {
      try {
        pid = execSync("ps aux | grep -i 'Typora.app' | grep -v grep | head -1", { encoding: 'utf-8', timeout: 3000 }).trim();
        const match = pid.match(/\d+/);
        pid = match ? match[0] : null;
      } catch (e) {}
    }
    
    fs.appendFileSync('/tmp/picgo-debug.log', `PID: ${pid}\n`);
    if (!pid) return null;
    
    // 方法1: 尝试获取工作目录
    try {
      const pwdx = execSync(`pwdx ${pid} 2>/dev/null`, { encoding: 'utf-8', timeout: 3000 }).trim();
      fs.appendFileSync('/tmp/picgo-debug.log', `pwdx: ${pwdx}\n`);
    } catch (e) {
      fs.appendFileSync('/tmp/picgo-debug.log', `pwdx 失败\n`);
    }
    
    // 方法2: 获取该进程打开的所有文件
    const lsof = execSync(`lsof -p ${pid} 2>/dev/null`, { encoding: 'utf-8', timeout: 5000 });
    
    // 尝试查找任何在 personal-website 目录下的文件
    const lines = lsof.split('\n');
    for (const line of lines) {
      if (line.includes('personal-website') && (line.includes('.md') || line.includes('.markdown'))) {
        const parts = line.split(/\s+/);
        const filePath = parts[parts.length - 1];
        fs.appendFileSync('/tmp/picgo-debug.log', `找到 md 文件: ${filePath}\n`);
        if (filePath && fs.existsSync(filePath)) {
          return filePath;
        }
      }
    }
    
    // 如果没找到，尝试用 cwd
    try {
      const cwd = execSync(`lsof -a -p ${pid} -d cwd 2>/dev/null | tail -1`, { encoding: 'utf-8', timeout: 3000 }).trim();
      fs.appendFileSync('/tmp/picgo-debug.log', `cwd: ${cwd}\n`);
      // 从 cwd 行提取路径
      const match = cwd.match(/\/.*/);
      if (match && match[0].includes('personal-website')) {
        return match[0];
      }
    } catch (e) {}
    
  } catch (e) {
    fs.appendFileSync('/tmp/picgo-debug.log', `错误: ${e.message}\n`);
  }
  return null;
}

// 从 Markdown 文件开头解析 type 字段
function getTypeFromMarkdown(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return 'img';
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // 读取前 10 行查找 type 字段
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      // 支持多种格式: type: diary, type=diary, type:diary
      const match = line.match(/^type\s*[:=]\s*(\w+)/i);
      if (match) {
        const type = match[1].toLowerCase();
        // 映射为有效的分类
        const validTypes = ['diary', 'technique', 'publication', 'project'];
        if (validTypes.includes(type)) {
          return type;
        }
      }
    }
  } catch (e) {}
  return 'img';
}

// 生成带时间戳和 Markdown 文件名的文件名
function generateKey(sourcePath, fileType) {
  const ext = pathModule.extname(sourcePath) || '.png';
  const basename = pathModule.basename(sourcePath, ext);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '-');
  
  // 清理文件名中的特殊字符
  const cleanName = basename.replace(/[^\w\u4e00-\u9fa5-]/g, '-').replace(/-+/g, '-');
  
  // 从源文件路径提取 markdown 文件名（不含扩展名）
  const mdBasename = pathModule.basename(sourcePath, pathModule.extname(sourcePath));
  const cleanMdName = mdBasename.replace(/[^\w\u4e00-\u9fa5-]/g, '-').replace(/-+/g, '-');
  
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
    const body = fs.readFileSync(filePath);
    cos.putObject({ Bucket: bucket, Region: region, Key: key, Body: body, ContentLength: body.length }, (err) => {
      try { fs.unlinkSync(filePath); } catch (e) {}
      if (err) { reject(err); } else { resolve('https://' + bucket + '.cos.' + region + '.myqcloud.com/' + key); }
    });
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
  
  const key = generateKey(mdPath || filePath, fileType);
  return uploadToCos(filePath, key);
}

// 获取输入文件
async function getInputFiles() {
  let inputs = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
  
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
  fs.appendFileSync('/tmp/picgo-debug.log', `=== 脚本开始 ===\n`);
  const inputs = await getInputFiles();
  fs.appendFileSync('/tmp/picgo-debug.log', `输入文件: ${JSON.stringify(inputs)}\n`);
  
  // 获取 Typora 当前打开的 Markdown 文件
  const mdPath = getTyporaMarkdownPath();
  fs.appendFileSync('/tmp/picgo-debug.log', `mdPath: ${mdPath}\n`);
  
  // 从 Markdown 文件解析 type
  const fileType = getTypeFromMarkdown(mdPath);
  fs.appendFileSync('/tmp/picgo-debug.log', `fileType: ${fileType}\n`);
  
  const urls = await Promise.all(inputs.map(fp => processFile(fp, mdPath, fileType)));
  console.log(urls.join('\n'));
  process.exit(0);
})().catch(err => {
  console.error('上传失败:', err.message || err);
  process.exit(1);
});
