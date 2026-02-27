import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const PHOTOROOM_URL = 'https://image-api.photoroom.com/v2/edit';
const MB = 1024 * 1024;
const MAX_FILE_SIZE = 10 * MB;

/** Amazon Main Image 模式：1:1 纯白底、商品居中、光影补全、去除模特 */
const AMAZON_MAIN_IMAGE_PROMPT =
  'Keep only the clothing item, remove the human model. Professional product photography, pure white background, realistic soft drop shadow, studio lighting.';

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

  const apiKey = Deno.env.get('PHOTOROOM_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'PHOTOROOM_API_KEY not configured' }),
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
    const shadowIntensity = parseInt(formData.get('shadowIntensity') as string || '50', 10);
    const backgroundStyle = (formData.get('backgroundStyle') as string) || 'PURE_WHITE';

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

    const shadowMode = shadowIntensity >= 50 ? 'ai.hard' : 'ai.soft';

    const photoroomForm = new FormData();
    photoroomForm.append('imageFile', imageFile, imageFile.name || 'image.jpg');

    // Amazon Main Image 模式
    photoroomForm.append('removeBackground', 'true');
    const bgColor = backgroundStyle === 'TRANSPARENT' ? null : {
      PURE_WHITE: 'FFFFFF',
      STUDIO_GREY: 'E5E5E5',
      DARK_MODE: '1A1A1A',
    }[backgroundStyle] || 'FFFFFF';
    if (bgColor) {
      photoroomForm.append('background.color', bgColor);
    }
    photoroomForm.append('shadow.mode', shadowMode);

    // 1:1 比例、商品居中
    photoroomForm.append('outputSize', '1000x1000');
    photoroomForm.append('horizontalAlignment', 'center');
    photoroomForm.append('verticalAlignment', 'center');
    photoroomForm.append('padding', '0.15');

    // 商品聚焦：若原图有模特，去除模特只保留服装
    photoroomForm.append('describeAnyChange.mode', 'ai.auto');
    photoroomForm.append('describeAnyChange.prompt', AMAZON_MAIN_IMAGE_PROMPT);

    const photoroomRes = await fetch(PHOTOROOM_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: photoroomForm,
    });

    if (!photoroomRes.ok) {
      const errText = await photoroomRes.text();
      console.error('Photoroom API error:', photoroomRes.status, errText);
      return new Response(
        JSON.stringify({
          error: 'Photoroom processing failed',
          details: photoroomRes.status === 402 ? 'API quota exceeded or invalid key' : errText.slice(0, 200),
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBuffer = await photoroomRes.arrayBuffer();
    const resultContentType = photoroomRes.headers.get('content-type') || 'image/png';

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': resultContentType,
      },
    });
  } catch (err) {
    console.error('white-label-process error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
