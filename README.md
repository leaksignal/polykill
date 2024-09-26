# Polykill

this repository contains the open-source portions of the Polykill project (Chrome extension and script).

## packages

### core

contains the core logic used to extract script, beacon and XHR information from a web page.

### api-client

contains a generated source code for a Javascript client for interacting with the leakscanner API used to supplement reports.

### polykill_extension

contains the source code for the Chrome extension. imports core and api-client.

### polykill_debug_extension

unused development artifacts.

### polykill_js_extension

unused development artifacts.

## building

using VS Code Dev Containers is strongly recommended.

opening the project in VS Code will automatically install the required runtimes. once you are in the development container environment, in a terminal you can then run `npm install` to install the required dependencies, which will also generate the source code for the api-client package from the API definitions. then running `npm run build` will build all packages including the Chrome extension.
