export type Page = 'home' | 'createWallet' | 'login' | 'dashboard' | 'send' | 'receive' | 'settings';

export const navigateTo = async (page: Page | `${Page}?${string}`) => {
  // Check if user is authenticated for protected routes
  const protectedRoutes: Page[] = ['dashboard', 'send', 'receive', 'settings'];
  const basePage = page.split('?')[0] as Page;

  if (protectedRoutes.includes(basePage)) {
    const result = await chrome.storage.local.get(['walletInfo']);
    if (!result.walletInfo) {
      // Redirect to login if not authenticated
      chrome.storage.local.set({ 
        currentPage: 'login',
        intendedDestination: page // Store the intended destination
      });
      return;
    }
  }

  // If authenticated or not a protected route, proceed with navigation
  chrome.storage.local.set({ 
    currentPage: basePage,
    queryParams: page.includes('?') ? page.split('?')[1] : null 
  });
}; 