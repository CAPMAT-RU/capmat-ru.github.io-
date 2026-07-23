console.log('Скрипт запустился');

document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const loader = document.getElementById('loader');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('searchInput');
    const featuredNewsContainer = document.getElementById('main-news');
    const progressBar = document.getElementById('progress-bar');
    const scrollToTopButton = document.getElementById('scrollToTop');

    let allNewsData = [];
    let currentCategory = 'all';

    // --- 1. ЗАГРУЗКА НОВОСТЕЙ (НЕ ТРОГАТЬ) ---
    fetch('news.json')
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allNewsData = data.items;
            
            // Показываем главную новость
            if (data.featuredNewsId && allNewsData.length > 0) {
                const featuredNews = allNewsData.find(item => item.id === data.featuredNewsId);
                if (featuredNews) displayFeaturedNews(featuredNews);
            }

            // Показываем список новостей
            displayNews(allNewsData);
            
            loader.style.display = 'none'; // Скрываем лоадер ТОЛЬКО после успеха
        })
        .catch(error => {
            console.error('Ошибка загрузки новостей:', error);
            loader.textContent = 'Не удалось загрузить новости. Проверьте консоль.';
        });

    // --- ФУНКЦИИ ОТРИСОВКИ ---
    function displayFeaturedNews(newsItem) {
        featuredNewsContainer.style.display = 'block';
        featuredNewsContainer.innerHTML = `
            <div class="featured-news-card">
                <img src="${newsItem.image}" alt="${newsItem.title}" class="featured-news-image">
                <div class="featured-news-content">
                    <h2 class="featured-news-title">${newsItem.title}</h2>
                    <p class="featured-news-date">${newsItem.date}</p>
                    <p class="featured-news-description">${newsItem.description}</p>
                    <a href="#" class="read-more-featured" data-id="${newsItem.id}">Читать полностью</a>
                </div>
            </div>
        `;
        featuredNewsContainer.querySelector('.read-more-featured').addEventListener('click', (e) => {
            e.preventDefault();
            handleReadMoreClick(e.target.getAttribute('data-id'));
        });
    }

    function displayNews(newsArray) {
        newsContainer.innerHTML = '';
        if (!newsArray || newsArray.length === 0) {
            newsContainer.innerHTML = '<p>Новостей не найдено.</p>';
            return;
        }

        newsArray.forEach(newsItem => {
            const formattedDate = new Date(newsItem.date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
            
            const newsElement = document.createElement('div');
            newsElement.classList.add('news-item');
            newsElement.innerHTML = `
                <div class="news-card">
                    <img src="${newsItem.image}" alt="${newsItem.title}" class="news-image">
                    <div class="news-content">
                        <h3 class="news-title">${newsItem.title}</h3>
                        <p class="news-date">${formattedDate}</p>
                        <p class="news-description">${newsItem.description}</p>
                        <a href="#" class="read-more" data-id="${newsItem.id}">Читать далее</a>
                    </div>
                </div>
            `;
            newsContainer.appendChild(newsElement);
        });
    }

    // --- ФИЛЬТРАЦИЯ И ПОИСК ---
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.getAttribute('data-category');
            filterNews();
        });
    });

    function filterNews() {
        const filtered = currentCategory === 'all' 
            ? allNewsData 
            : allNewsData.filter(item => item.category === currentCategory);
        displayNews(filtered);
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length > 1) {
            const filtered = allNewsData.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
            displayNews(filtered);
        } else if (query.length === 0) {
            filterNews();
        }
    });

    // --- ЧТЕНИЕ НОВОСТЕЙ ---
    function handleReadMoreClick(newsId) {
        const item = allNewsData.find(i => i.id === newsId);
        if (item) alert(`Вы кликнули: ${item.title}`);
    }

    newsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('read-more')) {
            event.preventDefault();
            handleReadMoreClick(event.target.getAttribute('data-id'));
        }
    });

    // --- ПРОКРУТКА И ПРОГРЕСС-БАР ---
    window.onscroll = function() {
        scrollFunction();
        progressBarScroll();
    };

    function scrollFunction() {
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        scrollToTopButton.style.display = (scrollTop > 20) ? "block" : "none";
    }

    function scrollToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    function progressBarScroll() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (height > 0) {
            progressBar.style.width = ((winScroll / height) * 100) + '%';
        }
    }

    // --- 2. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ (ИСПРАВЛЕНО) ---
    const themeToggleBtn = document.querySelector('.theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.removeItem('theme');
            }
        });
    }

    // Проверка сохраненной темы при старте
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme'); // Гарантированно убираем, если была
    }
});