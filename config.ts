import { TestIds } from 'react-native-google-mobile-ads';

/** Replace with the real Play Store link once the listing is live. */
export const PLAY_STORE_LINK = 'https://play.google.com/store/apps/details?id=com.gauravj.bhaktialarm';
export const PLAY_STORE_SHORT = 'play.google.com/store/apps/details?id=com.gauravj.bhaktialarm';

/** AdMob unit ids. Test ids until real units are created in AdMob (+ mediation in the AdMob console). */
export const AD_UNITS = {
  banner: TestIds.ADAPTIVE_BANNER,
  interstitial: TestIds.INTERSTITIAL,
};
/** Minimum gap between interstitials, so ads never feel spammy. */
export const INTERSTITIAL_MIN_GAP_MS = 3 * 60 * 1000;
