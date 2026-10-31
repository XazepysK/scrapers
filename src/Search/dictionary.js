import { http, wrap, assertString } from '../utils/http.js';

export function dictionary(word) {
    return wrap('Search.dictionary', async () => {
        const w = assertString(word, 'word');
        const { data, status } = await http.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`,
            { validateStatus: s => s === 200 || s === 404 }
        );
        if (status === 404 || !Array.isArray(data)) throw new Error('word not found');
        const e = data[0];
        return {
            word: e.word,
            phonetic: e.phonetic ?? null,
            audio: e.phonetics?.find(p => p.audio)?.audio ?? null,
            origin: e.origin ?? null,
            meanings: (e.meanings ?? []).map(m => ({
                partOfSpeech: m.partOfSpeech,
                definitions: (m.definitions ?? []).map(d => ({
                    definition: d.definition,
                    example: d.example ?? null,
                    synonyms: d.synonyms ?? []
                })),
                synonyms: m.synonyms ?? [],
                antonyms: m.antonyms ?? []
            }))
        };
    });
}