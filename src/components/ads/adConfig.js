// Google AdSense official demo publisher — no verification needed, do NOT use data-adtest with this ID
export const GOOGLE_TEST_AD_CLIENT = 'ca-pub-3940256099942544';
export const GOOGLE_TEST_AD_SLOT = '6300978111';

// AdSense allows max 3 display ad units per page — extra units cause 400 errors
export const MAX_ADS_PER_PAGE = 3;

const isTestMode = process.env.REACT_APP_GOOGLE_AD_TEST !== 'false';

export const AD_TEST_MODE = isTestMode;

// Only these placements load real AdSense in test mode (stays within 3-ad limit)
export const TEST_ACTIVE_PLACEMENTS = new Set(['TOP_BANNER', 'SIDEBAR', 'IN_CONTENT_1']);

export const GOOGLE_AD_CLIENT = isTestMode
  ? GOOGLE_TEST_AD_CLIENT
  : process.env.REACT_APP_GOOGLE_AD_CLIENT || '';

const slot = (envKey) => {
  const value = process.env[envKey];
  if (value && !value.startsWith('div-gpt-ad')) {
    return value;
  }
  return isTestMode ? GOOGLE_TEST_AD_SLOT : '';
};

export const AD_SLOTS = {
  TOP_BANNER: slot('REACT_APP_AD_SLOT_TOP'),
  BOTTOM_BANNER: slot('REACT_APP_AD_SLOT_BOTTOM'),
  SIDEBAR: slot('REACT_APP_AD_SLOT_SIDEBAR'),
  IN_CONTENT_1: slot('REACT_APP_AD_SLOT_IN_CONTENT_1'),
  IN_CONTENT_2: slot('REACT_APP_AD_SLOT_IN_CONTENT_2'),
  STICKY_FOOTER: slot('REACT_APP_AD_SLOT_STICKY_FOOTER'),
};

export const AD_LABELS = {
  TOP_BANNER: 'Top Banner Ad',
  BOTTOM_BANNER: 'Bottom Banner Ad',
  SIDEBAR: 'Sidebar Ad',
  IN_CONTENT_1: 'In-Content Ad 1',
  IN_CONTENT_2: 'In-Content Ad 2',
  STICKY_FOOTER: 'Sticky Footer Ad',
};

export function shouldLoadAdSense(placement) {
  if (!GOOGLE_AD_CLIENT || !AD_SLOTS[placement]) return false;
  if (AD_TEST_MODE) return TEST_ACTIVE_PLACEMENTS.has(placement);
  return true;
}
