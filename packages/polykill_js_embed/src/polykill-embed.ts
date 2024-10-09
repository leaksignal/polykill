import createInventory from 'polykill-core';
import type { PKInventory } from 'polykill-core';
import { inventoryToRiskAssessmentRequest } from 'polykill-core/util/inventoryToRiskAssessmentRequest';
import type { RiskAssessmentRequest } from 'polykill-leakscanner-api-client';

async function submitRiskAssessmentRequest(
	riskAssessmentRequest: RiskAssessmentRequest
) {
	console.log('risk assessment request:', riskAssessmentRequest);
}

async function createRiskAssessmentRequest() {
	const inventory = await createInventory();
	console.log('inventory:', inventory);
	const url = window.location.origin + window.location.pathname;

	const riskAssessmentRequest = inventoryToRiskAssessmentRequest({
		url,
		inventory
	});

	return riskAssessmentRequest;
}

async function runAndSubmitReport() {
	try {
		const riskAssessmentRequest = await createRiskAssessmentRequest();
		const results = await submitRiskAssessmentRequest(
			riskAssessmentRequest
		);
		console.log(results);
	} catch (error) {
		console.error('Error in runAndSubmitReport:', error);
	}
}

function init() {
	console.log('Polykill Embed initialized');
	setTimeout(runAndSubmitReport, 10000);
}

if (document.readyState !== 'loading') {
	init();
} else {
	document.addEventListener('DOMContentLoaded', init);
}
