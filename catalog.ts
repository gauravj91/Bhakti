import generated from './generated';
import festivalsData from '../data/festivals.json';
import type { TemplateEntry, TrackEntry } from './types';

export type Region = { id: string; name: string };
export const REGIONS: Region[] = [
  { id: 'gujarat', name: 'Gujarat' },
  { id: 'maharashtra', name: 'Maharashtra' },
  { id: 'west-bengal', name: 'West Bengal' },
  { id: 'tamil-nadu', name: 'Tamil Nadu' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh' },
  { id: 'bihar', name: 'Bihar / Jharkhand' },
  { id: 'rajasthan', name: 'Rajasthan' },
  { id: 'punjab', name: 'Punjab' },
  { id: 'haryana', name: 'Haryana' },
  { id: 'delhi', name: 'Delhi NCR' },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh / Chhattisgarh' },
  { id: 'karnataka', name: 'Karnataka' },
  { id: 'kerala', name: 'Kerala' },
  { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
  { id: 'telangana', name: 'Telangana' },
  { id: 'odisha', name: 'Odisha' },
  { id: 'assam', name: 'Assam / North East' },
  { id: 'other', name: 'Other / Outside India' },
];

export type Deity = { id: string; name: string; short: string; color: string };
export const DEITIES: Deity[] = [
  { id: 'ganesh', name: 'Shree Ganesh', short: 'Ganesh', color: '#FF9933' },
  { id: 'ram', name: 'Shree Ram', short: 'Ram', color: '#E67E22' },
  { id: 'krishna', name: 'Shree Krishna', short: 'Krishna', color: '#3E6DB5' },
  { id: 'durga', name: 'Shri Mata Durga', short: 'Mata Rani', color: '#B71C1C' },
  { id: 'shiva', name: 'Bhagwan Shiva', short: 'Shiva', color: '#4A5D7E' },
  { id: 'hanuman', name: 'Shree Hanuman', short: 'Hanuman', color: '#E65100' },
  { id: 'lakshmi', name: 'Maa Lakshmi', short: 'Lakshmi', color: '#C2185B' },
  { id: 'saraswati', name: 'Maa Saraswati', short: 'Saraswati', color: '#B8860B' },
];
export const deityById = (id?: string | null) => DEITIES.find((d) => d.id === id);

/** Default ordering weight: which deities are most popular per region (first = most). */
const REGION_DEITIES: Record<string, string[]> = {
  gujarat: ['krishna', 'durga', 'ganesh', 'shiva', 'hanuman'],
  maharashtra: ['ganesh', 'shiva', 'krishna', 'durga', 'hanuman'],
  'west-bengal': ['durga', 'lakshmi', 'saraswati', 'shiva', 'krishna'],
  'tamil-nadu': ['shiva', 'ganesh', 'durga', 'krishna'],
  'uttar-pradesh': ['ram', 'krishna', 'shiva', 'hanuman', 'durga'],
  bihar: ['ram', 'hanuman', 'shiva', 'durga'],
  rajasthan: ['krishna', 'shiva', 'hanuman', 'durga'],
  punjab: ['durga', 'shiva', 'krishna', 'hanuman'],
  haryana: ['krishna', 'shiva', 'hanuman', 'durga'],
  delhi: ['hanuman', 'ram', 'krishna', 'shiva', 'durga'],
  'madhya-pradesh': ['shiva', 'ram', 'hanuman', 'durga'],
  karnataka: ['ganesh', 'shiva', 'krishna', 'lakshmi'],
  kerala: ['krishna', 'shiva', 'durga', 'ganesh'],
  'andhra-pradesh': ['krishna', 'shiva', 'lakshmi', 'ganesh'],
  telangana: ['ganesh', 'shiva', 'krishna', 'lakshmi'],
  odisha: ['krishna', 'durga', 'shiva', 'lakshmi'],
  assam: ['durga', 'shiva', 'krishna'],
};

/** Festivals (greetingCategory) emphasised per region. */
const REGION_FESTIVALS: Record<string, string[]> = {
  gujarat: ['navratri', 'diwali', 'makar-sankranti', 'janmashtami'],
  maharashtra: ['ganesh-chaturthi', 'diwali', 'navratri'],
  'west-bengal': ['durga-puja', 'diwali', 'navratri'],
  'uttar-pradesh': ['diwali', 'holi', 'ram-navami', 'janmashtami'],
  bihar: ['diwali', 'holi', 'chhath'],
};

export function deityOrder(region?: string | null, familyDeity?: string | null): string[] {
  const pref = [...(familyDeity ? [familyDeity] : []), ...((region && REGION_DEITIES[region]) || [])];
  const ids = DEITIES.map((d) => d.id);
  return [...new Set([...pref, ...ids])].filter((id) => ids.includes(id));
}
export function orderedDeities(region?: string | null, familyDeity?: string | null): Deity[] {
  return deityOrder(region, familyDeity).map((id) => deityById(id)!).filter(Boolean);
}

// ---------- Tracks & images ----------
export type Track = TrackEntry;
export function tracksFor(deityId: string): Track[] { return generated.deities[deityId]?.tracks ?? []; }
export function allTracks(region?: string | null, familyDeity?: string | null): Track[] {
  return deityOrder(region, familyDeity).flatMap((d) => {
    const t = tracksFor(d);
    return region ? [...t.filter((x) => x.regions.includes(region)), ...t.filter((x) => !x.regions.includes(region))] : t;
  });
}
export function trackById(id?: string | null): Track | undefined {
  if (!id) return undefined;
  for (const d of Object.values(generated.deities)) { const t = d.tracks.find((x) => x.id === id); if (t) return t; }
}
export function deityImage(deityId?: string | null, imageId?: string | null, region?: string | null): number | undefined {
  if (!deityId) return undefined;
  const imgs = generated.deities[deityId]?.images ?? [];
  const byId = imgs.find((i) => i.id === imageId);
  if (byId) return byId.source;
  const regional = region ? imgs.find((i) => i.regions.includes(region)) : undefined;
  return (regional || imgs[0])?.source;
}
export function imageForTrack(t?: Track, region?: string | null) { return t ? deityImage(t.deityId, t.imageId, region) : undefined; }

// ---------- Temple ----------
export function templeAssets(deityId: string) {
  const o = generated.temples[deityId] || {};
  return {
    image: o.image ?? deityImage(deityId) ?? generated.templeDefaults.image,
    ambient: o.ambient ?? tracksFor(deityId)[0]?.source ?? generated.templeDefaults.ambient,
    bell: generated.templeDefaults.bell,
    backdrop: generated.templeDefaults.image,
  };
}

// ---------- Templates ----------
export type Template = TemplateEntry;
export type StudioCategory = 'morning' | 'afternoon' | 'evening' | 'devotional' | 'festival';
export function templatesFor(cat: StudioCategory, region?: string | null, familyDeity?: string | null): Template[] {
  let list = generated.templates.filter((t) => t.category === cat);
  if (cat === 'devotional') {
    const order = deityOrder(region, familyDeity);
    const deityTpls: Template[] = order.flatMap((d) =>
      (generated.deities[d]?.images ?? []).map((img) => ({
        id: `deity-${img.id}`, category: 'devotional' as const, festival: null, header: null, footer: null,
        regions: img.regions, deityId: d, source: img.source,
      })));
    list = [...deityTpls, ...list];
  }
  if (cat === 'festival') {
    const fav = (region && REGION_FESTIVALS[region]) || [];
    const rank = (t: Template) => { const i = fav.indexOf(t.festival || ''); return i === -1 ? 99 : i; };
    list = [...list].sort((a, b) => rank(a) - rank(b));
  }
  if (region) list = [...list.filter((t) => t.regions.includes(region)), ...list.filter((t) => !t.regions.includes(region))];
  return list;
}
export function templatesForFestival(slug: string): Template[] {
  const exact = generated.templates.filter((t) => t.festival === slug);
  return exact.length ? exact : generated.templates.filter((t) => t.festival === 'general');
}
export function templateById(id: string, region?: string | null): Template | undefined {
  const all: Template[] = [...generated.templates, ...templatesFor('devotional', region)];
  return all.find((t) => t.id === id);
}
export function festivalLabel(slug: string | null) {
  if (!slug) return '';
  return slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// ---------- Festivals ----------
export type Festival = {
  id: string; name: string; date: string; endDate?: string; type: 'festival' | 'vrat' | 'auspicious';
  deity: string | null; regions: string[]; major: boolean; description: string; greetingCategory: string;
};
export const FESTIVALS: Festival[] = (festivalsData as Festival[]).slice().sort((a, b) => a.date.localeCompare(b.date));
export function isRegional(f: Festival, region?: string | null) {
  return !!region && f.regions.includes(region);
}
/** Prominence score used for ordering/highlighting (never filtering). */
export function prominence(f: Festival, region?: string | null) {
  let s = 0;
  if (f.major) s += 2;
  if (isRegional(f, region)) s += 3;
  if (region && (REGION_FESTIVALS[region] || []).includes(f.greetingCategory)) s += 2;
  if (f.type === 'festival') s += 1;
  return s;
}
