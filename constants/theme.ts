export const colors = {
  background: '#FBF4EC',
  surface: '#FFFFFF',
  surfaceMuted: '#F3E6D8',
  text: '#2B2420',
  textMuted: '#7A6F65',
  ember: '#D97748',
  emberDark: '#B85C33',
  emberGlow: '#F4A261',
  border: '#E9DBCB',
  success: '#5B8C5A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '500' as const, color: colors.textMuted },
};

export const FREE_RITUAL_LIMIT = 3;

export const RITUAL_COLORS = [
  '#D97748',
  '#5B8C5A',
  '#4A7A96',
  '#B8874C',
  '#8C5B7E',
  '#6B7A4A',
];

export type RitualIconName =
  | 'flame-outline'
  | 'sunny-outline'
  | 'moon-outline'
  | 'water-outline'
  | 'body-outline'
  | 'book-outline'
  | 'walk-outline'
  | 'create-outline'
  | 'nutrition-outline'
  | 'sparkles-outline'
  | 'flag-outline'
  | 'leaf-outline';

export const RITUAL_ICONS: RitualIconName[] = [
  'flame-outline',
  'sunny-outline',
  'moon-outline',
  'water-outline',
  'body-outline',
  'book-outline',
  'walk-outline',
  'create-outline',
  'nutrition-outline',
  'sparkles-outline',
  'flag-outline',
  'leaf-outline',
];
