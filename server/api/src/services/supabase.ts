// initialize a separate client using the service role key
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.DB_URL!;
const supabaseServiceRoleKey = process.env.DB_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
