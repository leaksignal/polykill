let enabled = false;
let debugEnabled = false;
let eventListenersGathered = false;
let completedEvent = false;
let activeTabId = null;

chrome.webNavigation.onCompleted.addListener(details => {
  if (details.frameId === 0) { // Check if it's the main frame
    completedEvent = true;
    eventListenersGathered = false; // Reset event listeners gathered flag
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      activeTabId = tabs[0].id;
      console.log('--- page load complete');
      getEventListeners(tabs[0]);
    });
  }
});

chrome.webNavigation.onBeforeNavigate.addListener(details => {
  if (details.frameId === 0) { // Check if it's the main frame
    completedEvent = false; // Reset completed event flag
  }
});

chrome.action.onClicked.addListener(tab => {
  if (completedEvent && eventListenersGathered) {
    chrome.tabs.sendMessage(tab.id, 'complete', response => {});
  } else {
    console.log('Page not fully loaded or event listeners not gathered yet.');
  }
});

function getEventListeners(tab) {
  const version = "1.0";
  activeTabId = tab.id;
  console.log(activeTabId);

  const debuggee = { tabId: activeTabId };
  console.log(activeTabId);

  if (!debugEnabled) {
    chrome.debugger.attach(debuggee, version, onAttach.bind(null, activeTabId));
  }

  chrome.debugger.sendCommand(debuggee, "Debugger.enable", {}, result => {
    console.log('Debugger message: ', JSON.stringify(result));
  });

  chrome.debugger.onEvent.addListener((source, method, params) => {
    if (method !== 'DOM.childNodeCountUpdated') {
      console.log('*****debugger listener enabled', params, source, method);
      if (params.executionContextAuxData && params.executionContextAuxData.type === 'default') {
        chrome.tabs.sendMessage(activeTabId, params, response => {});
      }
    }
  });

  debugEnabled = true;
  chrome.debugger.sendCommand(debuggee, "DOM.getDocument", response => {
    const responsedDOM = response;
    const body = util.getBodyDOM(responsedDOM);

    chrome.debugger.sendCommand(debuggee, "DOM.resolveNode", { nodeId: body.nodeId }, response => {
      console.log('response from resolveNode' + response.object.objectId);

      chrome.debugger.sendCommand(debuggee, "DOMDebugger.getEventListeners", {
        "objectId": response.object.objectId,
        "depth": -1,
        "pierce": true
      }, result => {
        eventListenersGathered = true;
        chrome.tabs.sendMessage(activeTabId, result, response => {});
      });
    });
  });

  function onAttach(tabId) {
    if (chrome.runtime.lastError) {
      alert(chrome.runtime.lastError.message);
      return;
    }
  }
}

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
});



// Utilities for DOM processing
const util = {
  rootName: function(url) {
    let index;
    let endFlag = false;
    for (let i = 0; i < url.length; i++) {
      if (url[i] == "2" && !endFlag) {
        i++;
        endFlag = true;
        continue;
      }
      if (url[i] == "\/" && endFlag) {
        index = i;
        break;
      }
    }
    return url.substring(0, index);
  },
  error: function(msg) {
    console.log("[ERROR] " + msg);
  },
  log: function(msg) {
    console.log("[LOG] " + msg);
  },
  substringFileName: function(url) {
    let index;
    for (let i = url.length - 1; i >= 0; i--) {
      if (url[i] == "\/") {
        index = i;
        break;
      }
    }
    return url.substring(index + 1, url.length);
  },
  getBodyDOM: function(responsedDOM) {
    for (let i = 0; i < responsedDOM.root.childNodeCount; i++) {
      const firstRootChildren = responsedDOM.root.children[i];
      console.log('bodyDom...' + JSON.stringify(firstRootChildren));
      for (let j = 0; j < firstRootChildren.childNodeCount; j++) {
        const secondChildren = firstRootChildren.children[j];
        if (secondChildren.localName == "body") {
          return secondChildren;
        }
      }
    }
    return "";
  }
};
