const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

let adsensePromise = null;
const pushQueue = [];
let isProcessingQueue = false;

export function loadAdSenseScript(clientId) {
  if (!clientId) return Promise.reject(new Error('Missing AdSense client ID'));

  if (window.adsbygoogle) return Promise.resolve();

  if (adsensePromise) return adsensePromise;

  adsensePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-ads]');
    if (existing) {
      if (window.adsbygoogle) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('AdSense script failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `${ADSENSE_SRC}?client=${clientId}`;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-google-ads', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('AdSense script failed'));
    document.head.appendChild(script);
  });

  return adsensePromise;
}

function pushAdSenseUnit() {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  } catch (e) {
    console.warn('AdSense push failed:', e);
    return false;
  }
}

async function processPushQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (pushQueue.length > 0) {
    const task = pushQueue.shift();
    await task();
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  isProcessingQueue = false;
}

export function requestAdSensePush(clientId) {
  return new Promise((resolve, reject) => {
    pushQueue.push(async () => {
      try {
        await loadAdSenseScript(clientId);
        pushAdSenseUnit();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    processPushQueue();
  });
}
