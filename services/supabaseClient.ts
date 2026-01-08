import { createClient } from '@supabase/supabase-js'
export const supabaseUrl = 'https://rtzwvdwsyupkbuovzkhk.supabase.co'
export const supabaseKey = 'sb_publishable_kb38CrjY3PFE7SGW3_Djjg_M9vwzitL'
export const supabase = createClient(supabaseUrl, supabaseKey)
