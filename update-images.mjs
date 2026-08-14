import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: menuItems, error: fetchError } = await supabase.from('menu_items').select('*');
  if (fetchError) throw fetchError;

  const imagesDir = 'public/images/menu';
  const files = fs.readdirSync(imagesDir);

  for (const item of menuItems) {
    // try to find matching file
    // slugify name: 'Deccan Chai' -> 'deccan-chai'
    let slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (slug.endsWith('-')) slug = slug.slice(0, -1);
    
    let matchedFile = files.find(f => f === `${slug}.jpg` || f === `${slug}.png`);
    
    // fallbacks
    if (!matchedFile) {
       matchedFile = files.find(f => f.includes(slug));
    }
    
    if (matchedFile) {
      console.log(`Updating ${item.name} with /images/menu/${matchedFile}`);
      const { error: updateError } = await supabase.from('menu_items').update({ image: `/images/menu/${matchedFile}` }).eq('id', item.id);
      if (updateError) console.error('Error updating', item.name, updateError);
    } else {
      console.log(`No local image found for ${item.name} (slug: ${slug})`);
    }
  }
}

run();
