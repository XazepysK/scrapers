import { http, wrap, assertString } from '../utils/http.js';

export function github(query, limit = 10) {
    return wrap('Search.github', async () => {
        const q = assertString(query, 'query');
        const headers = { Accept: 'application/vnd.github+json' };
        const { data } = await http.get('https://api.github.com/search/repositories', {
            params: { q, per_page: limit }, headers
        });
        return data.items.map(r => ({
            name: r.full_name,
            url: r.html_url,
            description: r.description,
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language,
            updated: r.updated_at
        }));
    });
}