import * as cheerio from 'cheerio';
import { http, wrap, assertString, DESKTOP_UA } from '../utils/http.js';

function decodeHex(text) {
    return text.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function extractHtml(body) {
    const decoded = decodeHex(body);
    const start = decoded.indexOf("['innerHTML']='");
    if (start > -1) {
        const end = decoded.indexOf("',document[", start);
        if (end > -1) return decoded.slice(start + 14, end);
    }
    return decoded;
}

function tokenPayload(link) {
    try {
        const token = new URL(link).searchParams.get('token');
        const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(Buffer.from(part, 'base64').toString());
    } catch {
        return null;
    }
}

export function instagram(url) {
    return wrap('Download.instagram', async () => {
        const target = assertString(url, 'url').split('?')[0].replace(/\/$/, '');
        if (!/instagram\.com\/(p|reel|tv)\//.test(target)) throw new Error('url must be an instagram post, reel or tv link');
        const { data } = await http.post('https://api.downloadgram.org/media', { url: target }, {
            headers: {
                'User-Agent': DESKTOP_UA,
                'Content-Type': 'application/json',
                Accept: 'application/json, text/javascript, */*; q=0.01',
                Origin: 'https://downloadgram.org',
                Referer: 'https://downloadgram.org/'
            }
        });
        const body = typeof data === 'string' ? data : JSON.stringify(data);
        const $ = cheerio.load(extractHtml(body));
        const items = [];
        $('.download-items').each((_, el) => {
            const thumbnail = $(el).find('img').attr('src') ?? null;
            const link = $(el).find('a[href]').attr('href');
            if (!link) return;
            const payload = tokenPayload(link);
            const mediaUrl = payload?.url ?? link;
            const filename = payload?.filename ?? null;
            const type = /\.(mp4|mov|webm)(\?|$)/i.test(filename ?? mediaUrl) ? 'video' : 'image';
            items.push({ type, filename, url: mediaUrl, thumbnail });
        });
        if (!items.length) throw new Error('media not found (post may be private or removed)');
        return { url: target, items };
    });
}
