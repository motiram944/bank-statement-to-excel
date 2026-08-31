'use client';

import React, { useEffect } from 'react';
import { Sparkles, DollarSign } from 'lucide-react';

interface AdBannerProps {
  isPro?: boolean;
  onOpenPricing?: () => void;
  adClient?: string;
  adSlot?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  isPro = false,
  onOpenPricing,
  adClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-3940256099942544', // Demo Google AdSense Pub ID
  adSlot = '1234567890',
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense unit init:', e);
    }
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-md my-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Google AdSense Unit */}
        <div className="flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Advertisement</span>
            <span className="text-[10px] text-slate-400 border border-slate-700 px-1.5 py-0.2 rounded">Google AdSense Partner</span>
          </div>

          <ins
            className="adsbygoogle block w-full text-center"
            style={{ display: 'block', minHeight: '60px' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          {/* AdSense Fallback Banner if ad unit is loading or blocked */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase">
              <DollarSign className="h-4 w-4" />
            </div>
            <p className="text-xs text-slate-200">
              <span className="text-white font-semibold">LedgerClean Free Edition</span> — Supported by Google Ads & Partners. Your data remains 100% private locally on your device.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
