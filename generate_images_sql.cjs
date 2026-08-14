const fs = require('fs');

const items = [
    { name: 'Deccan Chai', filename: 'deccan-chai.jpg' },
    { name: 'Elaichi Tea', filename: 'elaichi-tea.jpg' },
    { name: 'Kadak Tea', filename: 'kadak-tea.jpg' },
    { name: 'Badam Tea', filename: 'badam-tea.jpg' },
    { name: 'Masala Tea', filename: 'masala-tea.jpg' },
    { name: 'Ginger Tea', filename: 'ginger-tea.jpg' },
    { name: 'Ginger Lemon Tea', filename: 'ginger-lemon-tea.jpg' },
    { name: 'Coffee', filename: 'coffee.jpg' },
    { name: 'Black Coffee', filename: 'black-coffee.jpg' },
    { name: 'Green Tea', filename: 'green-tea.jpg' },
    { name: 'Lemon Tea', filename: 'lemon-tea.jpg' },
    { name: 'Black Tea', filename: 'black-tea.jpg' },
    { name: 'Thati Bellam Tea', filename: 'thati-bellam-tea.jpg' },
    { name: 'Thati Bellam Coffee', filename: 'thati-bellam-coffee.jpg' },
    { name: 'Allam Bellam Coffee', filename: 'allam-bellam-coffee.jpg' },
    { name: 'Bellam Tea', filename: 'bellam-tea.jpg' },
    { name: 'Cold Coffee', filename: 'cold-coffee.jpg' },
    { name: 'Chilled Badam', filename: 'chilled-badam.jpg' },
    { name: 'Rose Milk', filename: 'rose-milk.jpg' },
    { name: 'Mango Lassi', filename: 'mango-lassi.jpg' },
    { name: 'Strawberry Lassi', filename: 'strawberry-lassi.jpg' },
    { name: 'Banana Lassi', filename: 'banana-lassi.jpg' },
    { name: 'Sweet Lassi', filename: 'sweet-lassi.jpg' },
    { name: 'Chocolate Lassi', filename: 'chocolate-lassi.jpg' },
    { name: 'Oreo', filename: 'oreo.jpg' },
    { name: 'Dark Chocolate', filename: 'dark-chocolate.jpg' },
    { name: 'Irish Cream', filename: 'irish-cream.jpg' },
    { name: 'Strawberry', filename: 'strawberry.jpg' },
    { name: 'Mango', filename: 'mango.jpg' },
    { name: 'Black Current', filename: 'black-current.jpg' },
    { name: 'Pineapple', filename: 'pineapple.jpg' },
    { name: 'Water Melon', filename: 'water-melon.jpg' },
    { name: 'Blue Mojito', filename: 'blue-mojito.jpg' },
    { name: 'Lime Mint', filename: 'lime-mint.jpg' },
    { name: 'Strawberry Mojito', filename: 'strawberry-mojito.jpg' },
    { name: 'Mango Mojito', filename: 'mango-mojito.jpg' },
    { name: 'Osmania Biscuit', filename: 'osmania-biscuit.jpg' },
    { name: 'Veg Puff', filename: 'veg-puff.jpg' },
    { name: 'Egg Puff', filename: 'egg-puff.jpg' },
    { name: 'Samosa', filename: 'samosa.jpg' }
];

let sql = '';
for(let item of items) {
    sql += `UPDATE menu_items SET image = '/images/menu/${item.filename}' WHERE name = '${item.name}';\n`;
}

fs.writeFileSync('supabase/update_images.sql', sql);
console.log('Created update_images.sql');
