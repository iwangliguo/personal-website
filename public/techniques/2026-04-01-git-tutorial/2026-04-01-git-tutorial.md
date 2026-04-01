---
title: Git 日常使用指南
date: 2026-04-01
isPublic: true
tags:
  - Git
  - 版本控制
---

## 前言

Git 是目前最流行的版本控制系统，掌握 Git 的日常使用命令对于开发者来说至关重要。

## 基础配置

```bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 查看配置
git config --list
```

## 日常工作流

### 1. 克隆仓库

```bash
git clone https://github.com/user/repo.git
```

### 2. 创建和切换分支

```bash
# 创建新分支
git branch feature-new

# 切换分支
git checkout feature-new

# 创建并切换（简写）
git checkout -b feature-new
```

### 3. 提交代码

```bash
# 查看状态
git status

# 添加文件
git add .           # 添加所有文件
git add filename    # 添加指定文件

# 提交
git commit -m "提交信息"

# 推送
git push origin feature-new
```

## 常用操作

### 查看历史

```bash
git log                    # 查看提交历史
git log --oneline         # 简洁模式
git log -n 5              # 最近5条
```

### 撤销操作

```bash
git checkout -- filename    # 撤销工作区修改
git reset HEAD filename     # 撤销暂存
git reset --soft HEAD~1     # 撤销上次提交（保留修改）
```

## 分支管理

```bash
# 查看分支
git branch              # 本地分支
git branch -r           # 远程分支
git branch -a           # 所有分支

# 删除分支
git branch -d branchname    # 删除已合并的分支
git branch -D branchname    # 强制删除
```

## 实用技巧

### 1. 暂存工作区

```bash
git stash               # 暂存当前修改
git stash pop           # 恢复暂存
git stash list          # 查看暂存列表
```

### 2. 拉取远程更新

```bash
git pull origin main    # 拉取并合并
git fetch origin        # 仅获取
```

### 3. 变基（Rebase）

```bash
git rebase main         # 整理提交历史
```

## 总结

熟练使用这些命令可以让你的版本控制工作更加高效。建议每天开始工作前先 `git pull`，完成后及时 `git push`。
