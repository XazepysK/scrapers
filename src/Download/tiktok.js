import { http, wrap, assertString } from '../utils/http.js';

const abs = u => (!u ? null : u.startsWith('http') ? u : `https://www.tikwm.com${u}`);

export function tiktok(url) {
    return wrap('Download.tiktok', async () => {
        const target = assertString(url, 'url');
        const { data } = await http.post('https://www.tikwm.com/api/', new URLSearchParams({ url: target, hd: '1' }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        });
        if (data.code !== 0) throw new Error(data.msg || 'request failed');
        const d = data.data;
        return {
            id: d.id,
            title: d.title,
            duration: d.duration,
            cover: abs(d.cover),
            video: abs(d.hdplay || d.play),
            videoSd: abs(d.play),
            watermark: abs(d.wmplay),
            music: abs(d.music),
            images: (d.images ?? []).map(abs),
            author: {
                id: d.author?.id,
                username: d.author?.unique_id,
                nickname: d.author?.nickname,
                avatar: abs(d.author?.avatar)
            },
            stats: { plays: d.play_count, likes: d.digg_count, comments: d.comment_count, shares: d.share_count }
        };
    });
}