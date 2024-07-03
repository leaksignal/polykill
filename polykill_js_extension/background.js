// chrome.webNavigation.onCommitted.addListener((details) => {
//     if (details.frameId === 0) { // Ensure it's the main frame
//         console.log('Injecting content script into:', details.url);
//         chrome.scripting.executeScript({
//             target: { tabId: details.tabId },
//             files: ['content.js'],
//             injectImmediately: true // Ensures it runs at document_start
//         }, () => {
//             if (chrome.runtime.lastError) {
//                 console.error('Injection error:', chrome.runtime.lastError.message);
//             } else {
//                 console.log('Polykill Monitoring Script Injected:', details.url);
//             }
//         });
//     }
// });
