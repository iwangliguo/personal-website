// 此文件由 scripts/generate-techniques.cjs 自动生成
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
export const techniques: TechniqueEntry[] = [];

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
