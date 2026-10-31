import { http, wrap, assertString } from '../utils/http.js';

export function lyrics(query, limit = 5) {
    return wrap('Search.lyrics', async () => {
        const q = assertString(query, 'query');
        const { data } = await http.get('https://lrclib.net/api/search', { params: { q } });
        return data.slice(0, limit).map(s => ({
            title: s.trackName,
            artist: s.artistName,
            album: s.albumName,
            duration: s.duration,
            lyrics: s.plainLyrics,
            synced: s.syncedLyrics
        }));
    });
}