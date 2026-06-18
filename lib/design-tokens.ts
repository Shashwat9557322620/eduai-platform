// ═══════════════════════════════════════════════════════════════════
// EduAI Design System — Centralized Design Tokens
// World-Class Education Platform · Premium Design Language
// ═══════════════════════════════════════════════════════════════════

// ─── Color Palette ───────────────────────────────────────────────
export const colors = {
  // Base / Background
  bg: {
    primary: '#020203',
    secondary: '#050508',
    tertiary: '#07070a',
    elevated: '#0a0a0f',
    surface: '#0d0d12',
    overlay: 'rgba(2, 2, 3, 0.85)',
    deep: '#000000',
  },

  // Brand — Cyan (Primary)
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },

  // Brand — Purple (Secondary)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Brand — Pink (Accent)
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  },

  // Brand — Indigo (Accent)
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },

  // Brand — Amber (Premium)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Semantic — Success (Emerald)
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Semantic — Warning (Amber)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Semantic — Error (Red)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Neutral — Gray
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Glass & Overlay
  glass: {
    bg: 'rgba(7, 7, 10, 0.6)',
    bgStrong: 'rgba(7, 7, 10, 0.85)',
    bgSubtle: 'rgba(255, 255, 255, 0.02)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    text: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textSubtle: 'rgba(255, 255, 255, 0.3)',
  },

  // Gradients (Reusable)
  gradient: {
    cyan: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    purple: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    pink: 'linear-gradient(135deg, #ec4899, #db2777)',
    indigo: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    amber: 'linear-gradient(135deg, #f59e0b, #d97706)',
    hero: 'linear-gradient(135deg, #06b6d4, #6366f1, #a855f7, #ec4899)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    surface: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
    glow: {
      cyan: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)',
      purple: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)',
      pink: 'radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%)',
      indigo: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
    },
  },
} as const;

// ─── Typography Scale ────────────────────────────────────────────
export const typography = {
  fontFamily: {
    sans: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
    mono: 'var(--font-mono), JetBrains Mono, Fira Code, ui-monospace, monospace',
    display: 'var(--font-inter), Inter, system-ui, sans-serif',
  },

  fontSize: {
    // Display (hero headings)
    'display-2xl': ['clamp(3rem, 6vw, 5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '900' }],
    'display-xl': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '900' }],
    'display-lg': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
    'display-md': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }],
    'display-sm': ['clamp(1.25rem, 2vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],

    // Headings
    'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
    'h2': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
    'h3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
    'h4': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
    'h5': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
    'h6': ['1rem', { lineHeight: '1.45', fontWeight: '600' }],

    // Body
    'body-xl': ['1.25rem', { lineHeight: '1.7', fontWeight: '400' }],
    'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
    'body-md': ['1rem', { lineHeight: '1.7', fontWeight: '400' }],
    'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
    'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],

    // Labels & UI
    'label-lg': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '600' }],
    'label-md': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em', fontWeight: '600' }],
    'label-sm': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.1em', fontWeight: '600' }],
    'label-xs': ['0.625rem', { lineHeight: '1.5', letterSpacing: '0.15em', fontWeight: '700' }],

    // Mono / Code
    'mono-lg': ['1rem', { lineHeight: '1.6', fontFamily: 'var(--font-mono)' }],
    'mono-md': ['0.875rem', { lineHeight: '1.6', fontFamily: 'var(--font-mono)' }],
    'mono-sm': ['0.75rem', { lineHeight: '1.5', fontFamily: 'var(--font-mono)' }],
    'mono-xs': ['0.6875rem', { lineHeight: '1.5', fontFamily: 'var(--font-mono)' }],
  },
} as const;

// ─── Spacing Scale (8px base) ───────────────────────────────────
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// ─── Border Radius ───────────────────────────────────────────────
export const borderRadius = {
  none: '0px',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  '4xl': '2rem',    // 32px
  full: '9999px',
} as const;

// ─── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  // Subtle depth
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.5)',

  // Glow effects (brand colors)
  'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.2)',
  'glow-cyan-lg': '0 0 60px rgba(34, 211, 238, 0.3)',
  'glow-purple': '0 0 30px rgba(168, 85, 247, 0.2)',
  'glow-purple-lg': '0 0 60px rgba(168, 85, 247, 0.3)',
  'glow-pink': '0 0 30px rgba(236, 72, 153, 0.2)',
  'glow-pink-lg': '0 0 60px rgba(236, 72, 153, 0.3)',
  'glow-indigo': '0 0 30px rgba(99, 102, 241, 0.2)',
  'glow-indigo-lg': '0 0 60px rgba(99, 102, 241, 0.3)',
  'glow-white': '0 0 40px rgba(255, 255, 255, 0.15)',
  'glow-white-lg': '0 0 80px rgba(255, 255, 255, 0.2)',

  // Glass inner shadow
  'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
  'glass-inset-lg': 'inset 0 1px 1px rgba(255, 255, 255, 0.08)',
} as const;

// ─── Animation Timing ────────────────────────────────────────────
export const animation = {
  // Easing curves
  ease: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'spring-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    premium: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'ultra-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'back-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Duration
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    'slower': '700ms',
    'slowest': '1000ms',
    'ultra-slow': '1500ms',
  },

  // Premium micro-interactions
  micro: {
    hover: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    focus: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    press: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    float: '6s cubic-bezier(0.4, 0, 0.6, 1)',
    pulse: '2s cubic-bezier(0.4, 0, 0.6, 1)',
    shimmer: '2s linear infinite',
    glow: '3s ease-in-out infinite',
  },
} as const;

// ─── Z-Index Scale ───────────────────────────────────────────────
export const zIndex = {
  below: '-1',
  base: '0',
  raised: '10',
  dropdown: '50',
  sticky: '100',
  'fixed': '200',
  'overlay': '300',
  modal: '400',
  popover: '500',
  toast: '600',
  tooltip: '700',
  cursor: '999',
} as const;

// ─── Breakpoints ─────────────────────────────────────────────────
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─── Component Tokens ────────────────────────────────────────────
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
      '2xl': '64px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 24px',
      xl: '0 32px',
      '2xl': '0 40px',
    },
    radius: borderRadius.xl,
    fontWeight: '700',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  card: {
    padding: {
      sm: '16px',
      md: '24px',
      lg: '32px',
      xl: '40px',
      '2xl': '48px',
    },
    radius: borderRadius['3xl'],
    border: `1px solid ${colors.glass.border}`,
    backdropFilter: 'blur(20px) saturate(180%)',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  input: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 20px',
      xl: '0 24px',
    },
    radius: borderRadius.xl,
    border: `1px solid ${colors.glass.border}`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  badge: {
    height: '24px',
    padding: '0 10px',
    radius: borderRadius.full,
    fontSize: '11px',
    fontWeight: '600',
  },
  modal: {
    radius: borderRadius['4xl'],
    backdropFilter: 'blur(20px) saturate(180%)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  tooltip: {
    radius: borderRadius.lg,
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  progress: {
    height: '6px',
    radius: borderRadius.full,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  avatar: {
    size: {
      sm: '24px',
      md: '32px',
      lg: '40px',
      xl: '48px',
      '2xl': '64px',
    },
    radius: borderRadius.full,
    border: `2px solid ${colors.glass.border}`,
  },
} as const;

// ─── Premium Interaction Tokens ──────────────────────────────────
export const interactions = {
  // Hover states
  hover: {
    scale: 1.02,
    scaleSmall: 1.05,
    scaleLarge: 1.08,
    translateY: -2,
    translateYLarge: -4,
    glowIntensity: 0.3,
    borderIntensity: 0.15,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Press states
  press: {
    scale: 0.97,
    scaleSmall: 0.95,
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Focus states
  focus: {
    ring: '0 0 0 2px rgba(34, 211, 238, 0.5)',
    ringLarge: '0 0 0 4px rgba(34, 211, 238, 0.2)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Loading states
  loading: {
    shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
    pulse: 'rgba(255,255,255,0.05)',
  },

  // 3D effects
  perspective: {
    card: '1000px',
    container: '2000px',
    tilt: '6deg',
    tiltLarge: '10deg',
  },
} as const;
