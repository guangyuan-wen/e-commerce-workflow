import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REPLICATE_API = 'https://api.replicate.com/v1/predictions';
/** cuuupid/idm-vton: 虚拟试穿，服装图 + 人物图 → 模特穿该服装 */
const IDM_VTON_VERSION = '0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985';
const MB = 1024 * 1024;
const MAX_FILE_SIZE = 10 * MB;
const STORAGE_BUCKET = 'model-agent-temp';
const DATA_URL_MAX_BYTES = 500 * 1024;

const HF_BASE = 'https://huggingface.co/spaces/yisol/IDM-VTON/resolve/main/example/human';

/**
 * 各模特类型对应的默认人物图（需 3:4 比例、站立正面、适合试穿）
 * 扩展：在此添加新 id，并在 ModelAgentModule 的 MODEL_TAGS 中同步
 * 图源：可换 HF/Replicate 示例、Unsplash、或上传到 Supabase Storage 后取 publicUrl
 */
const DEFAULT_MODEL_IMAGES: Record<string, string> = {
  US_FEMALE: `${HF_BASE}/taylor-.jpg`,
  JP_FEMALE: `${HF_BASE}/00034_00.jpg`,
  MIDDLE_EAST_MALE: `${HF_BASE}/Jensen.jpeg`,
  EU_FEMALE: `${HF_BASE}/00035_00.jpg`,
  ASIAN_MALE: `${HF_BASE}/will1%20(1).jpg`,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiToken = Deno.env.get('REPLICATE_API_TOKEN');
  if (!apiToken) {
    return new Response(
      JSON.stringify({ error: 'REPLICATE_API_TOKEN not configured. Run: supabase secrets set REPLICATE_API_TOKEN=your_token' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Expected multipart/form-data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const modelType = (formData.get('modelType') as string) || 'US_FEMALE';
    const rawCategory = (formData.get('garmentCategory') as string) || 'upper_body';
    const garmentCategory = ['upper_body', 'lower_body', 'dresses'].includes(rawCategory) ? rawCategory : 'upper_body';

    if (!imageFile || !(imageFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Missing image file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Image too large (max 10MB)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const humanImg = DEFAULT_MODEL_IMAGES[modelType] || DEFAULT_MODEL_IMAGES.US_FEMALE;

    let garmImgUrl: string;
    let storagePathToRemove: string | null = null;
    const imageBytes = await imageFile.arrayBuffer();
    const mimeType = imageFile.type || 'image/jpeg';

    if (imageBytes.byteLength <= DATA_URL_MAX_BYTES) {
      const bytes = new Uint8Array(imageBytes);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      garmImgUrl = `data:${mimeType};base64,${btoa(binary)}`;
    } else {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const fileName = `input-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, imageBytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return new Response(
          JSON.stringify({
            error: '图片过大，请压缩后重试（建议 < 500KB）',
            details: `或创建存储桶 "${STORAGE_BUCKET}"：Supabase Dashboard → Storage → New bucket → 公开`,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      storagePathToRemove = uploadData.path;
      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path);
      garmImgUrl = urlData.publicUrl;
    }

    const createRes = await fetch(REPLICATE_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=60',
      },
      body: JSON.stringify({
        version: IDM_VTON_VERSION,
        input: {
          garm_img: garmImgUrl,
          human_img: humanImg,
          garment_des: garmentCategory === 'dresses' ? 'dress' : garmentCategory === 'lower_body' ? 'pants, trousers' : 'top, jacket, shirt',
          category: garmentCategory,
          force_dc: garmentCategory === 'dresses',
          crop: true,
          steps: 30,
        },
      }),
    });

    if (storagePathToRemove) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePathToRemove]);
      } catch {
        /* ignore cleanup errors */
      }
    }

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Replicate API error:', createRes.status, errText);
      let errObj: { detail?: string; message?: string } = {};
      try {
        errObj = JSON.parse(errText);
      } catch {
        errObj = { detail: errText };
      }
      const errMsg = errObj.detail || errObj.message || errText.slice(0, 200);
      return new Response(
        JSON.stringify({
          error: errMsg || 'Replicate 处理失败',
          details: errText.slice(0, 400),
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prediction = await createRes.json();

    if (prediction.status === 'failed') {
      return new Response(
        JSON.stringify({
          error: 'Model generation failed',
          details: prediction.error || prediction.logs?.slice(-500) || 'Unknown error',
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const output = prediction.output;
    if (!output) {
      return new Response(
        JSON.stringify({ error: 'No output from model (may have timed out)' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resultImageUrl = Array.isArray(output) ? output[0] : output;
    if (typeof resultImageUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid output format' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imgRes = await fetch(resultImageUrl);
    if (!imgRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch generated image' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBuffer = await imgRes.arrayBuffer();
    const resultContentType = imgRes.headers.get('content-type') || 'image/png';

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': resultContentType,
      },
    });
  } catch (err) {
    console.error('model-agent-process error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
