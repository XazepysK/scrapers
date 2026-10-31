import { http, wrap } from '../utils/http.js';

export function ip(address = '') {
    return wrap('Stalks.ip', async () => {
        const { data } = await http.get(`https://ipwho.is/${encodeURIComponent(address)}`);
        if (!data.success) throw new Error(data.message || 'lookup failed');
        return {
            ip: data.ip, type: data.type, country: data.country, region: data.region, city: data.city,
            latitude: data.latitude, longitude: data.longitude, timezone: data.timezone?.id,
            isp: data.connection?.isp, org: data.connection?.org
        };
    });
}