import { useEffect, useRef } from 'react';
import { AD_LABELS, AD_TEST_MODE } from './adConfig';
import { isPlacementEnabled, mountAdUnit } from './adManager';

const GoogleAd = ({ placement, className = '' }) => {
  const label = AD_LABELS[placement] || placement;
  const containerRef = useRef(null);
  const enabled = isPlacementEnabled(placement);

  useEffect(() => {
    if (!enabled) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    const timer = setTimeout(() => {
      mountAdUnit(placement, container);
    }, 500);

    return () => clearTimeout(timer);
  }, [enabled, placement]);

  if (!enabled) {
    if (AD_TEST_MODE) return null;
    return (
      <div className={`ad-slot ad-slot--placeholder ad-slot--${placement.toLowerCase()} ${className}`}>
        <span className="ad-label">Ad Placement</span>
        <span className="ad-placement-name">{label}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ad-slot ad-slot--live ${AD_TEST_MODE ? 'ad-slot--demo' : ''} ad-slot--${placement.toLowerCase()} ${className}`}
    >
      {AD_TEST_MODE && <span className="ad-test-badge">AdSense Test</span>}
    </div>
  );
};

export default GoogleAd;
