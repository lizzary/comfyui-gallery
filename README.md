<p align="center">
  <img src="" alt="logo" width="120">
</p>

<h1 align="center">Gallery</h1>

<p align="center">
  <strong>AI 插画资产管理工具</strong> · AI Illustration Asset Manager
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## ✨ Features · 功能

<table>
<tr>
<th width="50%">🇬🇧 English</th>
<th width="50%">🇨🇳 中文</th>
</tr>
<tr>
<td>

- **Artist Management** — Create, rename, and delete artists. Set a cover illustration for each artist.
- **Batch Upload** — Multi-file upload with per-file progress tracking. Sequential processing ensures reliability.
- **AI Auto-tagging** — Automatically generates tags via WD EVA02-Large Tagger v3 on upload (optional).
- **ComfyUI Metadata Parsing** — Extracts generation parameters (prompt, model, seed, sampler, steps, CFG scale, LoRAs) directly from image metadata.
- **Full-text Search** — FTS5 prefix search across all tags with instant results.
- **Gallery Browsing** — Paginated grid view with adjustable page sizes. Sort by resolution, file size, or date.
- **Lightbox Viewer** — Full-screen image viewer with keyboard navigation (← →), detail panel (Ctrl+D) showing metadata and editable tags.
- **Color Grouping** — Group illustrations by custom tag/prompt rules with colored group borders. Define keyword pairs; unmatched items go to "Other".

</td>
<td>

- **画师管理** — 创建、重命名、删除画师。可为每位画师设置封面作品。
- **批量上传** — 多文件上传，逐个显示进度。顺序处理确保可靠性。
- **AI 自动标签** — 上传时使用 WD EVA02-Large Tagger v3 自动生成标签（可选）。
- **ComfyUI 元数据解析** — 从图片中提取生成参数（提示词、模型、种子、采样器、步数、CFG、LoRA）。
- **全文搜索** — 基于 FTS5 的标签前缀搜索，即时返回结果。
- **画廊浏览** — 分页网格视图，可调每页数量。按分辨率、文件大小、日期排序。
- **灯箱查看器** — 全屏浏览，键盘方向键切换，详情面板（Ctrl+D）展示元数据和可编辑标签。
- **颜色分组** — 按自定义标签/提示词规则分组，带彩色边框。定义关键词组，未匹配的归入"其他"。

</td>
</tr>
<tr>
<td>

- **Batch Operations** — Multi-select with Ctrl+Click / Shift+Click range. Batch download or delete selected illustrations.
- **Custom Download Naming** — Configurable filename format using placeholders like `<Seed>`, `<Model>`, `<artist>`, etc. Names are sanitized for cross-platform compatibility.
- **Thumbnail Quality** — Three quality levels switchable in real-time: Low (400px), Normal (1200px), Original.
- **Dark / Light Theme** — Toggle-able with persistent preference.
- **Bilingual i18n** — English and 中文 UI, switchable in settings.
- **Single-server Deploy** — Backend serves the built React frontend. No need for a separate web server.

</td>
<td>

- **批量操作** — Ctrl+点击多选 / Shift+点击范围选择。批量下载或删除选中作品。
- **自定义下载命名** — 可配置文件命名格式，使用 `<Seed>`、`<Model>`、`<artist>` 等占位符。文件名自动清理跨平台不兼容字符。
- **缩略图画质** — 三种画质实时切换：低画质 (400px)、标准 (1200px)、原图。
- **深色 / 浅色主题** — 一键切换，偏好持久保存。
- **双语国际化** — 英文 / 中文界面，设置中切换。
- **单服务部署** — 后端直接提供 React 构建产物，无需额外的 Web 服务器。

</td>
</tr>
</table>

---

## 📸 Screenshots · 截图

### 🏠 Home Page · 主页
> Artist grid with covers, search bar, dark/light toggle.

| Light · 浅色 | Dark · 深色 |
|---|---|
| ![home-light]() | ![home-dark]() |

### 👤 Artist Gallery · 画师画廊
> Full-screen overlay: pagination, sorting, grouping, quality selector, multi-select.

![artist-overlay]()

### 👁️ Lightbox · 灯箱查看器
> Full-screen viewer: arrow navigation, detail panel with metadata & editable tags.

![lightbox]()

### 🔍 Search · 搜索
> FTS5 prefix search results with the same filtering, grouping, and batch ops.

![search]()

### 🎨 Color Groups · 颜色分组
> Mutually-exclusive keyword groups with colored borders.

![color-groups]()

### 🏷️ Tags & Prompts · 标签与提示词
> All unique tags and prompt terms as filterable chips.

| Tags · 标签 | Prompts · 提示词 |
|---|---|
| ![tags]() | ![prompts]() |

### ⚙️ Settings · 设置
> Language, auto-tag, GPU acceleration, download naming format.

![settings]()

### 📥 Download Naming · 下载命名
> Chip-based input with tag autocomplete dropdown.

![naming-format]()

---

## 🚀 Quick Start · 快速开始

### Development · 开发模式

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
npm install
npm start
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### Production · 生产模式

```bash
cd frontend && npm run build
cd ../backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Visit `http://127.0.0.1:8000` — the backend serves both API and frontend from a single origin.

### Requirements · 依赖

| | |
|---|---|
| **Backend** | Python 3.10+, PyTorch, timm, Pillow, FastAPI, uvicorn |
| **Frontend** | Node.js 18+, React 19, Tailwind CSS 3 |
| **AI Model** | WD EVA02-Large Tagger v3 (~800MB, auto-downloaded on first use) |
| **GPU (optional)** | NVIDIA GPU with CUDA for faster tagging |

---

## 🛠️ Tech Stack · 技术栈

| Layer · 层 | Technology · 技术 |
|---|---|
| Frontend | React 19, Tailwind CSS 3, Framer Motion, Lucide Icons, React Router v7 |
| Backend | Python FastAPI, Uvicorn |
| Database | SQLite with FTS5 full-text search |
| Image Processing | Pillow, PyTorch, timm |
| AI Tagger | WD EVA02-Large Tagger v3 (HuggingFace) |
| i18n | Custom React context with localStorage persistence |

---

## 📁 Project Structure · 项目结构

```
gallery/
├── backend/
│   ├── main.py              # FastAPI app, all API routes
│   ├── database.py           # SQLite connection, schema init, FTS5
│   ├── models.py             # Pydantic models
│   ├── utils.py              # Image processing, tagger, metadata
│   ├── settings.json         # Backend settings (auto_tag, gpu_enabled)
│   ├── uploads/              # Uploaded files (originals + thumbnails)
│   └── models/               # Cached AI model weights
├── frontend/
│   ├── src/
│   │   ├── api/              # API client (fetch wrapper)
│   │   ├── components/       # React components
│   │   ├── contexts/         # ThemeContext, LocaleContext
│   │   ├── hooks/            # useGroupConfig, useQuality, useDownloadConfig
│   │   ├── i18n/             # Translation key-value maps
│   │   ├── pages/            # Route page components
│   │   ├── router/           # React Router config
│   │   └── utils/            # Grouping logic, helpers
│   └── build/                # Production build output
└── CLAUDE.md                 # AI coding guidance
```

---

## 📄 License · 许可证

MIT
