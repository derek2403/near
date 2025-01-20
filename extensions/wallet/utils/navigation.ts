export type Page = 'home' | 'createWallet' | 'login' | 'dashboard';

export const navigateTo = (page: Page) => {
  chrome.storage.local.set({ currentPage: page }, () => {
    console.log('Navigated to:', page);
  });
}; 