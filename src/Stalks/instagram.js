import * as cheerio from 'cheerio';
import { http, wrap, assertString, CRAWLER_UA } from '../utils/http.js';

function unquote(raw) {
    if (raw == null) return null;
    try {
        return JSON.parse(`"${raw}"`);
    } catch {
        return raw;
    }
}

function pick(html, key) {
    return unquote(html.match(new RegExp(`"${key}":"((?:[^"\\\\]|\\\\.)*)"`))?.[1]);
}

function toCount(value) {
    if (value == null) return 0;
    const match = String(value).replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
    if (!match) return 0;
    const scale = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase()] ?? 1;
    return Math.round(Number(match[1]) * scale);
}

export function instagram(username) {
    return wrap('Stalks.instagram', async () => {
        let name = assertString(username, 'username').replace(/^@/, '');
        const fromUrl = name.match(/instagram\.com\/([^/?#]+)/);
        if (fromUrl) name = fromUrl[1];
        const { data } = await http.get(`https://www.instagram.com/${encodeURIComponent(name)}/`, {
            headers: { 'User-Agent': CRAWLER_UA }
        });
        const html = String(data);
        const $ = cheerio.load(html);
        const title = $('meta[property="og:title"]').attr('content') ?? '';
        const description = $('meta[property="og:description"]').attr('content') ?? '';
        const user = title.match(/^(.*?) \(@([^)]+)\)/);
        const stats = description.match(/^([\d.,KMB]+) Followers, ([\d.,KMB]+) Following, ([\d.,KMB]+) Posts/i);
        const followers = Number(html.match(/"follower_count":(\d+)/)?.[1] ?? toCount(stats?.[1]));
        const following = Number(html.match(/"following_count":(\d+)/)?.[1] ?? toCount(stats?.[2]));
        const posts = toCount(stats?.[3]);
        if (!user && !stats) throw new Error('profile not found');
        const avatar = (pick(html, 'profile_pic_url') ?? $('meta[property="og:image"]').attr('content') ?? '')
            .replace('s150x150', 's1080x1080');
        const biography = pick(html, 'biography');
        return {
            username: pick(html, 'username') ?? user?.[2] ?? name,
            name: pick(html, 'full_name') ?? user?.[1] ?? null,
            bio: biography && biography.trim() ? biography : null,
            avatar: avatar || null,
            verified: html.includes('"is_verified":true'),
            private: html.includes('"is_private":true'),
            followers, following, posts,
            url: `https://www.instagram.com/${name}/`
        };
    });
}