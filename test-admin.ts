import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

const adminSupabase = createClient(url, key);

async function run() {
  const { data, error } = await adminSupabase.from('settings').select('*');
  console.log("All settings rows:", data?.length, "rows");
  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("First row ID:", data[0].id);
    console.log("Keys available:", Object.keys(data[0]));
  }
}

run();
