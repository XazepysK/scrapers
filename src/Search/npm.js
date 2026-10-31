import { http, wrap, assertString } from '../utils/http.js';

export function npm(query, limit = 10) {
    return wrap('Search.npm', async () => {
        const q = assertString(query, 'query');
        const { data } = await http.get('https://registry.npmjs.org/-/v1/search', { params: { text: q, size: limit } });
        return data.objects.map(({ package: p }) => ({
            name: p.name,
            version: p.version,
            description: p.description ?? '',
            author: p.publisher?.username ?? null,
            keywords: p.keywords ?? [],
            url: p.links?.npm
        }));
    });
}