import * as cheerio from 'cheerio';
import { http, wrap, assertString } from '../utils/http.js';

const ID_RE = /client_id\s*[=:]\s*["']?([A-Za-z0-9]{32})/;

async function getClientId(page) {
    for (const url of [page, 'https://soundcloud.com']) {
        try {
            const { data: html } = await http.get(url);
            const m = html.match(ID_RE);
            if (m) return m[1];
        } catch {
            continue;
        }
    }
    throw new Error('client id not found (layout changed)');
}

const withClientId = (url, cid) => {
    const u = new URL(url);
    u.searchParams.set('client_id', cid);
    return u.toString();
};

export function soundcloud(url) {
    return wrap('Download.soundcloud', async () => {
        const input = assertString(url, 'url');
        const target = /^https?:\/\//i.test(input)
            ? input
            : `https://soundcloud.com/${input.replace(/^\/+/, '')}`;
        if (!/soundcloud\.com/i.test(target)) throw new Error('not a soundcloud url');

        const cid = await getClientId(target);
        const { data: t } = await http.get('https://api-v2.soundcloud.com/resolve', {
            params: { url: target, client_id: cid }
        });

        const transcodings = t.media?.transcodings ?? [];
        const progressive = transcodings.find(x => x.format?.protocol === 'progressive');
        const hls = transcodings.find(x => x.format?.protocol === 'hls');

        const stream = progressive
            ? await http.get(progressive.url, { params: { client_id: cid } })
                .then(r => r.data?.url ?? null)
                .catch(() => null)
            : null;

        const description = t.description
            ? cheerio.load(`<div>${t.description}</div>`).text().trim() || null
            : null;

        return {
            id: t.id,
            title: t.title,
            description,
            duration: t.duration ?? null,
            genre: t.genre ?? null,
            created: t.created_at ?? null,
            artwork: t.artwork_url ?? t.user?.avatar_url ?? null,
            plays: t.playback_count ?? null,
            likes: t.likes_count ?? null,
            reposts: t.reposts_count ?? null,
            stream,
            hls: hls?.url ? withClientId(hls.url, cid) : null,
            author: {
                username: t.user?.username ?? null,
                name: t.user?.full_name ?? null,
                avatar: t.user?.avatar_url ?? null,
                url: t.user?.permalink_url ?? null
            },
            url: t.permalink_url ?? target
        };
    });
}
