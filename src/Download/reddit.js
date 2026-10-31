import { http, wrap, assertString, DESKTOP_UA } from '../utils/http.js';

function extractId(input) {
    const match = input.match(/\/comments\/([a-z0-9]+)/i) ?? input.match(/^([a-z0-9]+)$/i);
    if (!match) throw new Error('could not find post id in url');
    return match[1];
}

function clean(url) {
    return url ? url.replace(/&amp;/g, '&') : url;
}

export function reddit(url) {
    return wrap('Download.reddit', async () => {
        const id = extractId(assertString(url, 'url'));
        const { data } = await http.get('https://arctic-shift.photon-reddit.com/api/posts/ids', {
            params: { ids: id },
            headers: { 'User-Agent': DESKTOP_UA }
        });
        const post = data?.data?.[0];
        if (!post) throw new Error('post not found');
        const media = [];
        const rv = post.secure_media?.reddit_video ?? post.media?.reddit_video;
        if (rv) media.push({ type: 'video', url: clean(rv.fallback_url), width: rv.width, height: rv.height });
        if (post.is_gallery && post.media_metadata) {
            for (const item of post.gallery_data?.items ?? []) {
                const s = post.media_metadata[item.media_id]?.s;
                if (s?.u) media.push({ type: 'image', url: clean(s.u), width: s.x, height: s.y });
            }
        } else if (post.post_hint === 'image' || /\.(jpe?g|png|gif|webp)$/i.test(post.url ?? '')) {
            media.push({ type: 'image', url: clean(post.url_overridden_by_dest ?? post.url) });
        }
        if (!media.length) {
            const preview = post.preview?.images?.[0]?.source?.url;
            if (preview) media.push({ type: 'image', url: clean(preview) });
        }
        if (!media.length) throw new Error('no media found in post');
        return {
            id: post.id, title: post.title, subreddit: post.subreddit, author: post.author,
            score: post.score, comments: post.num_comments, media
        };
    });
}
