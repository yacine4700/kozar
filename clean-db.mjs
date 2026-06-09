import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env.local manually
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

async function clean() {
  console.log("Fetching all settings rows...");
  
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  const getRes = await fetch(`${url}/rest/v1/settings?select=id&order=updated_at.asc`, { headers });
  const data = await getRes.json();
  
  if (!getRes.ok) {
    console.error("Error fetching:", data);
    return;
  }
  
  console.log(`Found ${data.length} rows.`);
  
  if (data.length > 1) {
    const originalRow = data[0];
    const idsToDelete = data.slice(1).map(r => r.id);
    
    console.log(`Keeping original row: ${originalRow.id}`);
    console.log(`Deleting ${idsToDelete.length} spam rows...`);
    
    const deleteRes = await fetch(`${url}/rest/v1/settings?id=in.(${idsToDelete.join(',')})`, {
      method: 'DELETE',
      headers
    });
    
    if (!deleteRes.ok) {
      console.error("Failed to delete:", await deleteRes.text());
    } else {
      console.log("Cleanup successful!");
    }
  } else {
    console.log("No duplicates found. Database is clean.");
  }
}

clean();
