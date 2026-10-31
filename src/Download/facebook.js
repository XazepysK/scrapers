import { http, wrap, assertString, DESKTOP_UA } from '../utils/http.js';

function source(block, key) {
    const match = block.match(new RegExp(`"${key}":"((?:[^"\\\\]|\\\\.)*)"`));
    if (!match) return null;
    try {
        return JSON.parse(`"${match[1]}"`);
    } catch {
        return match[1].replace(/\\\//g, '/');
    }
}

export function facebook(url) {
    return wrap('Download.facebook', async () => {
        const target = assertString(url, 'url');
        const { data } = await http.get('https://www.facebook.com/plugins/video.php', {
            params: { href: target, show_text: 'false' },
            headers: { 'User-Agent': DESKTOP_UA }
        });
        const html = String(data);
        const hd = source(html, 'hd_src');
        const sd = source(html, 'sd_src');
        if (!hd && !sd) throw new Error('video not found (post may be private or removed)');
        return { url: target, hd, sd, video: hd ?? sd };
    });
}
