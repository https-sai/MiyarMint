import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.DB_URL!;
const supabaseAnonKey = process.env.DB_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

