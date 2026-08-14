const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/['"\r]/g, '').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("DB Error:", error);
    return;
  }
  console.log("TOTAL_PRODUCTS_IN_DB:", products.length);
  fs.writeFileSync(
    './.agents/explorer_catalog/db_dump.json',
    JSON.stringify(products, null, 2)
  );
  console.log("Dump saved to .agents/explorer_catalog/db_dump.json");
}

inspect();
