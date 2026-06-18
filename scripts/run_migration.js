// Script to run SQL migration on Supabase via REST API
const fs = require('fs');
const https = require('https');

const sql = fs.readFileSync('scripts/supabase_refund_tracking.sql', 'utf8');
const envContent = fs.readFileSync('.env.local', 'utf8');

function getEnv(key) {
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(key + '=')) {
      return trimmed.substring(key.length + 1).replace(/^["']|["']$/g, '');
    }
  }
  return null;
}

const projectUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!projectUrl || !serviceRoleKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const projectRef = projectUrl.replace('https://', '').replace('.supabase.co', '');

console.log(`Connecting to Supabase project: ${projectRef}`);
console.log('Executing SQL migration...\n');

// Use Supabase Management API to execute SQL
const data = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  path: '/v1/projects/' + projectRef + '/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + serviceRoleKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ SQL migration executed successfully!');
      console.log('Tables created/updated:');
      console.log('  - refund_requests');
      console.log('  - support_tickets (updated with tracking_id, admin_response)');
      process.exit(0);
    } else {
      // Try alternative approach - direct SQL endpoint
      console.log(`Management API returned ${res.statusCode}. Trying direct SQL endpoint...`);
      tryDirectSql(projectUrl, serviceRoleKey, sql);
    }
  });
});

req.on('error', (e) => {
  console.error('Management API failed:', e.message);
  console.log('Trying direct SQL endpoint...');
  tryDirectSql(projectUrl, serviceRoleKey, sql);
});

req.write(data);
req.end();

function tryDirectSql(url, key, query) {
  const urlObj = new URL(url);
  
  const postData = JSON.stringify({ query: query });
  
  const options = {
    hostname: urlObj.hostname,
    path: '/rest/v1/rpc/',
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req2 = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ SQL executed via REST API!');
      } else {
        console.log(`REST API returned ${res.statusCode}. Trying raw SQL endpoint...`);
        tryRawSql(url, key, query);
      }
    });
  });

  req2.on('error', () => {
    console.log('REST API failed too. Trying raw SQL endpoint...');
    tryRawSql(url, key, query);
  });

  req2.write(postData);
  req2.end();
}

function tryRawSql(url, key, query) {
  const urlObj = new URL(url);
  
  const options = {
    hostname: urlObj.hostname,
    path: '/sql',
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'text/plain'
    }
  };

  const req3 = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ SQL executed via /sql endpoint!');
        process.exit(0);
      } else {
        console.log(`\n❌ Could not run SQL automatically (status ${res.statusCode}).`);
        console.log('Response:', body.slice(0, 500));
        console.log('\n⚠️  You need to run the SQL manually in Supabase Dashboard.');
        console.log('   Opening instructions for you...\n');
        printInstructions(projectRef);
        process.exit(1);
      }
    });
  });

  req3.on('error', (e) => {
    console.error('Raw SQL endpoint failed:', e.message);
    console.log('\n⚠️  You need to run the SQL manually in Supabase Dashboard.');
    printInstructions(projectRef);
    process.exit(1);
  });

  req3.write(query);
  req3.end();
}

function printInstructions(ref) {
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│                                                     │');
  console.log('│   📋 STEP-BY-STEP: Run SQL in Supabase Dashboard    │');
  console.log('│                                                     │');
  console.log('└─────────────────────────────────────────────────────┘');
  console.log();
  console.log('1️⃣  Open this link in your browser:');
  console.log(`   https://supabase.com/dashboard/project/${ref}/sql/new`);
  console.log();
  console.log('2️⃣  Copy the entire content of this file:');
  console.log('   📄 scripts/supabase_refund_tracking.sql');
  console.log();
  console.log('3️⃣  Paste it in the SQL Editor on the Supabase page');
  console.log();
  console.log('4️⃣  Click the "Run" button (▶)');
  console.log();
  console.log('5️⃣  You should see "Success. No rows returned" ✅');
  console.log();
  console.log('That is it! Takes only 30 seconds. 🚀');
}
