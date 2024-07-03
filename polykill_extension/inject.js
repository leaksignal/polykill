let xhrList = [], scriptList = [], beaconList = [];
let xhrSet = new Set(), scriptSet = new Set(), beaconSet = new Set();
let tldSet = new Set();

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

// Observer for performance entries
let observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    switch (entry.initiatorType) {
      case 'xmlhttprequest':
        if (!xhrSet.has(entry.name)) {
          xhrSet.add(entry.name);
          xhrList.push(entry);
          tldSet.add(getTLD(entry.name));
        }
        break;
      case 'script':
        if (!scriptSet.has(entry.name)) {
          scriptSet.add(entry.name);
          scriptList.push(entry);
          tldSet.add(getTLD(entry.name));
        }
        break;
      case 'beacon':
        if (!beaconSet.has(entry.name)) {
          beaconSet.add(entry.name);
          beaconList.push(entry);
          tldSet.add(getTLD(entry.name));
        }
        break;
    }
  });
});
observer.observe({ entryTypes: ["resource"] });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === 'complete') {
    runConsoleReport();
    sendResponse({status: "completed"}); // Ensure response is sent back
  }

  return true; // Indicate asynchronous response
});

function runConsoleReport() {
  let urls = {
    url: trimQueryParams(window.location.href),
    scripts: scriptList.map(item => ({ url: trimQueryParams(item.name) })),
    xhrs: xhrList.map(item => ({ url: trimQueryParams(item.name) })),
    beacons: beaconList.map(item => ({ url: trimQueryParams(item.name) })),
  };

  runMockAPIReport('https://scan.leaksignal.com/api/v1/risk', urls).then((results) => {
    let reportContent = formatReport(results.scripts, results.xhrs, results.beacons, Array.from(tldSet));
    setTimeout(() => {
      openReportWindow(reportContent);
    }, 3000);
  }).catch(error => {
    console.error('Error in runConsoleReport:', error);
  });
}

function runMockAPIReport(input, data) {
  let callid = 'leaksignal';
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ input, data, callid }, (messageResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const [response, error] = messageResponse;
      if (response === null) {
        reject(error);
      } else {
        let responseData = response.body; // Use the data from LeakSignal response
        // Map analysisResult to corresponding URL
        resolve({
          scripts: mapAnalysisResults(data.scripts, responseData.scripts),
          xhrs: mapAnalysisResults(data.xhrs, responseData.xhrs),
          beacons: mapAnalysisResults(data.beacons, responseData.beacons),
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
    return result ? { ...item, analysisSummary: result.analysisSummary || {} } : item;
  });
}

function trimQueryParams(url) {
  try {
    let urlObj = new URL(url);
    urlObj.search = '';
    return urlObj.toString();
  } catch (e) {
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

function formatURL(url, analysisSummary) {
  let formattedURL = `● ${url}\n`;
  if (analysisSummary && typeof analysisSummary === 'object' && Object.keys(analysisSummary).length > 0) {
    for (let key in analysisSummary) {
      let formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      let analysisResult = analysisSummary[key];
      if (key === 'scriptBodyAnalysis') {
        analysisResult = analysisResult || { status: 'PENDING' };
        let statusColor = analysisResult.status === 'PENDING' ? 'grey' : (analysisResult.status === 'CLEAR' ? 'green' : 'red');
        let link = analysisResult.status === 'PENDING' ? 'https://openai.com/chatgpt/' : 'https://developers.google.com/safe-browsing';
        formattedURL += `  ○ ${formattedKey} (powered by ChatGPT): <a href="${link}" style="color:${statusColor};" target="_blank">${analysisResult.status}</a>\n`;
      } else if (analysisResult && analysisResult.status) {
        let statusColor = analysisResult.status === 'CLEAR' ? 'green' : 'red';
        let link = key === 'blockListAnalysis' ? 'https://easylist.to/' : 'https://developers.google.com/safe-browsing';
        formattedURL += `  ○ ${formattedKey}: <a href="${link}" style="color:${statusColor};" target="_blank">${analysisResult.status}</a>\n`;
      }
    }
  } else {
    formattedURL += `  ○ No analysis available\n`;
  }
  formattedURL += '\n';
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
