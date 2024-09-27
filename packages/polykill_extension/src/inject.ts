import createInventory, { PKInventory } from 'polykill-core';
import {
	RiskAssessment200Response,
	RiskAssessmentRequest
} from 'polykill-leakscanner-api-client';

import { injectStyle } from './injectStyle';
import { openReportWindow } from './reportWindow';

injectStyle();

// we can never guarantee that the page has stopped loading new resources (halting problem)
// so we use a heuristic to determine when to stop waiting for the page to load
const loadTimeHeuristic = 10 * 1000; // 10 seconds

// this promise represents the arrival of the initial page load plus the loading heuristic.
// this only needs to be initialized once.
//
// note that if awaited after the page load the promise will resolve immediately.
//
// this results in a small UX improvement reducing the amount of time
// the user needs to wait for the report to be generated, since we can count the time
// before the user clicks the extension icon as part of the loading time.
const loaded = new Promise(resolve => {
	document.addEventListener('DOMContentLoaded', () => {
		console.log('DOMContentLoaded, wating additional 10 seconds');
		setTimeout(resolve, loadTimeHeuristic);
	});
});

function showLoadingOverlay() {
	const overlay = document.createElement('div');
	overlay.classList.add('leaksignal-loading-overlay');
	overlay.innerHTML = `<div class="leaksignal-loading-message">Your report is loading. If this message does not go away, reload this tab and try again.</div>`;
	document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
	const overlay = document.querySelector('.leaksignal-loading-overlay');
	if (overlay) {
		overlay.remove();
	}
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request === 'complete' || request === 'runReportAfterReload') {
		showLoadingOverlay();
		await runReport();
		hideLoadingOverlay(); // Hide the overlay when the popup appears
		sendResponse({ status: 'completed' }); // Ensure response is sent back
	}

	return true; // Indicate asynchronous response
});

async function runReport() {
	await loaded;

	const inventory = await createInventory();
	const url = window.location.href;
	const riskAssessmentRequest = inventoryToRiskAssessmentRequest({
		url,
		inventory
	});

	try {
		const riskAssessment = await runRiskAssessment(
			'https://scan.leaksignal.com/api/v1/risk',
			riskAssessmentRequest
		);

		openReportWindow({
			inventory,
			riskAssessment
		});
	} catch (error) {
		console.error('Error in runConsoleReport:', error);
	}
}

function inventoryToRiskAssessmentRequest({
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
		beacons: beacons.map(url => ({ url })),
		enable_ai: true
	};
}

function asyncSendMessage(message: any): Promise<any> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			message,
			([data, error]: [data: any, error: Error]) => {
				if (error) reject(error);
				else resolve(data);
			}
		);
	});
}

async function runRiskAssessment(input: string, data: RiskAssessmentRequest) {
	return await asyncSendMessage({
		input,
		data,
		callid: 'leaksignal'
	});
}

function getTLD(url: string | URL) {
	try {
		let hostname = new URL(url).hostname;
		let parts = hostname.split('.');
		return parts.slice(parts.length - 2).join('.');
	} catch (e) {
		return 'Invalid URL';
	}
}
