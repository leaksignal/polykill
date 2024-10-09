import { RiskAssessmentRequest } from 'polykill-leakscanner-api-client';

import { PKInventory } from '../polykill';

export function inventoryToRiskAssessmentRequest({
	inventory,
	url
}: {
	inventory: PKInventory;
	url: string;
}): RiskAssessmentRequest {
	const { scripts, xhrs, beacons } = inventory;
	return {
		url,
		scripts: scripts.map(url => ({ url })),
		xhrs: xhrs.map(url => ({ url })),
		beacons: beacons.map(url => ({ url }))
	};
}
