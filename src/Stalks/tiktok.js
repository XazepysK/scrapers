import { http, wrap, assertString, IPHONE_UA } from '../utils/http.js';

export function tiktok(username) {
    return wrap('Stalks.tiktok', async () => {
        const u = assertString(username, 'username').replace(/^@/, '');
        const { data: html } = await http.get(`https://www.tiktok.com/@${encodeURIComponent(u)}`, {
            headers: { 'User-Agent': IPHONE_UA, Accept: 'text/html,application/xhtml+xml' }
        });
        const match = String(html).match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/);
        if (!match) throw new Error('user data not found (page blocked or layout changed)');
        const detail = JSON.parse(match[1]).__DEFAULT_SCOPE__?.['webapp.user-detail'];
        if (!detail?.userInfo?.user) throw new Error(detail?.statusMsg || 'user not found');
        const { user, stats } = detail.userInfo;
        return {
            id: user.id, username: user.uniqueId, nickname: user.nickname, bio: user.signature,
            avatar: user.avatarLarger, verified: user.verified, private: user.privateAccount,
            region: user.region, followers: stats.followerCount, following: stats.followingCount,
            likes: stats.heartCount, videos: stats.videoCount
        };
    });
}