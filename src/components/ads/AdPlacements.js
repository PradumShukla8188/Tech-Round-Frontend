import GoogleAd from './GoogleAd';
import { AD_TEST_MODE } from './adConfig';

export const TopBannerAd = () => <GoogleAd placement="TOP_BANNER" />;

export const BottomBannerAd = () =>
  AD_TEST_MODE ? null : <GoogleAd placement="BOTTOM_BANNER" />;

export const SidebarAd = () => <GoogleAd placement="SIDEBAR" />;

export const InContentAd1 = () => <GoogleAd placement="IN_CONTENT_1" />;

export const InContentAd2 = () =>
  AD_TEST_MODE ? null : <GoogleAd placement="IN_CONTENT_2" />;

export const StickyFooterAd = () =>
  AD_TEST_MODE ? null : (
    <div className="sticky-footer-ad">
      <GoogleAd placement="STICKY_FOOTER" />
    </div>
  );
