# E-Commerce Workflow

电商 AI 工具集，包含白底图处理、虚拟模特试穿、场景引擎、纹理大师等模块。

## 功能模块

| 模块 | 说明 |
|------|------|
| **White-Label Hub** | 产品图白底处理：抠图、白底、AI 阴影，支持多种背景模式 |
| **Model Agent** | 虚拟试穿：上传服装图 + 选择模特类型，生成模特穿着效果（Replicate IDM-VTON） |
| **Scenario Engine** | 场景引擎（开发中） |
| **Texture Master** | 纹理大师（开发中） |

## 技术栈

- **前端**：React + TypeScript + Vite + Tailwind CSS
- **后端**：Supabase Edge Functions
- **AI 服务**：Photoroom API（白底）、Replicate（虚拟试穿）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填写：

```env
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 3. 部署后端（可选）

如需使用 White-Label Hub 和 Model Agent，需部署 Supabase Edge Functions，详见 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)。

### 4. 启动开发服务器

```bash
npm run dev
```

## 项目结构

```
src/
├── components/          # 通用组件
├── components/modules/  # 各功能模块
├── context/             # 全局状态
└── lib/                 # 工具与配置
supabase/
└── functions/           # Edge Functions
    ├── white-label-process   # 白底图处理
    └── model-agent-process   # 虚拟试穿
```

## License

MIT
