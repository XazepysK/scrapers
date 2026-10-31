import { http, wrap, assertString } from '../utils/http.js';

export function github(username) {
    return wrap('Stalks.github', async () => {
        const u = assertString(username, 'username');
        const headers = { Accept: 'application/vnd.github+json' };
        const { data: d } = await http.get(`https://api.github.com/users/${encodeURIComponent(u)}`, { headers });
        return {
            username: d.login, name: d.name, bio: d.bio, avatar: d.avatar_url, url: d.html_url,
            company: d.company, location: d.location, blog: d.blog,
            repos: d.public_repos, gists: d.public_gists, followers: d.followers, following: d.following,
            created: d.created_at
        };
    });
}