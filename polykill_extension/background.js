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
  if (request.callid === 'leaksignal') {
    console.log('Making POST request to https://scan.leaksignal.com/api/v1/risk with data:', request.data); // Log the data being sent
    fetch('https://scan.leaksignal.com/api/v1/risk', {
      method: 'POST',
      body: JSON.stringify(request.data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json().then(json => {
      console.log('Response from LeakSignal:', json); // Log the response from LeakSignal
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
  
  if (request.callid === 'checkVersion') {
    checkForNewVersion(sendResponse);
    return true; // Will respond asynchronously
  }
  
  return true; // Ensure the listener returns true to indicate asynchronous response
});

function checkForNewVersion(sendResponse) {
  fetch('https://scan.leaksignal.com/api/v1/extension')
    .then(response => {
      if (response.status === 404) {
        console.log('Extension version check not available.');
        sendResponse(null);
        return;
      }
      return response.json();
    })
    .then(data => {
      if (data && data.new_version_url) {
        sendResponse(data);
      } else {
        sendResponse(null);
      }
    })
    .catch(error => {
      console.error('Error checking for new version:', error);
      sendResponse(null);
    });
}

// Check for new version on startup and periodically
checkForNewVersion(() => {});
setInterval(() => checkForNewVersion(() => {}), 24 * 60 * 60 * 1000); // Check once a day
