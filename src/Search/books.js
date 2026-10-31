import { http, wrap, assertString } from '../utils/http.js';

export function books(query, limit = 10) {
    return wrap('Search.books', async () => {
        const q = assertString(query, 'query');
        const { data } = await http.get('https://openlibrary.org/search.json', {
            params: { q, limit: Math.min(Math.max(limit, 1), 100) }
        });
        return (data.docs ?? []).map(b => ({
            title: b.title,
            authors: b.author_name ?? [],
            year: b.first_publish_year ?? null,
            editions: b.edition_count ?? null,
            languages: b.language ?? [],
            cover: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg` : null,
            url: b.key ? `https://openlibrary.org${b.key}` : null
        }));
    });
}