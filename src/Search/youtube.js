import { http, wrap, assertString, DESKTOP_UA } from '../utils/http.js';

export function youtube(query, limit = 10) {
    return wrap('Search.youtube', async () => {
        const q = assertString(query, 'query');
        const { data: html } = await http.get('https://www.youtube.com/results', {
            params: { search_query: q, hl: 'en' },
            headers: { 'User-Agent': DESKTOP_UA, Cookie: 'CONSENT=YES+1; SOCS=CAI' }
        });
        const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
        if (!match) throw new Error('ytInitialData not found (layout changed or blocked)');
        const json = JSON.parse(match[1]);
        const sections =
            json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents ?? [];
        const out = [];
        for (const s of sections) {
            for (const item of s.itemSectionRenderer?.contents ?? []) {
                const v = item.videoRenderer;
                if (!v) continue;
                out.push({
                    id: v.videoId,
                    url: `https://www.youtube.com/watch?v=${v.videoId}`,
                    title: v.title?.runs?.[0]?.text ?? '',
                    duration: v.lengthText?.simpleText ?? null,
                    views: v.viewCountText?.simpleText ?? null,
                    published: v.publishedTimeText?.simpleText ?? null,
                    channel: v.ownerText?.runs?.[0]?.text ?? null,
                    thumbnail: v.thumbnail?.thumbnails?.at(-1)?.url ?? null
                });
            }
        }
        return out.slice(0, limit);
    });
}