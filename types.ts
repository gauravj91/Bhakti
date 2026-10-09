export type ImageEntry = { id: string; regions: string[]; source: number };
export type TrackEntry = { id: string; deityId: string; title: string; imageId: string | null; regions: string[]; source: number };
export type TemplateEntry = {
  id: string; category: 'morning' | 'afternoon' | 'evening' | 'devotional' | 'festival';
  festival: string | null; header: string | null; footer: string | null; regions: string[]; deityId: string | null; source: number;
};
export type GeneratedContent = {
  deities: Record<string, { images: ImageEntry[]; tracks: TrackEntry[] }>;
  temples: Record<string, { image?: number; ambient?: number }>;
  templeDefaults: { image: number; ambient: number; bell: number };
  templates: TemplateEntry[];
};
