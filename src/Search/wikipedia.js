import { http, wrap, assertString } from '../utils/http.js';

export function wikipedia(query, lang = 'en', limit = 5) {
    return wrap('Search.wikipedia', async () => {
        const q = assertString(query, 'query');
        const { data } = await http.get(`https://${lang}.wikipedia.org/w/api.php`, {
            params: {
                action: 'query', format: 'json', generator: 'search', gsrsearch: q, gsrlimit: limit,
                prop: 'extracts|pageimages', exintro: 1, explaintext: 1, exlimit: 'max',
                piprop: 'thumbnail', pithumbsize: 400
            }
        });
        const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index);
        return pages.map(p => ({
            title: p.title,
            url: `https://${lang}.wikipedia.org/?curid=${p.pageid}`,
            summary: p.extract ?? '',
            thumbnail: p.thumbnail?.source ?? null
        }));
    });
}