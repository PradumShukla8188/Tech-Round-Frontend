import { useCallback } from 'react';
import {
  GOOGLE_AD_CLIENT,
  AD_LABELS,
  AD_TEST_MODE,
  AD_SLOTS,
  shouldLoadAdSense,
} from './adConfig';
import { fillAdUnit } from './adScriptLoader';

const GoogleAd = ({ placement, slot, format = 'auto', className = '' }) => {
  const label = AD_LABELS[placement] || placement;
  const loadLiveAd = shouldLoadAdSense(placement);
  const adSlot = slot || AD_SLOTS[placement];
  const adFormat = AD_TEST_MODE ? 'auto' : format;

  const insCallback = useCallback(
    (node) => {
      if (!node || !loadLiveAd || !GOOGLE_AD_CLIENT || !adSlot) return;

      fillAdUnit(GOOGLE_AD_CLIENT, node).catch((e) => {
        console.warn(`AdSense failed for ${placement}:`, e);
      });
    },
    [loadLiveAd, adSlot, placement],
  );

  if (!loadLiveAd) {
    return (
      <div className={`ad-slot ad-slot--placeholder ad-slot--${placement.toLowerCase()} ${className}`}>
        {AD_TEST_MODE && <span className="ad-test-badge">Ad Slot</span>}
        <span className="ad-label">Ad Placement</span>
        <span className="ad-placement-name">{label}</span>
        <span className="ad-hint">Active when live AdSense is enabled</span>
      </div>
    );
  }

  return (
    <div
      className={`ad-slot ad-slot--live ${AD_TEST_MODE ? 'ad-slot--demo' : ''} ad-slot--${placement.toLowerCase()} ${className}`}
    >
      {AD_TEST_MODE && <span className="ad-test-badge">AdSense Test</span>}
      <ins
        ref={insCallback}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', width: '100%' }}
        data-ad-client={GOOGLE_AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
