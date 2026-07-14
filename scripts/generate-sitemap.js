const fs = require('fs');
const path = require('path');

// 1. Самое важное: в GitHub Actions process.cwd() — это корень репозитория
const rootDir = process.cwd();
const newsPath = path.join(rootDir, 'news.json');
const sitemapPath = path.join(rootDir, 'sitemap.xml');

console.log('🚀 START: Генерирую sitemap...');
console.log('📁 Рабочая папка (cwd):', rootDir);
console.log('🔍 Ищу news.json по пути:', newsPath);

// 2. Жесткая проверка существования файла
if (!fs.existsSync(newsPath)) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА: Файл news.json НЕ НАЙДЕН!');
    
    // Выводим список ВСЕХ файлов в корне, чтобы ты увидел правду
    try {
        const files = fs.readdirSync(rootDir);
        console.error('📋 ФАЙЛЫ, КОТОРЫЕ ВИДИТ СИСТЕМА В КОРНЕ:', files);
    } catch (e) {
        console.error('Не удалось прочитать папку:', e.message);
    }
    
    process.exit(1); // Гарантированно сделаем сборку красной и заметной
}

// 3. Чтение и парсинг
let news;
try {
    const rawData = fs.readFileSync(newsPath, 'utf8');
    news = JSON.parse(rawData);
    console.log(`✅ Файл найден и прочитан. Элементов: ${Array.isArray(news) ? news.length : 'НЕ МАССИВ'}`);
} catch (err) {
    console.error('💥 ОШИБКА ПАРСИНГА JSON:', err.message);
    process.exit(1);
}

if (!Array.isArray(news)) {
    console.error('💥 Ошибка: news.json должен быть массивом [...]');
    process.exit(1);
}

// 4. Генерация XML
const baseUrl = 'https://rakurs-news.github.io';

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

news.forEach(article => {
    if (!article.id) return;

    const id = article.id;
    let slug = id
        .replace(/–/g, '-')
        .replace(/[^a-z0-9-]/gi, '-')
        .toLowerCase();

    const loc = `${baseUrl}/news.html?id=${slug}`;

    xml += `
  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

xml += `\n</urlset>`;

// 5. Запись файла
try {
    fs.writeFileSync(sitemapPath, xml);
    console.log(`🎉 Sitemap создан: ${sitemapPath}`);
    
    // Для проверки: выведем первые 100 символов созданного файла
    const check = fs.readFileSync(sitemapPath, 'utf8').substring(0, 100);
    console.log('📝 Проверка начала файла:', check);
} catch (err) {
    console.error('💥 Не удалось записать sitemap.xml:', err.message);
    process.exit(1);
}
