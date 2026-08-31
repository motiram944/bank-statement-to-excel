'use client';

import React from 'react';

interface AdBannerProps {
  isPro?: boolean;
  onOpenPricing?: () => void;
  adClient?: string;
  adSlot?: string;
}

/**
 * AdBanner Component — Disabled by user request.
 * Returns null to keep UI completely clean without advertisements.
 */
export const AdBanner: React.FC<AdBannerProps> = () => {
  return null;
};
