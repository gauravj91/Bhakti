# Bhakti Alarm (working name)

Devotional alarm clock + greeting image studio + Hindu calendar + virtual temple, for Android.
Expo SDK 54 / React Native 0.81 / TypeScript, with a custom native Kotlin alarm engine
(`modules/bhakti-alarm`) so alarms ring with the app closed, after reboot, and over the lock screen.

Package: `com.gauravj.bhaktialarm`

## Adding your licensed images and bhajans

Drop files into these folders, then rebuild. **Nothing else to edit** — `npm run sync-assets`
(runs automatically before every build) scans the folders and wires everything into the app.

```
assets/
  deities/<deity>/images/   ganesh_01.jpg, ganesh_02.jpg ...   (portrait, ≥1080×1350)
  deities/<deity>/audio/    ganesh_aarti_01.mp3 ...            (MP3 128–192 kbps, 30–90 s for alarms)
  temples/<deity>/          darshan.jpg, ambient.mp3          (optional per-temple override)
  temple/                   sanctum.jpg, ambient.mp3, bell.mp3 (defaults)
  templates/morning|afternoon|evening|devotional/*.jpg
  templates/festivals/<festival-slug>/*.jpg   e.g. diwali, navratri, holi, durga-puja, ganesh-chaturthi
  manifest.json                              (optional, see below)
```

Deity ids: `ganesh, ram, krishna, durga, shiva, hanuman, lakshmi, saraswati`.
Add a new deity by adding a folder **and** an entry in `src/content/catalog.ts` (`DEITIES`).

**Track ↔ wake-screen image pairing:** a track uses the image with the same number in the same
deity folder (`ganesh_aarti_02.mp3` → `ganesh_02.jpg`), else the deity's first image.
Override in `assets/manifest.json`:

```json
{
  "tracks": {
    "ganesh_aarti_02": { "title": "Sukhkarta Dukhharta", "image": "ganesh_03", "regions": ["maharashtra"] }
  },
  "images": { "ganesh_03": { "regions": ["maharashtra"] } },
  "templates": { "diwali_02": { "header": "Shubh Deepavali", "footer": "Warm wishes", "regions": ["gujarat"] } }
}
```

`regions` makes an item show first for users from that region (it never hides anything).

> ⚠️ Deity artwork must be traditional, licensed or commissioned, and reviewed by someone familiar
> with the iconography. Never AI-generated. Audio must be licensed or original.
> Current deity images and audio are **placeholders** (non-figurative Om artwork; synthesized bell/drone).

## Festival data
`src/data/festivals.json` — Oct 2026 → Dec 2027, New Delhi panchang (Drik Panchang, cross-checked with
Govt. of India lists and ISKCON for Ekadashi). Fields: id, name, date, endDate?, type, deity, regions,
major, description, greetingCategory. `greetingCategory` links to `assets/templates/festivals/<slug>`.

## Ads
`src/lib/config.ts` holds AdMob unit ids (Google test ids now) and the Play Store link used in the
export watermark. Set the real AdMob app id in `app.json` (`react-native-google-mobile-ads` plugin).
Mediation partners are configured in the AdMob console + their adapter SDKs.
Banners: alarm list, calendar, temple list, studio gallery. Interstitials: after a download/share and
between temple visits, capped at one per 3 minutes. Never on the wake screen or darshan screen.

## Build an APK
```
npm install
npm run android:apk        # → android/app/build/outputs/apk/release/app-release.apk
```
(Requires JDK 17+ and Android SDK. Release is signed with the debug key — create an upload key before Play Store.)

## Structure
- `src/screens` — Onboarding, Alarm list/edit, Ringtone picker, Wake screen, Studio + editor, Calendar, Temple list, Darshan, More
- `src/i18n/en.ts` — every UI string (add `hi.ts`, `gu.ts` with the same keys later)
- `src/content/catalog.ts` — deities, regions, region weighting, festivals
- `modules/bhakti-alarm` — native AlarmManager.setAlarmClock + foreground service + full-screen intent
