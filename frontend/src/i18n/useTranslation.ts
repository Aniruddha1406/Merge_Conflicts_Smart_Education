import { useLanguage } from './LanguageContext';
import { primaryFallback, defaultLocale } from './config';
import en from './locales/en';
import hi from './locales/hi';
import sat from './locales/sat';
import ho from './locales/ho';
import mun from './locales/mun';
import kru from './locales/kru';
import nag from './locales/nag';
import kha from './locales/kha';
import pan from './locales/pan';

const dictionaries: Record<string, any> = {
  en, hi, sat, ho, mun, kru, nag, kha, pan
};

export function useTranslation() {
  const { locale } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    
    const getVal = (obj: any, path: string[]) => {
      let current = obj;
      for (const k of path) {
        if (current === undefined || current === null) return undefined;
        current = current[k];
      }
      return typeof current === 'string' ? current : undefined;
    };

    let val = getVal(dictionaries[locale], keys);
    if (val !== undefined) return val;

    if (locale !== primaryFallback) {
      val = getVal(dictionaries[primaryFallback], keys);
      if (val !== undefined) return val;
    }

    val = getVal(dictionaries[defaultLocale], keys);
    if (val !== undefined) return val;

    return key;
  };

  return { t, locale };
}
