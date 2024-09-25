import { RiskItem } from 'polykill-leakscanner-api-client';

import { formatURL } from './formatURL';

export function sortAndFormatResults(riskItems: RiskItem[]) {
	return riskItems.map(formatURL).join('\n');
}
