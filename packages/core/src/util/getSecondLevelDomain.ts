export function getSecondLevelDomain(url: string): string {
    try {
        let hostname = new URL(url).hostname;
        let parts = hostname.split('.');
        return parts.slice(parts.length - 2).join('.');
    } catch (e) {
        throw new Error('Invalid URL');
    }
}
