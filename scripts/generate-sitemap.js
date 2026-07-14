const fs = require('fs');
const path = require('path');

// 1. Громко говорим, где мы находимся
console.log('🚀 START: Генерирую sitemap...');
console.log('📁 process.cwd():', process.cwd());
console.log('📂 __dirname (папка скрипта):', __dirname);

// 2. Строим путь к news.json (поднимаемся из scripts на уровень выше)
const rootDir = path.resolve(__dirname, '..');
const newsPath = path.join(rootDir, 'news.json');

console.log('🔍 Ищу файл по пути:', newsPath);

// 3. ПРОВЕРКА: А вообще этот файл существует?
if (!fs.existsSync(newsPath)) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА: Файл news.json НЕ НАЙДЕН!');
    
    // Показываем, что реально лежит в папке, чтобы ты увидел подвох
    try {
        const files = fs.readdirSync(rootDir);
        console.log('📋 Список файлов в корне проекта:', files);
    } catch (e) {
        console.error('Не удалось прочитать папку:', e.message);
    }
    
    process.exit(1); // Останавливаем сборку, чтобы ты это увидел
}

// 4. Читаем и парсим JSON
let news;
try {
    const rawData = fs.readFileSync(newsPath, 'utf8');
    news = JSON.parse(rawData);
    console.log(`✅ Файл найден! Загружено новостей: ${Array.isArray(news) ? news.length : 'не массив'}`);
} catch (err) {
    console.error('💥 ОШИБКА при чтении JSON:', err.message);
    process.exit(1);
}

// Если данные не массив — тоже ошибка
if (!Array.isArray(news)) {
    console.error('💥 Ошибка: news.json должен содержать список новостей (массив []), а не объект {}');
    process.exit(1);
}

// --- Дальше идёт твоя логика генерации ---
const baseUrl = 'https://rakurs-news.github.io';

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

news.forEach(article => {
    if (!article.id) {
        return; // Пропускаем битые статьи
    }

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

// Пишем sitemap.xml в корень
const sitemapPath = path.join(rootDir, 'sitemap.xml');
try {
    fs.writeFileSync(sitemapPath, xml);
    console.log(`🎉 Sitemap успешно создан: ${sitemapPath}`);
} catch (err) {
    console.error('💥 Не удалось записать sitemap.xml:', err.message);
    process.exit(1);
}

