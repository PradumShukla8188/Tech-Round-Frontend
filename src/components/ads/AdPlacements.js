import GoogleAd from './GoogleAd';
import { AD_SLOTS } from './adConfig';

export const TopBannerAd = () => (
  <GoogleAd placement="TOP_BANNER" slot={AD_SLOTS.TOP_BANNER} format="horizontal" />
);

export const BottomBannerAd = () => (
  <GoogleAd placement="BOTTOM_BANNER" slot={AD_SLOTS.BOTTOM_BANNER} format="horizontal" />
);

export const SidebarAd = () => (
  <GoogleAd placement="SIDEBAR" slot={AD_SLOTS.SIDEBAR} format="vertical" />
);

export const InContentAd1 = () => (
  <GoogleAd placement="IN_CONTENT_1" slot={AD_SLOTS.IN_CONTENT_1} format="rectangle" />
);

export const InContentAd2 = () => (
  <GoogleAd placement="IN_CONTENT_2" slot={AD_SLOTS.IN_CONTENT_2} format="rectangle" />
);

export const StickyFooterAd = () => (
  <div className="sticky-footer-ad">
    <GoogleAd placement="STICKY_FOOTER" slot={AD_SLOTS.STICKY_FOOTER} format="horizontal" />
  </div>
);
