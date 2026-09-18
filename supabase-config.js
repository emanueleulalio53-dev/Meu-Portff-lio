import { createClient } from "@supabase/supabase-js";

// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================
// Preencha os dois placeholders abaixo com os dados do seu projeto.
// No painel do Supabase:
//   Project Settings -> API
//     - Project URL        -> SUPABASE_URL
//     - Project API keys -> anon/public (publishable) key -> SUPABASE_PUBLISHABLE_KEY
//
// IMPORTANTE:
// - Use a chave anon/public (PUBLISHABLE). NUNCA coloque a service_role no frontend.
// - O "secret" (service_role) só pode ser usado no servidor.
// ============================================================

const SUPABASE_URL = "https://xoqgsloosifdfowwvfhq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_zIJ_LGiRjWPfGTlS7RoCwQ_e6ooFi7-";

export { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

if (
  SUPABASE_URL.startsWith("SUA_") ||
  SUPABASE_PUBLISHABLE_KEY.startsWith("SUA_")
) {
  console.error(
    "[Supabase] Configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY em supabase-config.js antes de usar o login."
  );
}