import * as cheerio from 'cheerio';
import { http, wrap, assertString, resolveUrl } from '../utils/http.js';

export function pinterest(url) {
    return wrap('Download.pinterest', async () => {
        const target = await resolveUrl(assertString(url, 'url'));
        const { data } = await http.get(target);
        const $ = cheerio.load(data);
        const meta = p => $(`meta[property="${p}"]`).attr('content') || null;
        const video = meta('og:video') || meta('og:video:url');
        const image = meta('og:image');
        if (!video && !image) throw new Error('no media found (pin private or layout changed)');
        return {
            title: meta('og:title'),
            description: meta('og:description'),
            video,
            image: image ? image.replace(/\/\d+x\//, '/originals/') : null
        };
    });
}