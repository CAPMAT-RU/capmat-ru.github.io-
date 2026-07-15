```javascript
const fs = require('fs');
const path = require('path');
const DOMAIN = 'https://rakurs-news.github.io';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

console.log('🚀 ЗАПУСК ГЕНЕРАТОРА SITEMAP...');
console.log(`📂 Рабочая директория: ${process.cwd()}`);
console.log(`📄 Ищем файл: ${path.join(process.cwd(), 'news.json')}`);

try {
  if (!fs.existsSync('news.json')) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Файл news.json не найден в текущей папке!');
    process.exit(1);
  }

  const fileContent = fs.readFileSync('news.json', 'utf8');
  console.log('✅ Файл news.json успешно прочитан.');

  let newsData;
  try {
    newsData = JSON.parse(fileContent);
  } catch (e) {
    console.error(`❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось распарсить JSON. Ошибка: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(newsData)) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: news.json должен содержать массив новостей []');process.exit(1);
  }

  console.log(`✅ Загружено новостей: ${newsData.length}`);

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${DOMAIN}/</loc>
<changefreq>daily</changefreq>
<priority>1.0</priority>
</url>
`;

  newsData.forEach((news, index) => {
    const safeId = escapeXml(news.id);
    const [day, month, year] = news.date.split('.');
    const isoDate = `${year}-${month}-${day}`;

    sitemap += ` <url>
<loc>${DOMAIN}/news.html?id=${safeId}</loc>
<lastmod>${isoDate}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>
`;
    if ((index + 1) % 10 === 0) {
      console.log(` → Обработано ${index + 1} новостей...`);
    }
  });  sitemap += '\n</urlset>';

  fs.writeFileSync('sitemap.xml', sitemap.trim(), 'utf8');

  const stats = fs.statSync('sitemap.xml');
  console.log(`✅ Файл sitemap.xml успешно создан!`);
  console.log(`📊 Размер файла: ${stats.size} байт.`);
  console.log(`🎉 ГОТОВО! Всего URL в карте: ${newsData.length + 1}`);

} catch (error) {
  console.error('💥 Неожиданная ошибка:', error.message);
  process.exit(1);
}
```
