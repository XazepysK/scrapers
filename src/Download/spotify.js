import { http, wrap, assertString } from '../utils/http.js';

const ID_RE = /\/(track|episode)\/([A-Za-z0-9]{22})/;

export function spotify(url) {
    return wrap('Download.spotify', async () => {
        const input = assertString(url, 'url');
        const m = input.match(ID_RE);
        const type = m?.[1] ?? 'track';
        const id = m?.[2] ?? (/^[A-Za-z0-9]{22}$/.test(input) ? input : null);
        if (!id) throw new Error('not a spotify track/episode url or id');

        const page = `https://open.spotify.com/${type}/${id}`;
        const [{ data: html }, { data: oembed }] = await Promise.all([
            http.get(`https://open.spotify.com/embed/${type}/${id}`),
            http.get('https://open.spotify.com/oembed', { params: { url: page } }).catch(() => ({ data: {} }))
        ]);

        const nm = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (!nm) throw new Error('metadata not found (layout changed)');
        const entity = JSON.parse(nm[1]).props?.pageProps?.state?.data?.entity;
        if (!entity) throw new Error('not found');

        return {
            type: entity.type ?? type,
            id: entity.id ?? id,
            title: entity.title ?? null,
            artists: (entity.artists ?? []).map(a => ({
                name: a.name,
                url: a.uri ? `https://open.spotify.com/artist/${a.uri.split(':').pop()}` : null
            })),
            duration: entity.duration ?? null,
            release: entity.releaseDate?.isoString ?? null,
            explicit: Boolean(entity.isExplicit),
            cover: oembed?.thumbnail_url ?? null,
            preview: entity.audioPreview?.url ?? null,
            url: page
        };
    });
}