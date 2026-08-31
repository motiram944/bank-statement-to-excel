import { LicenseState } from './types';

const STORAGE_KEY = 'ledgerclean_license_v1';

/**
 * 100% Free Access Mode (Subscription paywalls commented out as requested)
 */
export function getLicenseState(): LicenseState {
  // Subscription paywall removed — all users get 100% free unlimited conversions
  return {
    isPro: true,
    passActive: true,
    licenseKey: 'FREE-COMMUNITY-ACCESS',
    passExpiresAt: 9999999999999,
  };
}

export function activateLicenseKey(key: string): { success: boolean; message: string; state: LicenseState } {
  const newState: LicenseState = {
    isPro: true,
    passActive: true,
    licenseKey: 'FREE-COMMUNITY-ACCESS',
    passExpiresAt: 9999999999999,
  };

  return {
    success: true,
    message: '100% Free Access is active for all users!',
    state: newState,
  };
}

export function openLemonSqueezyCheckout(variant: '24hr' | 'pro') {
  /* Subscription checkout commented out for free access mode */
  alert('LedgerClean is currently 100% FREE to use for all features!');
}
