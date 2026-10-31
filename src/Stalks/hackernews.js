import { http, wrap, assertString } from '../utils/http.js';

export function hackernews(username) {
    return wrap('Stalks.hackernews', async () => {
        const u = assertString(username, 'username');
        const { data: d } = await http.get(
            `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(u)}.json`
        );
        if (!d) throw new Error('user not found');
        return {
            id: d.id,
            about: d.about ?? null,
            karma: d.karma ?? 0,
            created: d.created ? new Date(d.created * 1000).toISOString() : null,
            submissions: d.submitted?.length ?? 0,
            url: `https://news.ycombinator.com/user?id=${encodeURIComponent(d.id)}`
        };
    });
}