const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function getSupabaseConfig() {
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

export function getWhiteLabelProcessUrl() {
  const url = SUPABASE_URL;
  if (!url) return null;
  return `${url.replace(/\/$/, '')}/functions/v1/white-label-process`;
}

export function getModelAgentProcessUrl() {
  const url = SUPABASE_URL;
  if (!url) return null;
  return `${url.replace(/\/$/, '')}/functions/v1/model-agent-process`;
}
