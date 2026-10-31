import { http, wrap, assertString } from '../utils/http.js';

export function movies(query, limit = 10) {
    return wrap('Search.movies', async () => {
        const q = assertString(query, 'query');
        const { data } = await http.get(
            `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(q)}.json`
        );
        return (data.d ?? [])
            .filter(x => x.id?.startsWith('tt'))
            .slice(0, limit)
            .map(x => ({
                id: x.id,
                title: x.l,
                year: x.y ?? null,
                type: x.q ?? x.qid ?? null,
                rank: x.rank ?? null,
                stars: x.s ?? null,
                image: x.i?.imageUrl ?? null,
                url: `https://www.imdb.com/title/${x.id}/`
            }));
    });
}