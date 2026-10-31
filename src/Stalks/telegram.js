import * as cheerio from 'cheerio';
import { http, wrap, assertString } from '../utils/http.js';

export function telegram(channel) {
    return wrap('Stalks.telegram', async () => {
        const c = assertString(channel, 'channel')
            .replace(/^@/, '')
            .replace(/^https?:\/\/t\.me\//i, '')
            .replace(/\/$/, '');
        if (!/^[a-zA-Z0-9_]{3,}$/.test(c)) throw new Error('invalid channel');

        const { data: html } = await http.get(`https://t.me/${c}`);
        const $ = cheerio.load(html);
        const title = $('.tgme_page_title').text().trim();
        if (!title) throw new Error('channel not found');

        const extra = $('.tgme_page_extra').text().trim();
        const m = extra.match(/([\d\s]+)\s+(?:subscribers?|members?)/i);
        return {
            channel: c,
            title,
            description: $('.tgme_page_description').text().trim() || null,
            subscribers: m ? Number(m[1].replace(/\D/g, '')) : null,
            extra: extra || null,
            photo: $('.tgme_page_photo_image img').attr('src')
                || $('meta[property="og:image"]').attr('content') || null,
            url: `https://t.me/${c}`
        };
    });
}