import * as cheerio from 'cheerio';
import { http, wrap, assertString } from '../utils/http.js';

function decodeBingUrl(href) {
    try {
        const u = new URL(href, 'https://www.bing.com');
        if (!u.hostname.endsWith('bing.com') || u.pathname !== '/ck/a') return href;
        const raw = u.searchParams.get('u');
        if (!raw?.startsWith('a1')) return href;
        const b64 = raw.slice(2).replace(/-/g, '+').replace(/_/g, '/');
        const decoded = Buffer.from(b64, 'base64').toString('utf8');
        return decoded.startsWith('http') ? decoded : href;
    } catch {
        return href;
    }
}

export function web(query, limit = 10) {
    return wrap('Search.web', async () => {
        const q = assertString(query, 'query');
        const { data: html } = await http.get('https://www.bing.com/search', {
            params: { q, count: limit, setlang: 'en' },
            headers: { Cookie: 'SRCHHPGUSR=SRCHLANG=en' }
        });
        const $ = cheerio.load(html);
        const out = [];
        $('li.b_algo').each((_, el) => {
            const heading = $(el).find('h2').first();
            const href = heading.closest('a').attr('href') || heading.find('a').attr('href');
            if (!href) return;
            out.push({
                title: heading.text().trim(),
                url: decodeBingUrl(href),
                snippet: $(el).find('.b_caption p').first().text().trim()
                    || $(el).find('p').first().text().trim() || null,
                source: $(el).find('.tptt').first().text().trim() || null
            });
        });
        return out.slice(0, limit);
    });
}