// 此文件由 scripts/generate-diaries.cjs 自动生成
// 不要手动编辑此文件
// 请在 public/diary/ 目录下添加日记文件夹，每个文件夹包含 Markdown 文件和媒体资源
// 
// Markdown 文件 frontmatter 格式：
// ---
// title: 日记标题（必填）
// date: 2023-07-01（必填，格式：YYYY-MM-DD）
// isPublic: true（可选，默认 true，false 表示私人日记不公开）
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

export interface DiaryEntry {
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

// 日记数据
export const diaries: DiaryEntry[] = [];

// 导出所有日记
export const getAllDiaries = (): DiaryEntry[] => {
  return diaries;
};

// 获取公开的日记
export const getPublicDiaries = (): DiaryEntry[] => {
  return diaries.filter(diary => diary.isPublic);
};

// 根据 ID 获取日记
export const getDiaryById = (id: number): DiaryEntry | undefined => {
  return diaries.find(diary => diary.id === id);
};
