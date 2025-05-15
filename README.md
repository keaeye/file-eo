# GitPush 上传项目

本项目基于 Next.js，部署在 Vercel，提供多文件上传到 GitHub 仓库功能，自动识别文件类型分类上传。

## 主要功能

- 多文件选择上传
- 上传进度条显示
- 上传历史记录（浏览器本地保存）
- 自动路径分类（images, docs, notes, code, misc）
- 中文界面
- 适合部署到 `gitpush.keaeye.com`

## 部署步骤

1. 在 GitHub 生成 `repo` 权限的 Token，复制。

2. 克隆项目到本地：
   ```bash
   git clone <你的仓库地址>
   cd <项目目录>
