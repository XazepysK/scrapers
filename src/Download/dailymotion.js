import { http, wrap, assertString } from '../utils/http.js';

const ID_RE = /(?:\/video\/|\/)([a-zA-Z0-9]{5,})/;

export function dailymotion(url) {
    return wrap('Download.dailymotion', async () => {
        const input = assertString(url, 'url');
        const m = input.match(ID_RE);
        const id = m ? m[1] : (/^[a-zA-Z0-9]{5,}$/.test(input) ? input : null);
        if (!id) throw new Error('not a dailymotion url or id');

        const [{ data: meta }, { data: player }] = await Promise.all([
            http.get(`https://api.dailymotion.com/video/${id}`, {
                params: {
                    fields: 'id,title,duration,thumbnail_720_url,views_total,owner.screenname,created_time,url'
                }
            }),
            http.get(`https://www.dailymotion.com/player/metadata/video/${id}`)
        ]);

        const auto = player.qualities?.auto ?? [];
        return {
            id: meta.id ?? id,
            title: meta.title ?? null,
            duration: meta.duration ?? null,
            thumbnail: meta.thumbnail_720_url ?? null,
            views: meta.views_total ?? null,
            author: meta['owner.screenname'] ?? null,
            created: meta.created_time ? new Date(meta.created_time * 1000).toISOString() : null,
            hls: auto.find(q => q.type === 'application/x-mpegURL')?.url ?? null,
            mp4: auto
                .filter(q => q.type === 'video/mp4')
                .map(q => ({ url: q.url, width: q.width ?? null, height: q.height ?? null })),
            url: meta.url ?? `https://www.dailymotion.com/video/${id}`
        };
    });
}
