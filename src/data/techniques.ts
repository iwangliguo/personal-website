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
export const techniques: TechniqueEntry[] = [
  {
    "id": 1,
    "title": "Git 日常使用指南",
    "date": "2026-04-01T00:00:00.000Z",
    "content": "\n## 前言\n\nGit 是目前最流行的版本控制系统，掌握 Git 的日常使用命令对于开发者来说至关重要。\n\n## 基础配置\n\n```bash\n# 设置用户名和邮箱\ngit config --global user.name \"Your Name\"\ngit config --global user.email \"your.email@example.com\"\n\n# 查看配置\ngit config --list\n```\n\n## 日常工作流\n\n### 1. 克隆仓库\n\n```bash\ngit clone https://github.com/user/repo.git\n```\n\n### 2. 创建和切换分支\n\n```bash\n# 创建新分支\ngit branch feature-new\n\n# 切换分支\ngit checkout feature-new\n\n# 创建并切换（简写）\ngit checkout -b feature-new\n```\n\n### 3. 提交代码\n\n```bash\n# 查看状态\ngit status\n\n# 添加文件\ngit add .           # 添加所有文件\ngit add filename    # 添加指定文件\n\n# 提交\ngit commit -m \"提交信息\"\n\n# 推送\ngit push origin feature-new\n```\n\n## 常用操作\n\n### 查看历史\n\n```bash\ngit log                    # 查看提交历史\ngit log --oneline         # 简洁模式\ngit log -n 5              # 最近5条\n```\n\n### 撤销操作\n\n```bash\ngit checkout -- filename    # 撤销工作区修改\ngit reset HEAD filename     # 撤销暂存\ngit reset --soft HEAD~1     # 撤销上次提交（保留修改）\n```\n\n## 分支管理\n\n```bash\n# 查看分支\ngit branch              # 本地分支\ngit branch -r           # 远程分支\ngit branch -a           # 所有分支\n\n# 删除分支\ngit branch -d branchname    # 删除已合并的分支\ngit branch -D branchname    # 强制删除\n```\n\n## 实用技巧\n\n### 1. 暂存工作区\n\n```bash\ngit stash               # 暂存当前修改\ngit stash pop           # 恢复暂存\ngit stash list          # 查看暂存列表\n```\n\n### 2. 拉取远程更新\n\n```bash\ngit pull origin main    # 拉取并合并\ngit fetch origin        # 仅获取\n```\n\n### 3. 变基（Rebase）\n\n```bash\ngit rebase main         # 整理提交历史\n```\n\n## 总结\n\n熟练使用这些命令可以让你的版本控制工作更加高效。建议每天开始工作前先 `git pull`，完成后及时 `git push`。\n",
    "isPublic": true,
    "images": [],
    "videos": [],
    "audios": [],
    "tags": [
      "Git",
      "版本控制"
    ]
  },
  {
    "id": 2,
    "title": "Python 虚拟环境完全指南",
    "date": "2026-04-01T00:00:00.000Z",
    "content": "\n## 前言\n\nPython 虚拟环境是 Python 开发中不可或缺的工具，它可以帮助我们隔离不同项目的依赖，避免版本冲突。\n\n## 什么是虚拟环境\n\n虚拟环境是一个独立的 Python 运行环境，包含独立的 Python 解释器、包安装目录等。通过虚拟环境，我们可以：\n\n- 为每个项目创建独立的依赖环境\n- 避免全局包版本冲突\n- 方便项目迁移和部署\n\n## 创建虚拟环境\n\n使用 `venv` 模块创建虚拟环境：\n\n```bash\n# 创建虚拟环境\npython -m venv myenv\n\n# 激活虚拟环境（Linux/Mac）\nsource myenv/bin/activate\n\n# 激活虚拟环境（Windows）\nmyenv\\Scripts\\activate\n```\n\n## 使用虚拟环境\n\n激活后，使用 `pip` 安装的包只会出现在当前虚拟环境中：\n\n```bash\n# 安装包\npip install requests\n\n# 查看已安装的包\npip list\n\n# 导出依赖\npip freeze > requirements.txt\n```\n\n## 常用命令汇总\n\n| 命令 | 说明 |\n|------|------|\n| `python -m venv env` | 创建虚拟环境 |\n| `source env/bin/activate` | 激活（Linux/Mac） |\n| `env\\Scripts\\activate` | 激活（Windows） |\n| `deactivate` | 退出虚拟环境 |\n| `pip freeze > requirements.txt` | 导出依赖 |\n\n## 小技巧\n\n### 使用 virtualenvwrapper 管理多个环境\n\n```bash\n# 安装\npip install virtualenvwrapper-win  # Windows\npip install virtualenvwrapper      # Linux/Mac\n\n# 创建环境\nmkvirtualenv myproject\n\n# 切换环境\nworkon myproject\n```\n\n## 总结\n\n掌握虚拟环境的使用是 Python 开发者的必备技能，建议在所有项目中都使用虚拟环境来管理依赖。\n",
    "isPublic": true,
    "images": [],
    "videos": [],
    "audios": [],
    "tags": [
      "Python",
      "开发环境"
    ]
  }
];

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
