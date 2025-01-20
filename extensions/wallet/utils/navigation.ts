export type Page = 'home' | 'createWallet' | 'login' | 'dashboard' | 'send' | 'receive' | 'settings';

export const navigateTo = (page: Page | `${Page}?${string}`) => {
  const basePage = page.split('?')[0] as Page;
  chrome.storage.local.set({ 
    currentPage: basePage,
    queryParams: page.includes('?') ? page.split('?')[1] : null 
  }, () => {
    console.log('Navigated to:', page);
  });
}; 