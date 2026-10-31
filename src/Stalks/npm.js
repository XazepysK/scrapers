import { http, wrap, assertString } from '../utils/http.js';

export function npm(name) {
    return wrap('Stalks.npm', async () => {
        const n = assertString(name, 'name');
        const enc = n.replace('/', '%2F');
        const [{ data: d }, dl] = await Promise.all([
            http.get(`https://registry.npmjs.org/${enc}`),
            http.get(`https://api.npmjs.org/downloads/point/last-week/${n}`).catch(() => ({ data: {} }))
        ]);
        const latest = d['dist-tags']?.latest;
        const v = d.versions?.[latest] ?? {};
        return {
            name: d.name, latest, description: d.description, license: v.license,
            author: d.author?.name ?? null, homepage: d.homepage ?? null,
            repository: d.repository?.url ?? null, keywords: d.keywords ?? [],
            dependencies: Object.keys(v.dependencies ?? {}),
            maintainers: (d.maintainers ?? []).map(m => m.name),
            weeklyDownloads: dl.data?.downloads ?? null,
            created: d.time?.created, modified: d.time?.modified
        };
    });
}