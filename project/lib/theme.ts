export const Colors = {
  primary: '#E11D48',
  primaryLight: '#FB7185',
  primaryDark: '#9F1239',
  secondary: '#0F172A',
  accent: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  background: '#0A0A0F',
  surface: '#16161F',
  surfaceLight: '#1E1E2A',
  border: '#2A2A38',
  text: '#F5F5F5',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  heading: 'Poppins-Bold',
  headingSemi: 'Poppins-SemiBold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemi: 'Inter-SemiBold',
};

export const CategoryColors = [
  '#E11D48', '#F43F5E', '#EC4899', '#D946EF',
  '#8B5CF6', '#6366F1', '#3B82F6', '#0EA5E9',
  '#06B6D4', '#14B8A6', '#10B981', '#22C55E',
  '#84CC16', '#EAB308', '#F59E0B', '#F97316',
];

export const CategoryEmojis = [
  // Food & Drink
  '🍽️', '🍕', '🍔', '🍟', '🥘', '🍜', '🍣', '🍱',
  '🌮', '🥗', '🍝', '🥐', '🧀', '🍳', '🧇', '🥞',
  '🍰', '🧁', '🍩', '🍦', '🍪', '🍫', '🍬', '🍭',
  '☕', '🍵', '🍷', '🍹', '🍺', '🥂', '🧋', '🥤',
  // Entertainment
  '🎬', '📺', '🎵', '🎶', '🎤', '🎧', '🎮', '🕹️',
  '🎲', '🎨', '🎭', '🎪', '🎸', '🎹', '🥁',
  // Travel & Places
  '✈️', '🏖️', '🏔️', '🏕️', '🌅', '🌆', '🌃', '🌍',
  '🏨', '🏰', '🗽', '🎡', '🎢', '🚂', '🚗', '🗺️',
  // Nature & Animals
  '🌸', '🌷', '🌹', '🌻', '🌼', '🌿', '🍃', '🌱',
  '🐾', '🐶', '🐱', '🐰', '🦊', '🐻', '🦋', '🐝',
  // Lifestyle & Misc
  '📚', '✏️', '📔', '📓', '🛍️', '💄', '💅', '👗',
  '⭐', '🌟', '✨', '💫', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💝', '🎁', '🎀',
  '🔥', '🌈', '☀️', '🌙', '⚡', '💎', '👑', '🏆',
];

export const EmojiGroups: { label: string; emojis: string[] }[] = [
  {
    label: 'Comida e Bebida',
    emojis: CategoryEmojis.slice(0, 32),
  },
  {
    label: 'Entretenimento',
    emojis: CategoryEmojis.slice(32, 47),
  },
  {
    label: 'Viagens e Lugares',
    emojis: CategoryEmojis.slice(47, 63),
  },
  {
    label: 'Natureza e Animais',
    emojis: CategoryEmojis.slice(63, 79),
  },
  {
    label: 'Estilo de Vida',
    emojis: CategoryEmojis.slice(79),
  },
];
