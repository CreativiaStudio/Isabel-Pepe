import { supabase, supabaseAdmin } from '../lib/supabase.js';

async function check() {
  console.log("Checking supabase query from lib/supabase...");
  const { data: anonData, error: anonErr } = await supabase.from('products').select('*').limit(5);
  console.log("Anon query error:", anonErr);
  console.log("Anon query rows count:", anonData ? anonData.length : 0);
  if (anonData && anonData.length > 0) {
    console.log("Sample anon row:", anonData[0].name, anonData[0].seo_title, anonData[0].gemstone);
  }

  const { data: adminData, error: adminErr } = await supabaseAdmin.from('products').select('*').limit(5);
  console.log("Admin query error:", adminErr);
  console.log("Admin query rows count:", adminData ? adminData.length : 0);
  if (adminData && adminData.length > 0) {
    console.log("Sample admin row:", adminData[0].name, adminData[0].seo_title, adminData[0].gemstone);
  }
}

check().catch(console.error);
