import { useCallback } from 'react';
import { GOOGLE_AD_CLIENT, AD_LABELS, AD_TEST_MODE } from './adConfig';
import { fillAdUnit } from './adScriptLoader';

const GoogleAd = ({ placement, slot, format = 'auto', className = '' }) => {
  const label = AD_LABELS[placement] || placement;
  const isConfigured = Boolean(GOOGLE_AD_CLIENT && slot);
  const adFormat = AD_TEST_MODE ? 'auto' : format;

  const insCallback = useCallback(
    (node) => {
      if (!node || !isConfigured) return;
      if (node.getAttribute('data-adsense-status') === 'filled') return;

      node.setAttribute('data-adsense-status', 'loading');

      fillAdUnit(GOOGLE_AD_CLIENT)
        .then((ok) => {
          node.setAttribute('data-adsense-status', ok ? 'filled' : 'error');
        })
        .catch(() => {
          node.setAttribute('data-adsense-status', 'error');
        });
    },
    [isConfigured],
  );

  if (!isConfigured) {
    return (
      <div className={`ad-slot ad-slot--test ad-slot--${placement.toLowerCase()} ${className}`}>
        <span className="ad-label">Google AdSense — Test Placement</span>
        <span className="ad-placement-name">{label}</span>
        <span className="ad-hint">Set REACT_APP_GOOGLE_AD_CLIENT in .env</span>
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
        data-ad-slot={slot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        {...(AD_TEST_MODE ? { 'data-adtest': 'on' } : {})}
      />
    </div>
  );
};

export default GoogleAd;
