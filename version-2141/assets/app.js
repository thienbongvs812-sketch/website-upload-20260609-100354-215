(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  var filterGrid = document.querySelector('[data-filter-grid]');

  if (filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-card]'));
    var keywordInput = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-filter-empty]');

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function includesText(card, keyword) {
      if (!keyword) {
        return true;
      }

      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();

      return text.indexOf(keyword) !== -1;
    }

    function matches(card, attr, value) {
      return !value || String(card.getAttribute(attr) || '').toLowerCase() === value;
    }

    function applyFilters() {
      var keyword = valueOf(keywordInput);
      var region = valueOf(regionSelect);
      var type = valueOf(typeSelect);
      var year = valueOf(yearSelect);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var visible = includesText(card, keyword) &&
          matches(card, 'data-region', region) &&
          matches(card, 'data-type', type) &&
          matches(card, 'data-year', year);

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.movieSearchData) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var title = searchPage.querySelector('[data-search-title]');
    var summary = searchPage.querySelector('[data-search-summary]');

    if (input) {
      input.value = query;
    }

    function renderCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '<a class="card-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="card-score">' + escapeHtml(movie.rating) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
        '<div class="card-meta">',
        '<span>' + escapeHtml(movie.region) + '</span>',
        '<span>' + escapeHtml(movie.year) + '</span>',
        '<span>' + escapeHtml(movie.type) + '</span>',
        '</div>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="card-tags">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (query) {
      var lower = query.toLowerCase();
      var matched = window.movieSearchData.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase().indexOf(lower) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = '搜索结果';
      }

      if (summary) {
        summary.textContent = matched.length ? '已为你找到相关影片。' : '没有找到匹配影片。';
      }

      if (results) {
        results.innerHTML = matched.length ? matched.map(renderCard).join('') : '<div class="empty-state is-visible">没有找到匹配影片</div>';
      }
    }
  }
})();
