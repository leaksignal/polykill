let childList = [];
let xhrList = [], scriptList = [], beaconList = [];
let xhrSet = new Set(), scriptSet = new Set(), beaconSet = new Set();

// Inject CSS to add a thin purple border around the page
const style = document.createElement('style');
style.innerHTML = `
  body::before {
    content: "";
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    border: 2px solid purple;
    pointer-events: none;
    z-index: 9998; /* Ensure it is below the text */
  }

  .leaksignal-reporting-text {
    position: fixed;
    top: 10px;
    right: 10px;
    color: purple;
    background-color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-family: Arial, sans-serif;
    z-index: 9999; /* Ensure it is on top */
    pointer-events: none;
  }
`;
document.head.appendChild(style);

// Inject the monitoring enabled text
const monitoringText = document.createElement('div');
monitoringText.className = 'leaksignal-reporting-text';
monitoringText.innerText = 'LeakSignal Reporting Enabled';
document.body.appendChild(monitoringText);

console.log('LeakSignal Monitoring Extension content script running.');

// Observer for performance entries
let observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(1, entry);
    switch (entry.initiatorType) {
      case 'xmlhttprequest':
        if (!xhrSet.has(entry.name)) {
          xhrSet.add(entry.name);
          xhrList.push(entry);
        }
        break;
      case 'script':
        if (!scriptSet.has(entry.name)) {
          scriptSet.add(entry.name);
          scriptList.push(entry);
        }
        break;
      case 'beacon':
        if (!beaconSet.has(entry.name)) {
          beaconSet.add(entry.name);
          beaconList.push(entry);
        }
        break;
    }
  });
});
observer.observe({ entryTypes: ["resource"] });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "onMessage Called");

  if (request === 'complete') {
    console.log('_________page load complete');

    childList.forEach((child) => {
      document.body.appendChild(child);
    });

    runConsoleReport();
  } else {
    let fragment = document.createDocumentFragment();
    let div = document.createElement("div");

    if (request.scriptId) {
      div.className = "srd_scripts";
    } else if (request.listeners) {
      div.className = "srd_listeners";
    }

    div.style.display = 'none';

    if (request.listeners || request.scriptId) {
      div.innerHTML = JSON.stringify(request);
    }

    console.log(33, div);
    fragment.appendChild(div);

    if (!request.childNodeCount) {
      console.log(34, fragment);
      childList.push(fragment);
    }
  }

  return Promise.resolve("Dummy response to keep the console quiet");
});

let alertCount = 0;
let warningCount = 0;

function runConsoleReport() {
  alertCount = 0; // Reset alert counter
  warningCount = 0; // Reset warning counter

  let allListeners = aggregateListeners();
  let scriptInfo = aggregateScripts();
  let stats = compileStats(allListeners, scriptInfo);

  let urls = {
    url: trimQueryParams(window.location.href),
    scripts: scriptList.map(item => ({ url: trimQueryParams(item.name), analysisSummary: "not populated" })),
    xhrs: xhrList.map(item => ({ url: trimQueryParams(item.name), analysisSummary: "not populated" })),
    beacons: beaconList.map(item => ({ url: trimQueryParams(item.name), analysisSummary: "not populated" })),
    tlds: Array.from(new Set([...scriptList, ...xhrList, ...beaconList].map(item => getTLD(trimQueryParams(item.name))))),
    eventlisteners: allListeners
  };

  runMockAPIReport('https://httpbin.org/post', urls).then((results) => {
    let reportContent = formatReport(stats, results.scripts, results.xhrs, results.beacons, results.tlds);
    setTimeout(() => {
      openReportWindow(reportContent);
    }, 3000);
  }).catch(error => {
    console.error('Error in runMockAPIReport:', error);
  });
}

function runMockAPIReport(input, data) {
  console.log('runMockAPIReport', data.url); // Log the URL being processed
  let callid = 'httpbin';
  return new Promise((resolve, reject) => {
    console.log('Sending message to background.js with:', { input, data, callid }); // Add logging here
    chrome.runtime.sendMessage({ input, data, callid }, (messageResponse) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }

      const [response, error] = messageResponse;
      if (response === null) {
        console.error('Error response:', error); // Log error
        reject(error);
      } else {
        console.log('Response received:', response); // Log the received response
        let responseData = JSON.parse(response.body.data); // Parse the data from httpbin response
        // Map analysisResult to corresponding URL
        resolve({
          scripts: mapAnalysisResults(data.scripts, responseData.scripts),
          xhrs: mapAnalysisResults(data.xhrs, responseData.xhrs),
          beacons: mapAnalysisResults(data.beacons, responseData.beacons),
          tlds: responseData.tlds || []
        });
      }
    });
  });
}

function mapAnalysisResults(requestList, responseList) {
  if (!responseList) return requestList;
  return requestList.map(item => {
    const trimmedUrl = trimQueryParams(item.url);
    const result = responseList.find(responseItem => trimQueryParams(responseItem.url) === trimmedUrl);
    return result ? { ...item, analysisSummary: result.analysisSummary } : item;
  });
}

function trimQueryParams(url) {
  try {
    let urlObj = new URL(url);
    urlObj.search = '';
    return urlObj.toString();
  } catch (e) {
    console.error('Invalid URL:', url);
    return url;
  }
}

function formatReport(stats, scripts, xhrs, beacons, tlds) {
  scripts = scripts || [];
  xhrs = xhrs || [];
  beacons = beacons || [];
  tlds = tlds || [];

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' UTC';
  const fullUrl = trimQueryParams(window.location.href);

  let reportContent = `Polykill - ${fullUrl} Site Report\n\n`;
  reportContent += `${formattedDate}\n\n`;

  // Add the summary of warnings and alerts
  reportContent += `Summary:\n- Alerts: ${alertCount}\n- Warnings: ${warningCount}\n\n`;

  // Add TLD Inventory (Summary)
  reportContent += '<b>TLD Inventory (Summary)</b>\n\n';
  tlds.forEach(tld => {
    reportContent += `● ${tld}\n`;
  });
  reportContent += '\n';

  // JavaScript Inventory
  reportContent += '<b>JavaScript Inventory</b>\n\n';
  reportContent += 'JavaScript files are used to enhance the functionality of web pages but can also introduce security risks if not properly managed. It is important to monitor and analyze these scripts to prevent potential data leaks or malicious activities.\n\n';
  reportContent += sortAndFormatResults(scripts);

  // XHR Inventory
  reportContent += '<b>XHR Inventory</b>\n\n';
  reportContent += 'XMLHttpRequest (XHR) is used to send and receive data from a web server asynchronously. Monitoring XHR requests is crucial to identify any unauthorized data transfers and mitigate the risk of data leaks.\n\n';
  reportContent += sortAndFormatResults(xhrs);

  // Beacon Inventory
  reportContent += '<b>Beacon Inventory</b>\n\n';
  reportContent += 'Beacons are used to send small amounts of data to a server asynchronously. While useful for analytics and tracking, they can also be used to exfiltrate data, making it essential to monitor these requests.\n\n';
  reportContent += sortAndFormatResults(beacons);

  // Event Listener Inventory
  reportContent += '<b>Event Listener Inventory</b>\n\n';
  reportContent += 'Event listeners track user interactions on a web page, such as clicks, form submissions, and other activities. It is important to monitor these listeners to ensure they do not capture sensitive data or introduce vulnerabilities.\n\n';
  reportContent += formatEventListeners(stats);

  reportContent += '\nFor questions or further support please contact support@leaksignal.com\n';

  return reportContent;
}

function formatEventListeners(stats) {
  let formattedContent = '';
  let urlListenersMap = new Map();

  for (let stat in stats.types) {
    let elData = stats.types[stat];
    elData.list.forEach(dp => {
      let displayUrl = dp.url ? dp.url : "No URL";
      if (!urlListenersMap.has(displayUrl)) {
        urlListenersMap.set(displayUrl, new Set());
      }
      urlListenersMap.get(displayUrl).add(stat);
    });
  }

  urlListenersMap.forEach((listeners, url) => {
    formattedContent += `\n${url}\n`;
    listeners.forEach(listener => {
      formattedContent += `  ${listener}\n`;
    });
  });

  return formattedContent;
}

function sortAndFormatResults(results) {
  let uniqueResults = new Map();
  results.forEach(result => {
    const trimmedUrl = trimQueryParams(result.url);
    if (!uniqueResults.has(trimmedUrl)) {
      uniqueResults.set(trimmedUrl, result);
    }
  });

  let thirdPartyResults = [];
  let firstPartyResults = [];
  uniqueResults.forEach(result => {
    let url = new URL(result.url);
    if (url.hostname !== window.location.hostname) {
      thirdPartyResults.push(result);
    } else {
      firstPartyResults.push(result);
    }
  });

  thirdPartyResults.sort((a, b) => a.url.localeCompare(b.url));
  firstPartyResults.sort((a, b) => a.url.localeCompare(b.url));

  let formattedResults = '';
  [...thirdPartyResults, ...firstPartyResults].forEach(result => {
    formattedResults += formatURL(result.url, result.analysisSummary);
  });

  return formattedResults;
}

function formatURL(url, analysisResult) {
  let formattedURL = `● ${url}\n  ○ Risk Analysis: ${analysisResult}\n\n`;
  let urlObj = new URL(url);

  if (urlObj.hostname.includes('polyfill.io')) {
    formattedURL = `● <span style="color: red; font-weight: bold;">${url}</span>\n  ○ Alert: This URL is known to host polyfill.io scripts. See <a href="https://polykill.io" style="color: red;">polykill.io</a> for more details.\n\n`;
    alertCount++;
  } else if (urlObj.pathname.includes('polyfill.js') || urlObj.pathname.includes('polyfill.min.js')) {
    formattedURL = `● <span style="color: yellow;">${url}</span>\n  ○ Warning: Ensure this script does not originate from polyfill.io.\n\n`;
    warningCount++;
  }

  return formattedURL;
}

function getTLD(url) {
  try {
    let hostname = new URL(url).hostname;
    let parts = hostname.split('.');
    return parts.slice(parts.length - 2).join('.');
  } catch (e) {
    return "Invalid URL";
  }
}

function aggregateListeners() {
  let listeners = document.getElementsByClassName('srd_listeners');
  let counter = 1;
  let hobject = '';

  Array.from(listeners).forEach((listener, index) => {
    if (counter === 1) hobject = '{\"all_listeners\":[';
    hobject += listener.innerHTML + (index < listeners.length - 1 ? ',' : ']}');
    counter++;
  });

  if (!hobject.endsWith(']}')) {
    hobject += ']}';
  }

  try {
    let parsedListeners = JSON.parse(hobject);
    for (let listenerArray in parsedListeners) {
      for (let item in parsedListeners[listenerArray]) {
        let finalList = parsedListeners[listenerArray][item];
        if (finalList && Array.isArray(finalList.listeners)) {
          finalList.listeners.forEach(finalListItem => {
            if (!finalListItem.url) {
              finalListItem.url = "No URL";
            }
          });
        }
      }
    }
    return parsedListeners;
  } catch (e) {
    console.error('Error parsing listeners JSON:', e);
    return {};
  }
}

function aggregateScripts() {
  // Get all script elements on the page
  let scriptElements = document.getElementsByTagName('script');
  Array.from(scriptElements).forEach(script => {
    if (script.src) {
      scriptList.push({ name: script.src });
    }
  });

  // Get all dynamically tracked script elements
  let scripts = document.getElementsByClassName('srd_scripts');
  return Array.from(scripts).map(script => {
    try {
      return JSON.parse(script.innerHTML);
    } catch (e) {
      return {};
    }
  });
}

function compileStats(allListeners, scriptInfo) {
  let stats = { types: {} };

  for (let listenerArray in allListeners) {
    for (let item in allListeners[listenerArray]) {
      let finalList = allListeners[listenerArray][item];

      if (finalList && Array.isArray(finalList.listeners)) {
        finalList.listeners.forEach(finalListItem => {
          scriptInfo.forEach(script => {
            if (script.scriptId === finalListItem.scriptId) {
              finalListItem.url = script.url;
            }
          });

          let stat = stats.types[finalListItem.type];
          if (stat) {
            if (!stat.list.some(existingItem => JSON.stringify(existingItem) === JSON.stringify(finalListItem))) {
              stat.count++;
              stat.list.push(finalListItem);
            }
          } else {
            stats.types[finalListItem.type] = { count: 1, list: [finalListItem] };
          }
        });
      } else {
        console.error("Expected array but got:", finalList);
      }
    }
  }

  return stats;
}

function openReportWindow(reportContent) {
  const newWindow = window.open("", "_blank", "width=800,height=600");
  if (newWindow) {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Site Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <pre>${reportContent}</pre>
      </body>
      </html>
    `);
    newWindow.document.close();
  } else {
    alert("Please allow popups for this website to view the report.");
  }
}