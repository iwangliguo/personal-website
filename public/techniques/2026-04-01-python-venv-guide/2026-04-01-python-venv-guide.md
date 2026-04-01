---
title: Python 虚拟环境完全指南
date: 2026-04-01
isPublic: true
tags:
  - Python
  - 开发环境
---

## 前言

Python 虚拟环境是 Python 开发中不可或缺的工具，它可以帮助我们隔离不同项目的依赖，避免版本冲突。

## 什么是虚拟环境

虚拟环境是一个独立的 Python 运行环境，包含独立的 Python 解释器、包安装目录等。通过虚拟环境，我们可以：

- 为每个项目创建独立的依赖环境
- 避免全局包版本冲突
- 方便项目迁移和部署

## 创建虚拟环境

使用 `venv` 模块创建虚拟环境：

```bash
# 创建虚拟环境
python -m venv myenv

# 激活虚拟环境（Linux/Mac）
source myenv/bin/activate

# 激活虚拟环境（Windows）
myenv\Scripts\activate
```

## 使用虚拟环境

激活后，使用 `pip` 安装的包只会出现在当前虚拟环境中：

```bash
# 安装包
pip install requests

# 查看已安装的包
pip list

# 导出依赖
pip freeze > requirements.txt
```

## 常用命令汇总

| 命令 | 说明 |
|------|------|
| `python -m venv env` | 创建虚拟环境 |
| `source env/bin/activate` | 激活（Linux/Mac） |
| `env\Scripts\activate` | 激活（Windows） |
| `deactivate` | 退出虚拟环境 |
| `pip freeze > requirements.txt` | 导出依赖 |

## 小技巧

### 使用 virtualenvwrapper 管理多个环境

```bash
# 安装
pip install virtualenvwrapper-win  # Windows
pip install virtualenvwrapper      # Linux/Mac

# 创建环境
mkvirtualenv myproject

# 切换环境
workon myproject
```

## 总结

掌握虚拟环境的使用是 Python 开发者的必备技能，建议在所有项目中都使用虚拟环境来管理依赖。
