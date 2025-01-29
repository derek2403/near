export const extensionRouter = {
  push: (path) => {
    try {
      const baseUrl = chrome.runtime.getURL('');
      const htmlPath = path === '/' ? 'index' : path.replace(/^\/+/, '');
      const fullPath = `${baseUrl}${htmlPath}.html`;
      console.log('Navigating to:', fullPath);
      window.location.href = fullPath;
    } catch (error) {
      console.error('Navigation error:', error);
    }
  },

  replace: (path) => {
    try {
      const baseUrl = chrome.runtime.getURL('');
      const htmlPath = path === '/' ? 'index' : path.replace(/^\/+/, '');
      const fullPath = `${baseUrl}${htmlPath}.html`;
      console.log('Replacing with:', fullPath);
      window.location.replace(fullPath);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }
}; 