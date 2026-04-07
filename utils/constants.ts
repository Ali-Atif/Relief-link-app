/** Design tokens: high-contrast, emergency-friendly, modern UI. */
export const colors = {
  background: '#f1f5f9',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#ccfbf1',
  primaryBorder: '#99f6e4',
  text: '#0f172a',
  textMuted: '#475569',
  border: '#cbd5e1',
  /** SOS / critical */
  emergency: '#dc2626',
  emergencyDark: '#b91c1c',
  emergencyRing: '#fecaca',
  onEmergency: '#ffffff',
  /** Navigation chrome */
  headerBg: '#0f172a',
  headerText: '#ffffff',
  /** Status strip (banner) */
  onlineBg: '#042f2e',
  onlineText: '#ecfdf5',
  offlineBg: '#7c2d12',
  offlineText: '#ffedd5',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

/** Minimum touch target & primary actions */
export const layout = {
  buttonMinHeight: 56,
  sosMinHeight: 156,
  iconTileMinHeight: 68,
} as const;
