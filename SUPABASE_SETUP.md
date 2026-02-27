# Supabase + White-Label Hub 配置指南

## 1. 项目配置（已完成）

- **Project URL**: `https://beuwfttrujmksnaofdci.supabase.co`
- **anon key**: 已写入 `.env.local`

## 2. 部署 Edge Function

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
npx supabase secrets set PHOTOROOM_API_KEY=sandbox_sk_pr_default_ea34232e410c65c34b783d4a3412b55bba72af1e
npx supabase secrets set REPLICATE_API_TOKEN=你的Replicate_API_Token
npm run supabase:deploy
npx supabase functions deploy model-agent-process
```

**Replicate API Token**：在 [replicate.com/account](https://replicate.com/account) 获取，用于 Model Agent（IDM-VTON 虚拟试穿）。

## 3. 验证

1. 运行 `npm run dev`
2. **White-Label Hub**：上传图片 → 选择模式 → Generate Amazon Main Image
3. **Model Agent**：上传服装图 → 选择模特类型（US Female / JP Female 等）→ Generate Model

---

**注意**：Photoroom Sandbox 密钥生成的结果带水印，正式使用需升级 Plus Plan。
