// Search functionality using Fuse.js
(async () => {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');

  if (!searchInput || !resultsContainer) return;

  // Load Fuse.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
  document.head.appendChild(script);

  await new Promise(resolve => script.onload = resolve);

  // Load search index - use base URL from meta tag or fallback
  const baseUrl = document.querySelector('meta[name="base-url"]')?.content || window.location.origin;
  const response = await fetch(`${baseUrl}/search_index.en.json`);
  const searchIndex = await response.json();

  // Initialize Fuse
  const fuse = new Fuse(searchIndex, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'body', weight: 0.3 }
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeMatches: true
  });

  // Helper to extract matching snippet
  function getSnippet(text, matches) {
    if (!matches || matches.length === 0) {
      return text.slice(0, 150) + (text.length > 150 ? '...' : '');
    }

    const match = matches[0];
    const start = Math.max(0, match.indices[0][0] - 50);
    const end = Math.min(text.length, match.indices[0][1] + 100);
    let snippet = text.slice(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }

  // Search on input
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (query.length < 2) {
      resultsContainer.classList.add('hidden');
      resultsContainer.innerHTML = '';
      return;
    }

    const results = fuse.search(query, { limit: 10 });

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="py-2 text-xs text-muted-foreground">No results found</div>';
      resultsContainer.classList.remove('hidden');
      return;
    }

    resultsContainer.innerHTML = results.map(({ item, matches }) => {
      const bodyMatches = matches?.filter(m => m.key === 'body') || [];
      const snippet = getSnippet(item.body || '', bodyMatches);

      return `
        <a href="${item.url}" class="block py-2 hover:bg-accent rounded-md px-2 border-b border-border last:border-b-0">
          <div class="font-semibold text-xs">${item.title}</div>
          <div class="text-xs text-muted-foreground mt-1 line-clamp-2">${snippet}</div>
        </a>
      `;
    }).join('');

    resultsContainer.classList.remove('hidden');
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.parentElement.contains(e.target)) {
      resultsContainer.classList.add('hidden');
    }
  });

  // Navigate results with keyboard
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resultsContainer.classList.add('hidden');
      searchInput.value = '';
    }
  });
})();
