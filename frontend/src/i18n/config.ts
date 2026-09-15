export type Locale = 'en' | 'hi' | 'sat' | 'ho' | 'mun' | 'kru' | 'nag' | 'kha' | 'pan';

export const locales: { code: Locale; name: string; localName: string }[] = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'sat', name: 'Santali', localName: 'ᱚᱞ ᱪᱤᱠᱤ' },
  { code: 'ho', name: 'Ho', localName: 'Ho' },
  { code: 'mun', name: 'Mundari', localName: 'मुंडारी' },
  { code: 'kru', name: 'Kurukh', localName: 'कुड़ुख' },
  { code: 'nag', name: 'Nagpuri', localName: 'नागपुरी' },
  { code: 'kha', name: 'Khortha', localName: 'खोरठा' },
  { code: 'pan', name: 'Panchpargania', localName: 'पंचपरगनिया' }
];

export const defaultLocale: Locale = 'en';
export const primaryFallback: Locale = 'hi';
