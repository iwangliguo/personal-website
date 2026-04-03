#!/usr/bin/env node
/**
 * 自动生成践迹数据脚本
 * 读取 public/projects/ 目录下的所有践迹文件夹
 * 每个文件夹包含一个 Markdown 文件
 * 生成 src/data/projects.ts 数据文件
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 路径配置
const PROJECT_DIR = path.join(__dirname, '../public/projects');
const OUTPUT_FILE = path.join(__dirname, '../src/data/projects.ts');
const CACHE_FILE = path.join(__dirname, '../.projects-cache.json');

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

// 读取所有践迹文件夹
function readProjectFiles() {
  if (!fs.existsSync(PROJECT_DIR)) {
    console.warn('⚠️  践迹目录不存在，将生成空数据文件', PROJECT_DIR);
    return { projects: [], hasChanges: true };
  }

  const cache = loadCache();
  const newCache = {};
  
  const entries = fs.readdirSync(PROJECT_DIR);
  const projectFolders = entries.filter(entry => {
    const entryPath = path.join(PROJECT_DIR, entry);
    return fs.statSync(entryPath).isDirectory();
  }).sort();

  const projects = [];
  let hasChanges = projectFolders.length !== Object.keys(cache).length;

  projectFolders.forEach(folder => {
    const folderPath = path.join(PROJECT_DIR, folder);
    
    const mdFile = fs.readdirSync(folderPath).find(file => file.endsWith('.md'));
    
    if (!mdFile) {
      console.warn(`⚠️  跳过文件夹 ${folder}：未找到 Markdown 文件`);
      return;
    }

    const mdFilePath = path.join(folderPath, mdFile);
    const fileSignature = getFileSignature(mdFilePath);
    const cacheKey = `${folder}/${mdFile}`;
    
    const isModified = !cache[cacheKey] || 
                       cache[cacheKey].signature.mtime !== fileSignature.mtime ||
                       cache[cacheKey].signature.size !== fileSignature.size;
    
    if (isModified) {
      hasChanges = true;
      console.log(`📝 检测到变化，读取践迹：${folder}/${mdFile}`);
      
      const content = fs.readFileSync(mdFilePath, 'utf8');
      const parsed = matter(content);

      // 将正文中的相对路径转换为绝对路径（保持 COS URL 不变）
      const resolveContentPaths = (md) => {
        const toAbs = (src) => {
          if (!src) return src;
          // 如果已经是 COS URL 或其他 http/https URL，保持不变
          if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
            return src;
          }
          return src.startsWith('./') ? `/projects/${folder}/${src.slice(2)}` : `/projects/${folder}/${src}`;
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

      const project = {
        id: 0,
        title: parsed.data.title,
        date: parsed.data.date,
        content: resolveContentPaths(parsed.content),
        isPublic: parsed.data.isPublic ?? true,
        tags: parsed.data.tags || [],
        _fileSignature: fileSignature
      };

      projects.push(project);
      newCache[cacheKey] = {
        signature: fileSignature,
        project: project
      };
    } else {
      console.log(`✓ 使用缓存：${folder}/${mdFile}`);
      projects.push({ ...cache[cacheKey].project });
      newCache[cacheKey] = cache[cacheKey];
    }
  });

  if (hasChanges) {
    saveCache(newCache);
  }

  return { projects, hasChanges };
}

// 生成 TypeScript 数据文件
function generateDataFile(projects) {
  const cleanProjects = projects.map(({ _fileSignature, ...project }) => project);
  
  const content = `// 此文件由 scripts/generate-projects.cjs 自动生成
// 不要手动编辑此文件
// 请在 public/projects/ 目录下添加践迹文件夹，每个文件夹包含 Markdown 文件
// 
// Markdown 文件 frontmatter 格式：
// ---
// title: 践迹标题（必填）
// date: 2026-01-01（必填，格式：YYYY-MM-DD）
// isPublic: true（可选，默认 true）
// tags:（可选）
//   - 标签 1
// ---
// 注意：id 字段会自动分配，无需手动设置！

export interface ProjectEntry {
  id: number;
  title: string;
  date: string;
  content: string;
  isPublic: boolean;
  tags?: string[];
}

// 践迹数据
export const projects: ProjectEntry[] = ${JSON.stringify(cleanProjects, null, 2)};

// 导出所有践迹
export const getAllProjects = (): ProjectEntry[] => {
  return projects;
};

// 获取公开的践迹
export const getPublicProjects = (): ProjectEntry[] => {
  return projects.filter(project => project.isPublic);
};

// 根据 ID 获取践迹
export const getProjectById = (id: number): ProjectEntry | undefined => {
  return projects.find(project => project.id === id);
};
`;

  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  console.log(`✓ 生成数据文件：${OUTPUT_FILE}`);
}

// 主函数
function main() {
  console.log('📖 开始生成践迹数据...\n');
  
  const { projects, hasChanges } = readProjectFiles();
  
  if (projects.length === 0) {
    console.log('⚠️  未找到任何践迹文件，将生成空数据文件');
    console.log(`请在 ${PROJECT_DIR} 目录下创建践迹文件夹（以日期命名），并在其中添加 .md 文件`);
    generateDataFile([]);
    console.log('\n✅ 完成！生成了空数据文件');
    process.exit(0);
  }

  if (!hasChanges && fs.existsSync(OUTPUT_FILE)) {
    console.log('\n✨ 所有践迹均无变化，跳过生成过程\n');
    process.exit(0);
  }

  console.log('\n🔢 自动分配践迹 ID...');
  projects.sort((a, b) => new Date(b.date) - new Date(a.date));
  projects.forEach((project, index) => {
    project.id = index + 1;
  });
  
  generateDataFile(projects);
  
  console.log(`\n✅ 完成！共处理 ${projects.length} 篇践迹\n`);
}

main();
