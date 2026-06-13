import { useEffect } from 'react';
import { GOOGLE_AD_CLIENT, AD_LABELS } from './adConfig';

let scriptLoaded = false;

const loadAdScript = (clientId) => {
  if (scriptLoaded || !clientId) return;
  const existing = document.querySelector('script[data-google-ads]');
  if (existing) {
    scriptLoaded = true;
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-google-ads', 'true');
  document.head.appendChild(script);
  scriptLoaded = true;
};

const GoogleAd = ({ placement, slot, format = 'auto', className = '' }) => {
  const label = AD_LABELS[placement] || placement;
  const isLive = GOOGLE_AD_CLIENT && slot;

  useEffect(() => {
    if (!isLive) return;
    loadAdScript(GOOGLE_AD_CLIENT);
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // May fail in dev without valid AdSense account
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isLive, slot]);

  if (!isLive) {
    return (
      <div className={`ad-slot ad-slot--test ad-slot--${placement.toLowerCase()} ${className}`}>
        <span className="ad-label">Google Ad — Test Placement</span>
        <span className="ad-placement-name">{label}</span>
        <span className="ad-hint">Set REACT_APP_GOOGLE_AD_CLIENT in .env for live ads</span>
      </div>
    );
  }

  return (
    <div className={`ad-slot ad-slot--live ad-slot--${placement.toLowerCase()} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={GOOGLE_AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
