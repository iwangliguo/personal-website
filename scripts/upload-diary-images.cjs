#!/usr/bin/env node
const COS = require('cos-nodejs-sdk-v5');
const pathModule = require('path');
const fs = require('fs');

// 读取 .env 文件
const envPath = pathModule.join(__dirname, '.env');
let envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const idx = line.indexOf('=');
      if (idx > 0) {
        envVars[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
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

// 从 Markdown 文件解析 type 字段
function getTypeFromMarkdown(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const match = lines[i].trim().match(/^type\s*[:=]\s*(\w+)/i);
      if (match) {
        const type = match[1].toLowerCase();
        if (['diary', 'technique', 'publication', 'project'].includes(type)) {
          return type;
        }
      }
    }
  } catch (e) {}
  return null;
}

// 上传到 COS
function uploadFile(localPath, cosKey) {
  return new Promise((resolve, reject) => {
    const body = fs.readFileSync(localPath);
    cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: cosKey,
      Body: body,
      ContentLength: body.length
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve('https://' + bucket + '.cos.' + region + '.myqcloud.com/' + cosKey);
      }
    });
  });
}

// 生成 COS key
function generateKey(localPath, fileType, mdBasename) {
  const ext = pathModule.extname(localPath);
  const basename = pathModule.basename(localPath, ext);
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '-');
  
  // 使用 Markdown 文件名（不含扩展名）
  const cleanMdName = mdBasename.replace(pathModule.extname(mdBasename), '').replace(/[^\w\u4e00-\u9fa5-]/g, '-').replace(/-+/g, '-');
  
  return `${fileType}/${timestamp}-${cleanMdName}-${basename}${ext}`;
}

// 扫描目录获取所有图片
function getImages(dir) {
  const images = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = pathModule.join(dir, entry.name);
    if (entry.isDirectory()) {
      images.push(...getImages(fullPath));
    } else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(entry.name)) {
      images.push(fullPath);
    }
  }
  return images;
}

// 主函数
async function main() {
  const baseDir = '/Users/anjing/Desktop/personal_website/personal-website';
  const publicDir = pathModule.join(baseDir, 'public');
  const diaryDir = pathModule.join(publicDir, 'diary');
  
  console.log('开始扫描 diary 目录...\n');
  
  const results = [];
  const entries = fs.readdirSync(diaryDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const mdDir = pathModule.join(diaryDir, entry.name);
    
    // 查找对应的 markdown 文件
    const mdFiles = fs.readdirSync(mdDir).filter(f => /\.md$/i.test(f));
    if (mdFiles.length === 0) continue;
    
    const mdPath = pathModule.join(mdDir, mdFiles[0]);
    const fileType = getTypeFromMarkdown(mdPath) || 'diary';
    
    console.log(`处理: ${entry.name} (type: ${fileType})`);
    
    // 获取所有图片
    const images = getImages(mdDir);
    
    for (const imgPath of images) {
      const cosKey = generateKey(imgPath, fileType, mdFiles[0]);
      const relativePath = imgPath.replace(baseDir + '/', '');
      
      try {
        const url = await uploadFile(imgPath, cosKey);
        results.push({ local: relativePath, cos: url });
        console.log(`  ✓ ${relativePath}`);
        console.log(`    → ${cosKey}`);
      } catch (err) {
        console.log(`  ✗ ${relativePath} - 失败: ${err.message}`);
      }
    }
    console.log('');
  }
  
  console.log(`\n完成！共上传 ${results.length} 个文件`);
  
  // 保存上传记录
  fs.writeFileSync(pathModule.join(baseDir, 'scripts', 'upload-log.json'), JSON.stringify(results, null, 2));
  console.log('上传记录已保存到 upload-log.json');
}

main().catch(console.error);
