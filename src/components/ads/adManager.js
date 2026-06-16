import {
  GOOGLE_AD_CLIENT,
  AD_TEST_MODE,
  AD_SLOTS,
  TEST_ACTIVE_PLACEMENTS,
  getAdDimensions,
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

function waitForContainerWidth(container, maxWaitMs = 8000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      const width = container.getBoundingClientRect().width;
      if (width > 0) {
        resolve(width);
        return;
      }
      if (Date.now() - started > maxWaitMs) {
        reject(new Error(`Container width is 0 after ${maxWaitMs}ms`));
        return;
      }
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

export function isPlacementEnabled(placement) {
  if (!GOOGLE_AD_CLIENT || !AD_SLOTS[placement]) return false;
  if (AD_TEST_MODE) return TEST_ACTIVE_PLACEMENTS.includes(placement);
  return true;
}

export function mountAdUnit(placement, container) {
  if (!container || !isPlacementEnabled(placement)) return false;
  
  if (container.dataset.adStatus === 'filled') return false;

  initializedPlacements.add(placement);

  const { width, height } = getAdDimensions(placement);
  container.innerHTML = '';

  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'inline-block';
  ins.style.width = `${width}px`;
  ins.style.height = `${height}px`;
  ins.style.maxWidth = '100%';
  ins.setAttribute('data-ad-client', GOOGLE_AD_CLIENT);
  ins.setAttribute('data-ad-slot', AD_SLOTS[placement]);

  if (AD_TEST_MODE) {
    ins.setAttribute('data-adtest', 'on');
  }

  container.appendChild(ins);

  const pushAd = () => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      container.dataset.adStatus = 'filled';
      pushCount += 1;
    } catch (e) {
      console.warn(`AdSense push failed (${placement}):`, e);
      container.dataset.adStatus = 'error';
      initializedPlacements.delete(placement);
    }
  };

  Promise.all([waitForAdSenseScript(), waitForContainerWidth(container)])
    .then(() => {
      const delay = (pushCount) * 500;
      setTimeout(pushAd, delay);
    })
    .catch((e) => {
      console.warn(`AdSense init error (${placement}):`, e);
      initializedPlacements.delete(placement);
      container.dataset.adStatus = 'error';
    });

  return true;
}
