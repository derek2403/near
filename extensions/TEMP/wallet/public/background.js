chrome.runtime.onInstalled.addListener(() => {
  console.log('Wallet Extension installed')
})

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CONNECT_WALLET') {
    // Handle wallet connection
    sendResponse({ success: true })
  }
}) 