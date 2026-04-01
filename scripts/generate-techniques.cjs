#!/usr/bin/env node
/**
 * 自动生成术略数据脚本
 * 读取 public/techniques/ 目录下的所有术略文件夹
 * 每个文件夹包含一个 Markdown 文件和对应的媒体文件
 * 生成 src/data/techniques.ts 数据文件
 * 
 * 优化：只处理修改过的文件，通过比较文件修改时间戳
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 路径配置
const TECHNIQUE_DIR = path.join(__dirname, '../public/techniques');
const OUTPUT_FILE = path.join(__dirname, '../src/data/techniques.ts');
const CACHE_FILE = path.join(__dirname, '../.techniques-cache.json');

// 加载缓存
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

// 保存缓存
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// 获取文件的修改时间和大小作为变更标识
function getFileSignature(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      mtime: stats.mtimeMs,
      size: stats.size
    };
  } catch (e) {
    return null;
  }
}

// 读取所有术略文件夹
function readTechniqueFiles() {
  if (!fs.existsSync(TECHNIQUE_DIR)) {
    console.warn('⚠️  术略目录不存在，将生成空数据文件', TECHNIQUE_DIR);
    return { techniques: [], hasChanges: true };
  }

  const cache = loadCache();
  const newCache = {};
  
  const entries = fs.readdirSync(TECHNIQUE_DIR);
  const techniqueFolders = entries.filter(entry => {
    const entryPath = path.join(TECHNIQUE_DIR, entry);
    return fs.statSync(entryPath).isDirectory();
  }).sort();

  const techniques = [];
  // 术略数量与缓存不一致（新增或删除）时也视为有变化
  let hasChanges = techniqueFolders.length !== Object.keys(cache).length;

  techniqueFolders.forEach(folder => {
    const folderPath = path.join(TECHNIQUE_DIR, folder);
    
    // 查找文件夹中的 Markdown 文件
    const mdFile = fs.readdirSync(folderPath).find(file => file.endsWith('.md'));
    
    if (!mdFile) {
      console.warn(`⚠️  跳过文件夹 ${folder}：未找到 Markdown 文件`);
      return;
    }

    const mdFilePath = path.join(folderPath, mdFile);
    const fileSignature = getFileSignature(mdFilePath);
    const cacheKey = `${folder}/${mdFile}`;
    
    // 检查文件是否发生变化
    const isModified = !cache[cacheKey] || 
                       cache[cacheKey].signature.mtime !== fileSignature.mtime ||
                       cache[cacheKey].signature.size !== fileSignature.size;
    
    if (isModified) {
      hasChanges = true;
      console.log(`📝 检测到变化，读取术略：${folder}/${mdFile}`);
      
      const content = fs.readFileSync(mdFilePath, 'utf8');
      const parsed = matter(content);

      // 处理相对路径：将 ./xxx 转换为 /techniques/folderName/xxx
      const resolveRelativePath = (filePath) => {
        if (!filePath) return undefined;
        if (filePath.startsWith('/')) return filePath;
        if (filePath.startsWith('./')) {
          return `/techniques/${folder}/${filePath.slice(2)}`;
        }
        return `/techniques/${folder}/${filePath}`;
      };

      const resolveRelativePaths = (paths) => {
        if (!paths || paths.length === 0) return [];
        return paths.map(resolveRelativePath);
      };

      // 将正文中的相对路径转换为绝对路径（同时处理 Markdown 语法和 HTML 标签）
      const resolveContentPaths = (md) => {
        const toAbs = (src) => {
          if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
            return src;
          }
          return src.startsWith('./') ? `/techniques/${folder}/${src.slice(2)}` : `/techniques/${folder}/${src}`;
        };

        // 处理 Markdown 图片语法：![alt](./xxx)
        let result = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
          const abs = toAbs(src);
          return abs === src ? match : `![${alt}](${abs})`;
        });

        // 处理 HTML 标签中的 src="..." 属性（img / video / audio / source）
        result = result.replace(/(<(?:img|video|audio|source)[^>]*\s)src=(["'])([^"']+)\2/gi, (match, prefix, quote, src) => {
          const abs = toAbs(src);
          return abs === src ? match : `${prefix}src=${quote}${abs}${quote}`;
        });

        return result;
      };

      const technique = {
        id: 0, // 会被自动分配
        title: parsed.data.title,
        date: parsed.data.date,
        content: resolveContentPaths(parsed.content),
        isPublic: parsed.data.isPublic ?? true,
        coverImage: resolveRelativePath(parsed.data.coverImage),
        images: resolveRelativePaths(parsed.data.images || []),
        videos: resolveRelativePaths(parsed.data.videos || []),
        audios: resolveRelativePaths(parsed.data.audios || []),
        tags: parsed.data.tags || [],
        _fileSignature: fileSignature // 用于缓存比较
      };

      techniques.push(technique);
      newCache[cacheKey] = {
        signature: fileSignature,
        technique: technique
      };
    } else {
      // 使用缓存的数据
      console.log(`✓ 使用缓存：${folder}/${mdFile}`);
      techniques.push({ ...cache[cacheKey].technique });
      newCache[cacheKey] = cache[cacheKey];
    }
  });

  // 保存缓存
  if (hasChanges) {
    saveCache(newCache);
  }

  return { techniques, hasChanges };
}

// 生成 TypeScript 数据文件
function generateDataFile(techniques) {
  // 移除内部使用的 _fileSignature 字段
  const cleanTechniques = techniques.map(({ _fileSignature, ...technique }) => technique);
  
  const content = `// 此文件由 scripts/generate-techniques.cjs 自动生成
// 不要手动编辑此文件
// 请在 public/techniques/ 目录下添加术略文件夹，每个文件夹包含 Markdown 文件和媒体资源
// 
// Markdown 文件 frontmatter 格式：
// ---
// title: 术略标题（必填）
// date: 2023-07-01（必填，格式：YYYY-MM-DD）
// isPublic: true（可选，默认 true，false 表示私人内容不公开）
// coverImage: ./covers/封面图.jpg（可选）
// tags:（可选）
//   - 标签 1
//   - 标签 2
// images:（可选）
//   - ./images/图片 1.jpg
// videos:（可选）
// audios:（可选）
// ---
// 注意：id 字段会自动分配，无需手动设置！

export interface TechniqueEntry {
  id: number;
  title: string;
  date: string;
  content: string;
  isPublic: boolean;
  coverImage?: string;
  images?: string[];
  videos?: string[];
  audios?: string[];
  tags?: string[];
}

// 术略数据
export const techniques: TechniqueEntry[] = ${JSON.stringify(cleanTechniques, null, 2)};

// 导出所有术略
export const getAllTechniques = (): TechniqueEntry[] => {
  return techniques;
};

// 获取公开的术略
export const getPublicTechniques = (): TechniqueEntry[] => {
  return techniques.filter(technique => technique.isPublic);
};

// 根据 ID 获取术略
export const getTechniqueById = (id: number): TechniqueEntry | undefined => {
  return techniques.find(technique => technique.id === id);
};
`;

  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  console.log(`✓ 生成数据文件：${OUTPUT_FILE}`);
}

// 主函数
function main() {
  console.log('📖 开始生成术略数据...\n');
  
  const { techniques, hasChanges } = readTechniqueFiles();
  
  if (techniques.length === 0) {
    console.log('⚠️  未找到任何术略文件，将生成空数据文件');
    console.log(`请在 ${TECHNIQUE_DIR} 目录下创建术略文件夹（以日期命名），并在其中添加 .md 文件`);
    generateDataFile([]);
    console.log('\n✅ 完成！生成了空数据文件');
    process.exit(0);
  }

  if (!hasChanges && fs.existsSync(OUTPUT_FILE)) {
    console.log('\n✨ 所有术略均无变化，跳过生成过程\n');
    process.exit(0);
  }

  // 自动分配 ID：按日期排序后，从 1 开始递增分配
  console.log('\n🔢 自动分配术略 ID...');
  techniques.sort((a, b) => new Date(a.date) - new Date(b.date));
  techniques.forEach((technique, index) => {
    technique.id = index + 1;
  });
  
  generateDataFile(techniques);
  
  console.log(`\n✅ 完成！共处理 ${techniques.length} 篇术略\n`);
}

main();
