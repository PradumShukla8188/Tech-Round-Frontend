import {
  GOOGLE_AD_CLIENT,
  AD_TEST_MODE,
  AD_SLOTS,
  TEST_ACTIVE_PLACEMENTS,
  getAdDimensions,
} from './adConfig';

const initializedPlacements = new Set();
let scriptReadyPromise = null;
let gptScriptReadyPromise = null;
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

function loadGPTScript() {
  if (gptScriptReadyPromise) return gptScriptReadyPromise;

  gptScriptReadyPromise = new Promise((resolve) => {
    if (window.googletag && window.googletag.apiReady) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
    script.async = true;
    document.head.appendChild(script);

    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      window.googletag.setConfig({ singleRequest: false });
      resolve();
    });
  });

  return gptScriptReadyPromise;
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

  if (AD_TEST_MODE) {
    container.style.position = 'relative';
    
    // Use a real image element as fallback to guarantee visibility
    const fallbackImg = document.createElement('img');
    fallbackImg.src = `https://via.placeholder.com/${width}x${height}.png?text=Testing+Ad+${width}x${height}`;
    fallbackImg.style.position = 'absolute';
    fallbackImg.style.top = '50%';
    fallbackImg.style.left = '50%';
    fallbackImg.style.transform = 'translate(-50%, -50%)';
    fallbackImg.style.width = `${width}px`;
    fallbackImg.style.height = `${height}px`;
    fallbackImg.style.zIndex = '0';
    fallbackImg.style.borderRadius = '4px';
    container.appendChild(fallbackImg);

    const divId = `gpt-test-ad-${placement}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const div = document.createElement('div');
    div.id = divId;
    div.style.position = 'relative';
    div.style.zIndex = '1';
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.style.margin = '0 auto';
    container.appendChild(div);

    loadGPTScript().then(() => {
      window.googletag.cmd.push(() => {
        // We use this specific Google test path because it is one of the only ones
        // that reliably returns a visible creative (like the Google Chrome ad) for testing,
        // rather than a blank transparent box.
        const testAdUnitPath = '/6355419/Travel/Europe/France/Paris';
        
        window.googletag.defineSlot(testAdUnitPath, [[width, height], [300, 250], [728, 90], [336, 280]], divId)
          .addService(window.googletag.pubads());
        
        window.googletag.enableServices();
        
        window.googletag.display(divId);
        container.dataset.adStatus = 'filled';
      });
    }).catch(e => {
      console.warn(`GPT init error (${placement}):`, e);
      container.dataset.adStatus = 'error';
    });

    return true;
  }

  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'inline-block';
  ins.style.width = `${width}px`;
  ins.style.height = `${height}px`;
  ins.style.maxWidth = '100%';
  ins.setAttribute('data-ad-client', GOOGLE_AD_CLIENT);
  ins.setAttribute('data-ad-slot', AD_SLOTS[placement]);

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
