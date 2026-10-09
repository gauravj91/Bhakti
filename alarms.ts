import { Asset } from 'expo-asset';
import { File, Directory, Paths } from 'expo-file-system';
import Native, { isAvailable } from '../../modules/bhakti-alarm';
import { allTracks, trackById, tracksFor, Track } from '../content/catalog';

export type Alarm = {
  id: string;
  hour: number;
  minute: number;
  days: number[];          // 0=Sun..6=Sat, empty = once
  enabled: boolean;
  label: string;
  trackId: string | null;  // fixed track (when shuffle is off)
  shuffle: boolean;
  deityPool: string[];     // empty = all deities
  vibrate: boolean;
  snoozeMinutes: number;
  nextTrigger?: number;
};

export const newAlarm = (): Alarm => ({
  id: 'a' + Date.now().toString(36),
  hour: 5, minute: 30, days: [0, 1, 2, 3, 4, 5, 6], enabled: true, label: '',
  trackId: null, shuffle: false, deityPool: [], vibrate: true, snoozeMinutes: 5,
});

/** Copy a bundled track to a stable file:// path the native player can read when the app is closed. */
async function fileUriFor(t: Track): Promise<string> {
  const asset = Asset.fromModule(t.source);
  await asset.downloadAsync();
  const dir = new Directory(Paths.document, 'alarm-audio');
  if (!dir.exists) dir.create({ intermediates: true });
  const ext = (asset.type || 'mp3').replace(/^\./, '');
  const dest = new File(dir, `${t.id}_${(asset.hash || 'v1').slice(0, 8)}.${ext}`);
  if (!dest.exists && asset.localUri) {
    new File(asset.localUri).copy(dest);
  }
  return dest.exists ? dest.uri : asset.localUri || '';
}

function poolTracks(a: Alarm, region?: string | null, familyDeity?: string | null): Track[] {
  if (!a.shuffle) {
    const t = trackById(a.trackId) || allTracks(region, familyDeity)[0];
    return t ? [t] : [];
  }
  if (a.deityPool.length) return a.deityPool.flatMap((d) => tracksFor(d));
  return allTracks(region, familyDeity);
}

async function nativePayload(a: Alarm, region?: string | null, familyDeity?: string | null) {
  const tracks = poolTracks(a, region, familyDeity);
  const resolved = [] as { id: string; title: string; deityId: string; uri: string }[];
  for (const t of tracks) {
    let uri = '';
    try { uri = await fileUriFor(t); } catch {}
    resolved.push({ id: t.id, title: t.title, deityId: t.deityId, uri });
  }
  return JSON.stringify({ ...a, tracks: resolved });
}

export const alarmEngineAvailable = isAvailable;

export function listAlarms(): Alarm[] {
  if (!Native) return [];
  try { return (JSON.parse(Native.getAlarms()) as Alarm[]).sort((x, y) => x.hour * 60 + x.minute - (y.hour * 60 + y.minute)); } catch { return []; }
}

export async function saveAlarm(a: Alarm, region?: string | null, familyDeity?: string | null) {
  if (!Native) return 0;
  return Native.saveAlarm(await nativePayload(a, region, familyDeity));
}
export function deleteAlarm(id: string) { Native?.deleteAlarm(id); }
export async function testAlarm(a: Alarm, region?: string | null, familyDeity?: string | null) {
  if (!Native) return;
  Native.testAlarm(10, await nativePayload(a, region, familyDeity));
}

export type Ringing = { alarmId: string; label: string; trackId: string; trackTitle: string; deityId: string; snoozeMinutes: number };
export function getRinging(): Ringing | null {
  if (!Native) return null;
  const r = Native.getRinging();
  return r ? JSON.parse(r) : null;
}
export const stopRinging = () => Native?.stopRinging();
export const snoozeRinging = (m: number) => Native?.snooze(m);

export function permissionsStatus() {
  if (!Native) return { exact: true, fullScreen: true, notifications: true };
  return { exact: Native.canScheduleExact(), fullScreen: Native.canUseFullScreen(), notifications: Native.notificationsEnabled() };
}
export const openExactAlarmSettings = () => Native?.openExactAlarmSettings();
export const openFullScreenSettings = () => Native?.openFullScreenSettings();
export const openAppSettings = () => Native?.openAppSettings();
export const addRingingListener = (cb: () => void) => Native?.addListener('onRinging', cb);

export function describeDays(days: number[], names: string[], everyday: string, weekdays: string, once: string) {
  if (!days.length) return once;
  if (days.length === 7) return everyday;
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return weekdays;
  return days.slice().sort().map((d) => names[d]).join(', ');
}
export function fmtTime(h: number, m: number) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return { time: `${hh}:${m.toString().padStart(2, '0')}`, ampm };
}
