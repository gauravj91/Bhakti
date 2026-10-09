import en, { Strings } from './en';

const dictionaries: Record<string, Strings> = { en };
let current: Strings = en;

export function setLanguage(lang: string) { current = dictionaries[lang] || en; }
export function s(): Strings { return current; }
/** Replace {key} tokens. */
export function fmt(str: string, vars: Record<string, string | number> = {}) {
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}
