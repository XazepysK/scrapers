import * as cheerio from 'cheerio';
import { http, wrap, assertString } from '../utils/http.js';

export function news(query, limit = 10) {
    return wrap('Search.news', async () => {
        const q = assertString(query, 'query');
        const { data: xml } = await http.get('https://news.google.com/rss/search', {
            params: { q, hl: 'en-US', gl: 'US', ceid: 'US:en' }
        });
        const $ = cheerio.load(xml, { xmlMode: true });
        const out = [];
        $('item').each((_, el) => {
            const rawTitle = $(el).find('title').first().text().trim();
            const source = $(el).find('source').first().text().trim() || null;
            const suffix = source ? ` - ${source}` : '';
            const description = $(el).find('description').first().text().trim();
            out.push({
                title: suffix && rawTitle.endsWith(suffix) ? rawTitle.slice(0, -suffix.length) : rawTitle,
                source,
                url: $(el).find('link').first().text().trim(),
                published: $(el).find('pubDate').first().text().trim() || null,
                summary: description ? cheerio.load(`<div>${description}</div>`).text().trim() : null
            });
        });
        return out.slice(0, limit);
    });
}