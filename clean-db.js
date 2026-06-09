const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually to avoid dotenv dependency
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(url, key);

async function clean() {
  console.log("Fetching all settings rows...");
  const { data, error } = await supabase.from('settings').select('id').order('created_at', { ascending: true });
  
  if (error) {
    console.error("Error fetching:", error);
    return;
  }
  
  console.log(`Found ${data.length} rows.`);
  
  if (data.length > 1) {
    const originalRow = data[0];
    const idsToDelete = data.slice(1).map(r => r.id);
    
    console.log(`Keeping original row: ${originalRow.id}`);
    console.log(`Deleting ${idsToDelete.length} spam rows...`);
    
    const { error: deleteError } = await supabase.from('settings').delete().in('id', idsToDelete);
    
    if (deleteError) {
      console.error("Failed to delete:", deleteError);
    } else {
      console.log("Cleanup successful!");
    }
  } else {
    console.log("No duplicates found. Database is clean.");
  }
}

clean();
