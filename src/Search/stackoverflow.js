import * as cheerio from 'cheerio';
import { http, wrap, assertString } from '../utils/http.js';

export function stackoverflow(query, limit = 10) {
    return wrap('Search.stackoverflow', async () => {
        const q = assertString(query, 'query');
        const { data } = await http.get('https://api.stackexchange.com/2.3/search/advanced', {
            params: {
                q, site: 'stackoverflow', order: 'desc', sort: 'relevance',
                pagesize: Math.min(Math.max(limit, 1), 100), filter: 'default'
            }
        });
        return (data.items ?? []).map(i => ({
            title: cheerio.load(i.title ?? '').text(),
            url: i.link,
            score: i.score,
            answers: i.answer_count,
            answered: i.is_answered,
            tags: i.tags ?? [],
            author: i.owner?.display_name ?? null,
            created: i.creation_date ? new Date(i.creation_date * 1000).toISOString() : null
        }));
    });
}