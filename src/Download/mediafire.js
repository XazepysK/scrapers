import * as cheerio from 'cheerio';
import { http, wrap, assertString, DESKTOP_UA } from '../utils/http.js';

export function mediafire(url) {
    return wrap('Download.mediafire', async () => {
        const target = assertString(url, 'url');
        const { data } = await http.get(target, { headers: { 'User-Agent': DESKTOP_UA } });
        const $ = cheerio.load(String(data));
        const btn = $('a#downloadButton').first();
        let link = btn.attr('href');
        const scrambled = btn.attr('data-scrambled-url');
        if (scrambled) link = Buffer.from(scrambled, 'base64').toString();
        if (!link || !link.startsWith('http')) throw new Error('download link not found (file removed or layout changed)');
        const name = $('.dl-btn-label').attr('title') || $('.filename').first().text().trim() ||
            $('meta[property="og:title"]').attr('content') || null;
        return {
            name,
            size: btn.text().match(/\(([^)]+)\)/)?.[1] ?? null,
            link
        };
    });
}
