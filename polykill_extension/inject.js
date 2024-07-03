let xhrList = [], scriptList = [], beaconList = [];
let xhrSet = new Set(), scriptSet = new Set(), beaconSet = new Set();

// Inject CSS to add a thin purple border around the page
const style = document.createElement('style');
style.innerHTML = `
  .leaksignal-reporting-text {
    position: fixed;
    bottom: 10px;
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
// const monitoringText = document.createElement('a');
// monitoringText.className = 'leaksignal-reporting-text';
// monitoringText.innerText = 'Polykill Reporting Enabled';
// monitoringText.href = '#';
// monitoringText.onclick = () => {
//   runConsoleReport();
//   return false; // Prevent default link behavior
// };
//document.body.appendChild(monitoringText);

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
    runConsoleReport();
    sendResponse({status: "completed"}); // Ensure response is sent back
  }

  return true; // Indicate asynchronous response
});

function runConsoleReport() {
  let urls = {
    url: trimQueryParams(window.location.href),
    scripts: scriptList.map(item => ({ url: trimQueryParams(item.name), analysisSummary: "not populated" })),
    xhrs: xhrList.map(item => ({ url: trimQueryParams(item.name), analysisSummary: "not populated" })),
    beacons: beaconList.map(item => ({ url: trimQueryParams(item.name), analysisSummary: "not populated" })),
    tlds: Array.from(new Set([...scriptList, ...xhrList, ...beaconList].map(item => getTLD(trimQueryParams(item.name))))),
  };

  runMockAPIReport('https://httpbin.org/post', urls).then((results) => {
    let reportContent = formatReport(results.scripts, results.xhrs, results.beacons, results.tlds);
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

function formatReport(scripts, xhrs, beacons, tlds) {
  scripts = scripts || [];
  xhrs = xhrs || [];
  beacons = beacons || [];
  tlds = tlds || [];

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' UTC';
  const fullUrl = trimQueryParams(window.location.href);

  let reportContent = `Polykill - ${fullUrl} Site Report\n\n`;
  reportContent += `${formattedDate}\n\n`;

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

  reportContent += '\nFor questions or further support please contact support@leaksignal.com\n';

  return reportContent;
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
  } else if (urlObj.pathname.includes('polyfill.js') || urlObj.pathname.includes('polyfill.min.js')) {
    formattedURL = `● <span style="color: yellow;">${url}</span>\n  ○ Warning: Ensure this script does not originate from polyfill.io.\n\n`;
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
