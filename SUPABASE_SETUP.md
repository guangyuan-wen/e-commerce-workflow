# Supabase + White-Label Hub 配置指南

## 1. 项目配置（已完成）

- **Project URL**: `https://beuwfttrujmksnaofdci.supabase.co`
- **anon key**: 已写入 `.env.local`

## 2. 创建 Model Agent 存储桶（必做）

Model Agent 处理大于 500KB 的图片时需临时上传到 Supabase Storage，请先创建存储桶：

**方式 A：Supabase Dashboard（推荐）**

1. 打开 [Supabase Dashboard → Storage](https://supabase.com/dashboard/project/beuwfttrujmksnaofdci/storage/buckets)
2. 点击 **New bucket**
3. 名称填 `model-agent-temp`
4. 勾选 **Public bucket**（公开）
5. 点击 **Create bucket**

**方式 B：命令行脚本**（若报 Invalid Compact JWS，请改用方式 A）

```bash
# 需使用 JWT 格式的 Service Role Key（部分项目为新格式 sb_secret_ 可能不兼容）
VITE_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/create-model-agent-bucket.mjs
```

## 3. 部署 Edge Function

### 步骤 1：登录 Supabase CLI

```bash
npx supabase login
```

会打开浏览器，完成登录后返回终端。

### 步骤 2：关联项目 + 设置密钥 + 部署

```bash
npx supabase link --project-ref beuwfttrujmksnaofdci
npx supabase secrets set PHOTOROOM_API_KEY=sandbox_sk_pr_default_ea34232e410c65c34b783d4a3412b55bba72af1e
npx supabase secrets set REPLICATE_API_TOKEN=你的Replicate_API_Token
npx supabase functions deploy white-label-process
npx supabase functions deploy model-agent-process
```

或使用 npm 脚本：

```bash
npm run supabase:link
# 先完成步骤 2 创建 model-agent-temp 存储桶
npx supabase secrets set PHOTOROOM_API_KEY=sandbox_sk_pr_default_ea34232e410c65c34b783d4a3412b55bba72af1e
npx supabase secrets set REPLICATE_API_TOKEN=你的Replicate_API_Token
npm run supabase:deploy
npx supabase functions deploy model-agent-process
```

**Replicate API Token**：在 [replicate.com/account](https://replicate.com/account) 获取，用于 Model Agent（IDM-VTON 虚拟试穿）。

## 4. 验证

1. 运行 `npm run dev`
2. **White-Label Hub**：上传图片 → 选择模式 → Generate Amazon Main Image
3. **Model Agent**：上传服装图 → 选择模特类型（US Female / JP Female 等）→ Generate Model

---

**注意**：Photoroom Sandbox 密钥生成的结果带水印，正式使用需升级 Plus Plan。
