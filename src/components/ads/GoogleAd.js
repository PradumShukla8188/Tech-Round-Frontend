import { useEffect, useRef } from 'react';
import { GOOGLE_AD_CLIENT, AD_LABELS, AD_TEST_MODE } from './adConfig';
import { requestAdSensePush } from './adScriptLoader';

const GoogleAd = ({ placement, slot, format = 'auto', className = '' }) => {
  const label = AD_LABELS[placement] || placement;
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const isConfigured = Boolean(GOOGLE_AD_CLIENT && slot);

  useEffect(() => {
    if (!isConfigured || pushedRef.current || !insRef.current) return undefined;

    let cancelled = false;

    const initAdSense = async () => {
      try {
        await requestAdSensePush(GOOGLE_AD_CLIENT);
        if (!cancelled) pushedRef.current = true;
      } catch (e) {
        console.warn('AdSense test ad failed:', e);
      }
    };

    const timer = setTimeout(initAdSense, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isConfigured, slot, placement]);

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
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: AD_TEST_MODE ? '90px' : undefined }}
        data-ad-client={GOOGLE_AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(AD_TEST_MODE ? { 'data-adtest': 'on' } : {})}
      />
    </div>
  );
};

export default GoogleAd;
