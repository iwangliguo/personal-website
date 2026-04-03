#!/usr/bin/env node
/**
 * 统一上传脚本 - 将本地图片和音视频上传到 COS
 * 支持: diary, techniques, projects 目录下的 covers, images, videos, audios
 */
const COS = require('cos-nodejs-sdk-v5');
const pathModule = require('path');
const fs = require('fs');

const BASE_DIR = '/Users/anjing/Desktop/personal_website/personal-website';

// 读取 .env 文件
const envPath = pathModule.join(BASE_DIR, '.env');
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
  console.error('错误: 请在 .env 文件中设置 COS_SECRET_ID 和 COS_SECRET_KEY');
  process.exit(1);
}

const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
const bucket = 'hins-1417576783';
const region = 'ap-shanghai';
const cosBaseUrl = `https://${bucket}.cos.${region}.myqcloud.com`;

// 目录类型映射
const dirTypeMap = {
  diary: 'diary',
  techniques: 'technique',
  projects: 'project',
  publications: 'publication'
};

// 支持的文件类型
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.avi'];
const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];

function isImage(file) {
  const ext = pathModule.extname(file).toLowerCase();
  return IMAGE_EXTS.includes(ext);
}

function isVideo(file) {
  const ext = pathModule.extname(file).toLowerCase();
  return VIDEO_EXTS.includes(ext);
}

function isAudio(file) {
  const ext = pathModule.extname(file).toLowerCase();
  return AUDIO_EXTS.includes(ext);
}

// 扫描目录获取所有媒体文件
function scanMedia(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = pathModule.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanMedia(fullPath));
    } else if (isImage(fullPath) || isVideo(fullPath) || isAudio(fullPath)) {
      files.push({ path: fullPath, type: entry.name });
    }
  }
  return files;
}

// 生成 COS key
function generateCosKey(mediaPath, articleDir, articleName, mediaType) {
  const ext = pathModule.extname(mediaPath);
  const basename = pathModule.basename(mediaPath, ext);
  
  // 清理文件名
  const cleanArticle = articleName.replace(/\.md$/i, '').replace(/[^\w\u4e00-\u9fa5-]/g, '-').replace(/-+/g, '-');
  const cleanBase = basename.replace(/[^\w\u4e00-\u9fa5-]/g, '-').replace(/-+/g, '-');
  
  return `${mediaType}/${cleanArticle}-${cleanBase}${ext}`;
}

// 上传到 COS
function uploadToCos(localPath, cosKey) {
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
        resolve(`${cosBaseUrl}/${cosKey}`);
      }
    });
  });
}

// 从 markdown 文件解析 type 字段
function getTypeFromMarkdown(mdPath) {
  try {
    const content = fs.readFileSync(mdPath, 'utf-8');
    const lines = content.split('\n');
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const match = lines[i].trim().match(/^type\s*[:=]\s*(\w+)/i);
      if (match) {
        const type = match[1].toLowerCase();
        const validTypes = ['diary', 'technique', 'publication', 'project'];
        if (validTypes.includes(type)) return type;
      }
    }
  } catch (e) {}
  
  // 从路径推断
  if (mdPath.includes('/diary/')) return 'diary';
  if (mdPath.includes('/techniques/')) return 'technique';
  if (mdPath.includes('/projects/')) return 'project';
  if (mdPath.includes('/publications/')) return 'publication';
  return 'diary';
}

// 更新 markdown 文件中的引用路径
function updateMarkdown(mdPath, updates) {
  let content = fs.readFileSync(mdPath, 'utf-8');
  let modified = false;
  
  // 分类更新
  const coverUpdates = updates.filter(u => u.type === 'cover');
  const imageUpdates = updates.filter(u => u.type === 'image');
  const videoUpdates = updates.filter(u => u.type === 'video');
  const audioUpdates = updates.filter(u => u.type === 'audio');
  
  // 1. 更新 coverImage 字段 (处理 ./covers/xxx 或 covers/xxx 格式)
  for (const update of coverUpdates) {
    const filename = pathModule.basename(update.local);
    // 匹配: coverImage: ./covers/photo1.jpg 或 coverImage: covers/photo1.jpg
    const pattern = new RegExp(`(coverImage:\\s*)[.\\/]?covers\\/(${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
    if (pattern.test(content)) {
      content = content.replace(pattern, `$1${update.url}`);
      modified = true;
      console.log(`  → 更新 coverImage: ${filename} → COS URL`);
    }
  }
  
  // 2. 更新 markdown 中的图片引用 ![...](本地路径)
  for (const update of imageUpdates) {
    const oldPath = update.local;
    const newUrl = update.url;
    const filename = pathModule.basename(oldPath);
    // 匹配 ![...](./images/xxx) 或 ![...](images/xxx) 或包含文件名的任何引用
    const patterns = [
      new RegExp(`!\\[([^\\]]*)\\]\\([^)]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g')
    ];
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, `![$1](${newUrl})`);
        modified = true;
        break;
      }
    }
  }
  
  // 3. 更新 markdown 中的视频引用
  for (const update of videoUpdates) {
    const oldPath = update.local;
    const newUrl = update.url;
    const filename = pathModule.basename(oldPath);
    const patterns = [
      new RegExp(`!\\[video\\]\\([^)]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
      new RegExp(`<video[^>]*src=["'][^"']*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*["']`, 'g'),
    ];
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, match => match.replace(/src=["'][^"']*["']/, `src="${newUrl}"`));
        modified = true;
        break;
      }
    }
  }
  
  // 4. 更新 markdown 中的音频引用
  for (const update of audioUpdates) {
    const oldPath = update.local;
    const newUrl = update.url;
    const filename = pathModule.basename(oldPath);
    const patterns = [
      new RegExp(`!\\[audio\\]\\([^)]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
      new RegExp(`<audio[^>]*src=["'][^"']*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*["']`, 'g'),
    ];
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, match => match.replace(/src=["'][^"']*["']/, `src="${newUrl}"`));
        modified = true;
        break;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(mdPath, content);
    return true;
  }
  return false;
}

// 主函数
async function main() {
  const publicDir = pathModule.join(BASE_DIR, 'public');
  const dirs = ['diary', 'techniques', 'projects'];
  const results = [];
  const log = [];
  
  console.log('=== 开始扫描并上传媒体文件到 COS ===\n');
  
  for (const dirType of dirs) {
    const dirPath = pathModule.join(publicDir, dirType);
    if (!fs.existsSync(dirPath)) {
      console.log(`跳过: ${dirPath} 不存在\n`);
      continue;
    }
    
    console.log(`\n--- 处理 ${dirType} 目录 ---\n`);
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const articleDir = pathModule.join(dirPath, entry.name);
      const mdFiles = fs.readdirSync(articleDir).filter(f => /\.md$/i.test(f));
      
      if (mdFiles.length === 0) {
        console.log(`跳过: ${entry.name} (无 markdown 文件)`);
        continue;
      }
      
      const mdPath = pathModule.join(articleDir, mdFiles[0]);
      const articleType = getTypeFromMarkdown(mdPath);
      const articleName = mdFiles[0].replace(/\.md$/i, '');
      
      console.log(`\n处理: ${entry.name} (type: ${articleType})`);
      
      const updates = [];
      
      // 处理 covers 目录
      const coversDir = pathModule.join(articleDir, 'covers');
      if (fs.existsSync(coversDir)) {
        const covers = scanMedia(coversDir);
        for (const file of covers) {
          const cosKey = generateCosKey(file.path, articleDir, articleName, articleType);
          const relativePath = file.path.replace(BASE_DIR + '/', '');
          
          try {
            const url = await uploadToCos(file.path, cosKey);
            results.push({ local: relativePath, cos: url, type: 'cover' });
            updates.push({ type: 'cover', local: relativePath, url });
            console.log(`  ✓ [cover] ${relativePath}`);
            console.log(`      → ${cosKey}`);
          } catch (err) {
            console.log(`  ✗ [cover] ${relativePath} - 失败: ${err.message}`);
          }
        }
      }
      
      // 处理 images 目录
      const imagesDir = pathModule.join(articleDir, 'images');
      if (fs.existsSync(imagesDir)) {
        const images = scanMedia(imagesDir);
        for (const file of images) {
          const cosKey = generateCosKey(file.path, articleDir, articleName, articleType);
          const relativePath = file.path.replace(BASE_DIR + '/', '');
          
          try {
            const url = await uploadToCos(file.path, cosKey);
            results.push({ local: relativePath, cos: url, type: 'image' });
            updates.push({ type: 'image', local: relativePath, url });
            console.log(`  ✓ [image] ${relativePath}`);
            console.log(`      → ${cosKey}`);
          } catch (err) {
            console.log(`  ✗ [image] ${relativePath} - 失败: ${err.message}`);
          }
        }
      }
      
      // 处理 videos 目录
      const videosDir = pathModule.join(articleDir, 'videos');
      if (fs.existsSync(videosDir)) {
        const videos = scanMedia(videosDir);
        for (const file of videos) {
          const cosKey = generateCosKey(file.path, articleDir, articleName, articleType);
          const relativePath = file.path.replace(BASE_DIR + '/', '');
          
          try {
            const url = await uploadToCos(file.path, cosKey);
            results.push({ local: relativePath, cos: url, type: 'video' });
            updates.push({ type: 'video', local: relativePath, url });
            console.log(`  ✓ [video] ${relativePath}`);
            console.log(`      → ${cosKey}`);
          } catch (err) {
            console.log(`  ✗ [video] ${relativePath} - 失败: ${err.message}`);
          }
        }
      }
      
      // 处理 audios 目录
      const audiosDir = pathModule.join(articleDir, 'audios');
      if (fs.existsSync(audiosDir)) {
        const audios = scanMedia(audiosDir);
        for (const file of audios) {
          const cosKey = generateCosKey(file.path, articleDir, articleName, articleType);
          const relativePath = file.path.replace(BASE_DIR + '/', '');
          
          try {
            const url = await uploadToCos(file.path, cosKey);
            results.push({ local: relativePath, cos: url, type: 'audio' });
            updates.push({ type: 'audio', local: relativePath, url });
            console.log(`  ✓ [audio] ${relativePath}`);
            console.log(`      → ${cosKey}`);
          } catch (err) {
            console.log(`  ✗ [audio] ${relativePath} - 失败: ${err.message}`);
          }
        }
      }
      
      // 更新 markdown 文件
      if (updates.length > 0) {
        const modified = updateMarkdown(mdPath, updates);
        if (modified) {
          console.log(`  → 已更新 markdown 文件`);
        }
        log.push(...updates);
      }
    }
  }
  
  // 统计
  const imageCount = results.filter(r => IMAGE_EXTS.some(ext => r.local.endsWith(ext))).length;
  const videoCount = results.filter(r => VIDEO_EXTS.some(ext => r.local.endsWith(ext))).length;
  const audioCount = results.filter(r => AUDIO_EXTS.some(ext => r.local.endsWith(ext))).length;
  
  console.log('\n\n=== 完成 ===');
  console.log(`总计上传: ${results.length} 个文件`);
  console.log(`  - 图片: ${imageCount}`);
  console.log(`  - 视频: ${videoCount}`);
  console.log(`  - 音频: ${audioCount}`);
  
  // 保存上传记录
  const logPath = pathModule.join(BASE_DIR, 'scripts', 'media-upload-log.json');
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`\n上传记录已保存到: ${logPath}`);
  
  // 保存本地到COS的映射 (用于前端替换)
  const mapping = {};
  results.forEach(r => {
    mapping[r.local] = r.cos;
  });
  const mappingPath = pathModule.join(BASE_DIR, 'scripts', 'cos-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`路径映射已保存到: ${mappingPath}`);
}

main().catch(console.error);
