import { http, wrap, assertString } from '../utils/http.js';

export function twitter(url) {
    return wrap('Download.twitter', async () => {
        const target = assertString(url, 'url');
        const m = target.match(/(?:twitter|x)\.com\/([^/]+)\/status\/(\d+)/i);
        if (!m) throw new Error('not a tweet url');
        const { data } = await http.get(`https://api.fxtwitter.com/${m[1]}/status/${m[2]}`);
        const t = data.tweet;
        if (!t) throw new Error(data.message || 'tweet not found');
        return {
            id: t.id,
            text: t.text,
            author: { username: t.author?.screen_name, name: t.author?.name, avatar: t.author?.avatar_url },
            created: t.created_at,
            stats: { likes: t.likes, retweets: t.retweets, replies: t.replies },
            media: (t.media?.all ?? []).map(x => ({ type: x.type, url: x.url, thumbnail: x.thumbnail_url ?? null }))
        };
    });
}