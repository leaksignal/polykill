export function injectStyle() {
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

  .leaksignal-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* Ensure it is on top */
  }

  .leaksignal-loading-message {
    background-color: white;
    border: 2px solid black;
    padding: 20px;
    font-size: 16px;
    color: black;
    text-align: center;
  }
`;

	const head = document.head || document.getElementsByTagName('head')[0];
	if (head) {
		head.appendChild(style);
	} else {
		// If head is not yet available, retry after a short delay
		setTimeout(injectStyle, 50);
	}
}
