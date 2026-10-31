import * as cheerio from 'cheerio';
import { http, wrap, assertString } from '../utils/http.js';

function profileUrl(id) {
    const s = id.trim().replace(/\/$/, '');
    const m = s.match(/steamcommunity\.com\/(id|profiles)\/([^/?#]+)/i);
    if (m) return `https://steamcommunity.com/${m[1]}/${m[2]}/?xml=1`;
    if (/^\d{17}$/.test(s)) return `https://steamcommunity.com/profiles/${s}/?xml=1`;
    return `https://steamcommunity.com/id/${encodeURIComponent(s)}/?xml=1`;
}

export function steam(id) {
    return wrap('Stalks.steam', async () => {
        const target = assertString(id, 'id');
        const { data: xml } = await http.get(profileUrl(target));
        const $ = cheerio.load(xml, { xmlMode: true });
        if ($('error').length) throw new Error($('error').text().trim() || 'profile not found');

        const text = name => $(name).first().text().trim() || null;
        return {
            id: text('steamID64'),
            username: text('steamID'),
            online: text('onlineState'),
            state: text('stateMessage'),
            privacy: text('privacyState'),
            avatar: text('avatarFull'),
            vacBanned: text('vacBanned') === '1',
            tradeBan: text('tradeBanState'),
            limited: text('isLimitedAccount') === '1',
            memberSince: text('memberSince'),
            location: text('location'),
            summary: text('summary'),
            mostPlayed: $('mostPlayedGames > mostPlayedGame').map((_, el) => ({
                name: $(el).find('gameName').text().trim(),
                hours: Number($(el).find('hoursPlayed').text().trim()) || null
            })).get()
        };
    });
}