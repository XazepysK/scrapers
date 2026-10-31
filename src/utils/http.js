import axios from 'axios';

export const UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
export const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
export const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
export const CRAWLER_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

export const http = axios.create({
    timeout: 20000,
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }
});

export class ScraperError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'ScraperError';
        this.cause = cause;
    }
}

export async function wrap(name, fn) {
    try {
        return await fn();
    } catch (e) {
        if (e instanceof ScraperError) throw e;
        const reason = e.response?.status ? `HTTP ${e.response.status}` : e.message;
        throw new ScraperError(`${name}: ${reason}`, e);
    }
}

export function assertString(value, name) {
    if (typeof value !== 'string' || !value.trim()) {
        throw new ScraperError(`${name} must be a non-empty string`);
    }
    return value.trim();
}

export async function resolveUrl(url) {
    const res = await http.get(url, { maxRedirects: 5, responseType: 'stream', validateStatus: () => true });
    const final = res.request?.res?.responseUrl || url;
    res.data.destroy();
    return final;
}