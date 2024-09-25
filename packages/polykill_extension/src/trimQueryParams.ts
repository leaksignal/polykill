export function trimQueryParams(url: string | URL) {
	try {
		let urlObj = new URL(url);
		urlObj.search = '';
		return urlObj.toString();
	} catch (e) {
		console.error('Invalid URL encountered:', url);
		return url;
	}
}
