import { Configuration, DefaultApi } from 'polykill-leakscanner-api-client';

const api = new DefaultApi(
	new Configuration({ basePath: 'https://polykill.io/api/v1' })
);

let enabled = false;
let completedEvent = false;

chrome.webNavigation.onBeforeNavigate.addListener(details => {
	if (details.frameId === 0) {
		// Check if it's the main frame
		completedEvent = false; // Reset completed event flag
	}
});

chrome.action.onClicked.addListener(tab => {
	const { id } = tab;

	if (id === undefined) throw new Error('Tab ID is undefined');

	chrome.tabs.sendMessage(id, 'runReportAfterReload', response => {});
});

type Listener = Parameters<typeof chrome.runtime.onMessage.addListener>[0];

function asyncListener(
	fn: (request: any, sender: any) => Promise<any>
): Listener {
	return (request, sender, sendResponse) => {
		fn(request, sender)
			.then(response => sendResponse([response, null]))
			.catch(error => sendResponse([null, error]));
		return true;
	};
}

chrome.runtime.onMessage.addListener(
	asyncListener(async (request, sender) => {
		console.log('Received message in background.js:', request); // Log the incoming message
		if (request.callid === 'leaksignal') {
			try {
				const response = await api.riskAssessment({
					riskAssessmentRequest: request.data
				}); // Make the POST request to LeakSignal

				return response;
			} catch (err) {
				console.error('Error during fetch:', err); // Log any errors during fetch
				throw err;
			}
		}
	})
);
