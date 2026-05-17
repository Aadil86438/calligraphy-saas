import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// PREMIUM DESIGN SYSTEM (Stripe / Linear / Apple Inspired)
const luxuryTheme = {
  dark: false,
  colors: {
    primary: '#09090b', // Zinc 950 - Extremely deep, rich black
    secondary: '#D4AF37', // Signature Gold
    accent: '#f4f4f5', // Zinc 100
    error: '#ef4444', // Red 500
    info: '#3b82f6', // Blue 500
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    background: '#fafafa', // Zinc 50 - Soft premium background
    surface: '#ffffff', // Pure white
    'surface-variant': '#f4f4f5', // Zinc 100 - Secondary surface
    'surface-light': '#f8fafc', // Slate 50
    'border-color': '#e4e4e7', // Zinc 200
  },
  variables: {
    'border-opacity': 1,
    'high-emphasis-opacity': 0.95,
    'medium-emphasis-opacity': 0.70,
    'disabled-opacity': 0.40,
    'idle-opacity': 0.04,
    'hover-opacity': 0.04,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#09090b',
    'theme-on-kbd': '#ffffff',
    'theme-code': '#f4f4f5',
    'theme-on-code': '#09090b',
  }
}

const luxuryDark = {
  dark: true,
  colors: {
    primary: '#ffffff',
    secondary: '#D4AF37',
    accent: '#27272a', // Zinc 800
    error: '#f87171',
    info: '#60a5fa',
    success: '#34d399',
    warning: '#fbbf24',
    background: '#09090b', // Zinc 950
    surface: '#18181b', // Zinc 900
    'surface-variant': '#27272a', // Zinc 800
    'surface-light': '#1f2937', // Gray 800
    'border-color': '#3f3f46', // Zinc 700
  },
  variables: {
    'border-opacity': 1,
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'luxuryTheme',
    themes: {
      luxuryTheme,
      luxuryDark
    }
  },
  defaults: {
    // Global Component Architecture Rules
    global: {
      ripple: false, // Turn off default Android material ripples for a cleaner SaaS feel
    },
    VCard: {
      flat: true,
      elevation: 0,
      rounded: 'xl', // Nested border radius (xl outer, lg inner)
      class: 'ds-surface-card'
    },
    VBtn: {
      rounded: 'lg',
      class: 'text-none ds-btn font-weight-medium tracking-normal',
      elevation: 0
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      color: 'primary',
      hideDetails: 'auto',
      class: 'ds-input'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      color: 'primary',
      hideDetails: 'auto',
      class: 'ds-input'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      color: 'primary',
      hideDetails: 'auto',
      class: 'ds-input'
    },
    VDialog: {
      class: 'ds-dialog',
      transition: 'dialog-bottom-transition'
    },
    VTable: {
      class: 'ds-table'
    },
    VChip: {
      class: 'font-weight-medium tracking-normal text-none'
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
