const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient('https://dunsoxftinfdbdjxbxci.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bnNveGZ0aW5mZGJkanhieGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2ODE4MTksImV4cCI6MjEwMDI1NzgxOX0.JYkeCP9Z0Cr0veQJAJ4rVvQqyBgrzrfvEUn2gclX6jw'); 

supabase.from('menu_items').select('*').then(({data}) => { 
    if(!data) { console.log("No data"); return; }
    const fs = require('fs'); 
    let sql = 'INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES \n'; 
    const values = data.map(i => `('${i.name.replace(/'/g, "''")}', '${i.category}', ${i.price}, '${(i.description||'').replace(/'/g, "''")}', '${i.image}', ${i.popular}, ${i.available}, ${i.prep_time}, ${i.sort_order})`); 
    sql += values.join(',\n') + ';'; 
    fs.writeFileSync('supabase/insert_menu.sql', sql); 
    console.log('Wrote insert_menu.sql with ' + data.length + ' items'); 
});
