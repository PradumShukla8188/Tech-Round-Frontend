const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

let loadPromise = null;
let pushIndex = 0;
const initializedElements = new WeakSet();

function isScriptReady(script) {
  if (!script) return false;
  if (script.getAttribute('data-loaded') === 'true') return true;
  return script.readyState === 'complete' || script.readyState === 'loaded';
}

export function ensureAdSenseScript(clientId) {
  if (!clientId) return Promise.reject(new Error('Missing AdSense client ID'));
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="adsbygoogle.js"]');

    if (existing && isScriptReady(existing)) {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener(
        'load',
        () => {
          existing.setAttribute('data-loaded', 'true');
          resolve();
        },
        { once: true },
      );
      existing.addEventListener('error', () => reject(new Error('AdSense script failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `${ADSENSE_SRC}?client=${clientId}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = () => reject(new Error('AdSense script failed'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function fillAdUnit(clientId, element) {
  if (element && initializedElements.has(element)) return true;
  if (element) initializedElements.add(element);

  await ensureAdSenseScript(clientId);

  const delay = pushIndex * 400;
  pushIndex += 1;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  } catch (e) {
    console.warn('AdSense push failed:', e);
    if (element) initializedElements.delete(element);
    return false;
  }
}
