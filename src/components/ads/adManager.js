import {
  GOOGLE_AD_CLIENT,
  AD_TEST_MODE,
  AD_SLOTS,
  TEST_ACTIVE_PLACEMENTS,
  MAX_TEST_ADS,
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

const MOCK_CREATIVES = [
  {
    title: 'Modern Web Browser',
    desc: 'A free browser built for speed, stability, and security.',
    cta: 'Download Now',
    img: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg',
    color: '#1a73e8',
  },
  {
    title: 'Cloud Hosting Platform',
    desc: 'Deploy your applications in seconds with our SSD cloud servers.',
    cta: 'Start Free Trial',
    img: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    color: '#ff9900',
  },
  {
    title: 'Learn React Native',
    desc: 'Master cross-platform mobile development today.',
    cta: 'Enroll Course',
    img: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    color: '#61dafb',
  },
  {
    title: 'Secure VPN Service',
    desc: 'Protect your privacy online with military-grade encryption.',
    cta: 'Get 50% Off',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Lock_icon_blue.svg/512px-Lock_icon_blue.svg.png',
    color: '#10b981',
  }
];

function renderMockRichAd(container, width, height, placement) {
  const hash = placement.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ad = MOCK_CREATIVES[hash % MOCK_CREATIVES.length];
  const isHorizontal = width > height && width >= 400;

  container.innerHTML = `
    <div style="width:${width}px; height:${height}px; box-sizing:border-box; border:1px solid #ebebeb; background:#fff; font-family:Arial,sans-serif; position:relative; overflow:hidden; display:flex; ${isHorizontal ? 'flex-direction:row; align-items:center;' : 'flex-direction:column; align-items:center; justify-content:center;'} padding:15px; cursor:pointer; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      
      <!-- AdChoice Badge -->
      <div style="position:absolute; top:0; right:0; background:rgba(255,255,255,0.9); padding:2px 4px; font-size:10px; color:#666; border-bottom-left-radius:3px; display:flex; align-items:center; gap:3px; z-index:10;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#00a1f1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        Test Ad
      </div>

      <img src="${ad.img}" style="width:${isHorizontal ? '60px' : '80px'}; height:${isHorizontal ? '60px' : '80px'}; object-fit:contain; margin:${isHorizontal ? '0 20px 0 0' : '0 0 15px 0'};" />
      
      <div style="flex:1; text-align:${isHorizontal ? 'left' : 'center'};">
        <div style="font-size:16px; font-weight:bold; color:#1a0dab; margin-bottom:5px;">${ad.title}</div>
        <div style="font-size:13px; color:#4d5156; line-height:1.4; margin-bottom:${isHorizontal ? '0' : '15px'};">${ad.desc}</div>
      </div>

      <div style="margin-top:${isHorizontal ? '0' : '5px'}; margin-left:${isHorizontal ? '15px' : '0'};">
        <button style="background:${ad.color}; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; font-size:13px; cursor:pointer; width:${isHorizontal ? 'auto' : '100%'}; max-width:200px;">
          ${ad.cta}
        </button>
      </div>

    </div>
  `;
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
  if (AD_TEST_MODE) return true; // Enable globally for testing
  if (!GOOGLE_AD_CLIENT || !AD_SLOTS[placement]) return false;
  return true;
}

export function mountAdUnit(placement, container) {
  if (!container || !isPlacementEnabled(placement)) return false;
  
  // Prevent re-mounting in the exact same DOM node
  if (container.dataset.adStatus === 'filled') return false;

  // Track initialization but allow re-rendering on page changes
  initializedPlacements.add(placement);

  const { width, height } = getAdDimensions(placement);
  container.innerHTML = '';

  if (AD_TEST_MODE) {
    renderMockRichAd(container, width, height, placement);
    container.dataset.adStatus = 'filled';
    pushCount += 1;
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
    if (pushCount >= MAX_TEST_ADS && AD_TEST_MODE) return;

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
