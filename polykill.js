let lsInventories = {
    url: window.location.origin + window.location.pathname,  // Full URL without request parameters
    lsScripts: [],
    lsXhrs: [],
    lsBeacons: [],
    lsTlds: new Set()
};

// fetch API for older browsers
if (!window.fetch) {
    window.fetch = function(url, options) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open(options.method || 'GET', url);

            for (let i in options.headers) {
                request.setRequestHeader(i, options.headers[i]);
            }

            request.onload = () => {
                resolve({
                    ok: request.status >= 200 && request.status < 300,
                    status: request.status,
                    statusText: request.statusText,
                    json: () => Promise.resolve(JSON.parse(request.responseText)),
                    text: () => Promise.resolve(request.responseText)
                });
            };

            request.onerror = () => {
                reject(new TypeError('Network request failed'));
            };

            request.send(options.body || null);
        });
    };
}

// Helper function to get TLD
function getLsTLD(url) {
    try {
        let hostname = new URL(url).hostname;
        let parts = hostname.split('.');
        return parts.slice(parts.length - 2).join('.');
    } catch (e) {
        return "Invalid URL";
    }
}

// Deduplicate and add to TLD inventory
function addLsURLToInventory(url, inventory) {
    if (!inventory.includes(url)) {
        inventory.push(url);
        lsInventories.lsTlds.add(getLsTLD(url));
    }
}

// Observe resources
let lsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        switch (entry.initiatorType) {
            case 'xmlhttprequest':
                addLsURLToInventory(entry.name, lsInventories.lsXhrs);
                break;
            case 'script':
                addLsURLToInventory(entry.name, lsInventories.lsScripts);
                break;
            case 'beacon':
                addLsURLToInventory(entry.name, lsInventories.lsBeacons);
                break;
        }
    });
});
lsObserver.observe({ entryTypes: ["resource"] });

// Wait for page load to complete
window.addEventListener('load', () => {
    setTimeout(() => {
        sendLsInventories();
    }, 8000); // Give some time for late resources to load
});

// Send inventories to the server
function sendLsInventories() {
    let data = {
        url: lsInventories.url,
        scripts: lsInventories.lsScripts,
        xhrs: lsInventories.lsXhrs,
        beacons: lsInventories.lsBeacons,
        tlds: Array.from(lsInventories.lsTlds)
    };

    fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log('Data successfully sent:', data))
    .catch(error => console.error('Error sending data:', error));
}
