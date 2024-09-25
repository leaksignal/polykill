import { getSecondLevelDomain } from './util/getSecondLevelDomain';

export default async function createInventory() {
	// idk why the default types give PerformanceEntry
	let resources = performance.getEntriesByType(
		'resource'
	) as PerformanceResourceTiming[];

	const url = window.location.origin + window.location.pathname;

	const scripts = resources
		.filter(resource => resource.initiatorType === 'script')
		.map(resource => resource.name);

	const xhrs = resources
		.filter(resource => resource.initiatorType === 'xmlhttprequest')
		.map(resource => resource.name);

	const beacons = resources
		.filter(resource => resource.initiatorType === 'beacon')
		.map(resource => resource.name);

	const secondLevelDomains = Array.from(
		new Set(resources.map(resource => getSecondLevelDomain(resource.name)))
	);

	return {
		url,
		scripts,
		xhrs,
		beacons,
		secondLevelDomains
	};
}

export type PKInventory = Awaited<ReturnType<typeof createInventory>>;
