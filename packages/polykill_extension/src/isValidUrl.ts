export function isValidUrl(string: string | URL) {
	try {
		new URL(string);
		return true;
	} catch (e) {
		return false;
	}
}
