import {
  GOOGLE_AD_CLIENT,
  AD_TEST_MODE,
  AD_SLOTS,
  TEST_ACTIVE_PLACEMENTS,
  MAX_TEST_ADS,
} from './adConfig';

const initializedPlacements = new Set();
let scriptReadyPromise = null;
let pushCount = 0;

function waitForAdSenseScript() {
  if (scriptReadyPromise) return scriptReadyPromise;

  scriptReadyPromise = new Promise((resolve, reject) => {
    const script = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!script) {
      reject(new Error('AdSense script not found in index.html'));
      return;
    }

    if (script.getAttribute('data-ready') === '1') {
      resolve();
      return;
    }

    const onReady = () => {
      script.setAttribute('data-ready', '1');
      resolve();
    };

    script.addEventListener('load', onReady, { once: true });
    script.addEventListener('error', () => reject(new Error('AdSense script failed')), {
      once: true,
    });

    setTimeout(onReady, 2000);
  });

  return scriptReadyPromise;
}

export function isPlacementEnabled(placement) {
  if (!GOOGLE_AD_CLIENT || !AD_SLOTS[placement]) return false;
  if (AD_TEST_MODE) return TEST_ACTIVE_PLACEMENTS.includes(placement);
  return true;
}

export function mountAdUnit(placement, container) {
  if (!container || !isPlacementEnabled(placement)) return false;
  if (initializedPlacements.has(placement)) return false;

  if (AD_TEST_MODE && initializedPlacements.size >= MAX_TEST_ADS) return false;

  initializedPlacements.add(placement);
  container.innerHTML = '';

  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'block';
  ins.setAttribute('data-ad-client', GOOGLE_AD_CLIENT);
  ins.setAttribute('data-ad-slot', AD_SLOTS[placement]);
  ins.setAttribute('data-ad-format', 'auto');
  ins.setAttribute('data-full-width-responsive', 'true');

  container.appendChild(ins);

  waitForAdSenseScript()
    .then(() => {
      if (pushCount >= MAX_TEST_ADS && AD_TEST_MODE) return;

      const delay = pushCount * 600;
      pushCount += 1;

      setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          container.dataset.adStatus = 'filled';
        } catch (e) {
          console.warn(`AdSense push failed (${placement}):`, e);
          container.dataset.adStatus = 'error';
        }
      }, delay);
    })
    .catch((e) => {
      console.warn(`AdSense script error (${placement}):`, e);
      initializedPlacements.delete(placement);
      container.dataset.adStatus = 'error';
    });

  return true;
}
