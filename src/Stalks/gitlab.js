import { http, wrap, assertString } from '../utils/http.js';

export function gitlab(username) {
    return wrap('Stalks.gitlab', async () => {
        const u = assertString(username, 'username')
            .replace(/^@/, '')
            .replace(/^https?:\/\/gitlab\.com\//i, '')
            .replace(/\/$/, '');

        const { data: list } = await http.get('https://gitlab.com/api/v4/users', {
            params: { username: u }
        });
        const d = (list ?? []).find(x => x.username.toLowerCase() === u.toLowerCase()) ?? list?.[0];
        if (!d) throw new Error('user not found');

        return {
            id: d.id,
            username: d.username,
            name: d.name,
            state: d.state,
            locked: Boolean(d.locked),
            bot: Boolean(d.bot),
            email: d.public_email || null,
            avatar: d.avatar_url,
            url: d.web_url
        };
    });
}