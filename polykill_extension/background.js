let enabled = false;
let completedEvent = false;
let activeTabId = null;

chrome.webNavigation.onCompleted.addListener(details => {
  if (details.frameId === 0) { // Check if it's the main frame
    completedEvent = true;
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      activeTabId = tabs[0].id;
      console.log('--- page load complete');
    });
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(details => {
  if (details.frameId === 0) { // Check if it's the main frame
    completedEvent = false; // Reset completed event flag
  }
});

chrome.action.onClicked.addListener(tab => {
  if (completedEvent) {
    chrome.tabs.sendMessage(tab.id, 'complete', response => {});
  } else {
    console.log('Page not fully loaded.');
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message in background.js:', request); // Log the incoming message
  if (request.callid === 'httpbin') {
    console.log('Making POST request to https://httpbin.org/post with data:', request.data); // Log the data being sent
    fetch('https://httpbin.org/post', {
      method: 'POST',
      body: JSON.stringify(request.data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json().then(json => {
      console.log('Response from httpbin:', json); // Log the response from httpbin
      sendResponse([{
        body: json,
        url: request.data.url,
        status: response.status,
        statusText: response.statusText
      }, null]);
    })).catch(error => {
      console.error('Error during fetch:', error); // Log any errors during fetch
      sendResponse([null, error]);
    });

    return true; // Will respond asynchronously
  }
  return true; // Ensure the listener returns true to indicate asynchronous response
});
