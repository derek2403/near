// Inject provider into webpage
const injectProvider = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('provider.js');
  script.type = 'module';
  document.head.appendChild(script);
};

injectProvider();

// Listen for messages from the webpage
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'NEAR_REQUEST') {
    // Handle NEAR requests here
    chrome.runtime.sendMessage(event.data, (response) => {
      window.postMessage({ type: 'NEAR_RESPONSE', ...response }, '*');
    });
  }
}); 