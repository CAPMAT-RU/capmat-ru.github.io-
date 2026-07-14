const fs = require('fs');
const path = require('path');

// В GitHub Actions process.cwd() всегда указывает в корень репозитория
const filePath = path.join(process.cwd(), 'news.json');

console.log('DEBUG: Working dir:', process.cwd());
console.log('DEBUG: Looking for file:', filePath);

if (!fs.existsSync(filePath)) {
    console.error('ERROR: File not found!');
    const files = fs.readdirSync(process.cwd());
    console.log('Files in directory:', files);
    process.exit(1);
}

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const news = JSON.parse(data);
    
    if (!Array.isArray(news)) {
        throw new Error('JSON is not an array');
    }

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
        const slug = article.id
            .replace(/–/g, '-')
            .replace(/[^a-z0-9-]/gi, '-')
            .toLowerCase();
        
        xml += `
  <url>
    <loc>${baseUrl}/news.html?id=${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    fs.writeFileSync('sitemap.xml', xml);
    console.log('SUCCESS: sitemap.xml created');
} catch (err) {
    console.error('PARSE ERROR:', err.message);
    process.exit(1);
}
