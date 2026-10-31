import { http, wrap, assertString } from '../utils/http.js';

export function twitter(username) {
    return wrap('Stalks.twitter', async () => {
        const u = assertString(username, 'username').replace(/^@/, '');
        const { data } = await http.get(`https://api.fxtwitter.com/${encodeURIComponent(u)}`);
        const d = data.user;
        if (!d) throw new Error(data.message || 'user not found');
        return {
            username: d.screen_name, name: d.name, bio: d.description, avatar: d.avatar_url,
            banner: d.banner_url, location: d.location, followers: d.followers, following: d.following,
            tweets: d.tweets, likes: d.likes, joined: d.joined
        };
    });
}