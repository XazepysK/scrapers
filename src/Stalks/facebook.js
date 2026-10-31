import * as cheerio from 'cheerio';
import { http, wrap, assertString, CRAWLER_UA } from '../utils/http.js';

function toNumber(value) {
    if (!value) return null;
    const match = String(value).replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
    if (!match) return null;
    const scale = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase()] ?? 1;
    return Math.round(Number(match[1]) * scale);
}

export function facebook(username) {
    return wrap('Stalks.facebook', async () => {
        let target = assertString(username, 'username').replace(/^@/, '');
        if (!/^https?:\/\//i.test(target)) target = `https://www.facebook.com/${encodeURIComponent(target)}`;
        const url = new URL(target);
        url.searchParams.set('locale', 'en_US');
        const { data } = await http.get(url.toString(), { headers: { 'User-Agent': CRAWLER_UA } });
        const $ = cheerio.load(String(data));
        const title = $('meta[property="og:title"]').attr('content') ?? '';
        const description = $('meta[property="og:description"]').attr('content') ?? '';
        const followers = toNumber(description.match(/([\d,.]+)\s+followers?/i)?.[1]);
        const talking = toNumber(description.match(/([\d,.]+)\s+talking about this/i)?.[1]);
        if (!title && !description) throw new Error('page not found or blocked');
        const about = description.match(/talking about this\.?\s*([\s\S]*)$/i)?.[1]?.trim() || null;
        return {
            name: title || null,
            followers,
            talkingAbout: talking,
            about,
            avatar: $('meta[property="og:image"]').attr('content') ?? null,
            url: $('meta[property="og:url"]').attr('content') ?? target
        };
    });
}