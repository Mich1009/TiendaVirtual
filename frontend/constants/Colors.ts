// Colores inspirados en Falabella
export const FalabellaColors = {
  primary: '#00A650', // Verde Falabella
  secondary: '#FFB800', // Amarillo/Dorado
  background: '#FFFFFF',
  backgroundGray: '#F5F5F5',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  border: '#E0E0E0',
  error: '#E53935',
  success: '#00A650',
  warning: '#FFB800',
  black: '#000000',
  white: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
}

export const Colors = {
  light: {
    text: FalabellaColors.text,
    background: FalabellaColors.background,
    tint: FalabellaColors.primary,
    icon: FalabellaColors.textLight,
    tabIconDefault: FalabellaColors.textMuted,
    tabIconSelected: FalabellaColors.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: FalabellaColors.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: FalabellaColors.primary,
  },
}
