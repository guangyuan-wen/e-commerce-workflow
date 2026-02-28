#!/usr/bin/env node
/**
 * 创建 model-agent-temp 存储桶
 * 用法: VITE_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/create-model-agent-bucket.mjs
 * Service Role Key 在 Supabase Dashboard → Project Settings → API 获取
 */
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('请设置 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const res = await fetch(`${url.replace(/\/$/, '')}/storage/v1/bucket`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'model-agent-temp',
    name: 'model-agent-temp',
    public: true,
    file_size_limit: 10 * 1024 * 1024,
    allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'],
  }),
});

if (res.ok) {
  console.log('存储桶 model-agent-temp 创建成功');
} else {
  const err = await res.json().catch(() => ({ message: res.statusText }));
  if (err.message?.includes('already exists') || res.status === 409) {
    console.log('存储桶 model-agent-temp 已存在');
  } else {
    console.error('创建失败:', err.message || err);
    process.exit(1);
  }
}
