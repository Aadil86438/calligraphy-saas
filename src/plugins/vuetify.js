import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

const luxuryTheme = {
  dark: false,
  colors: {
    primary: '#1A1A1A', // Deep Charcoal/Black
    secondary: '#D4AF37', // Metallic Gold
    accent: '#F5F5DC', // Elegant Beige
    error: '#E53935',
    info: '#1E88E5',
    success: '#43A047',
    warning: '#FB8C00',
    background: '#FDFBFA', // Soft Off-White
    surface: '#FFFFFF',
    'surface-variant': '#F5F5F5',
  }
}

const luxuryDark = {
  dark: true,
  colors: {
    primary: '#FFFFFF', // Off-white for readability
    secondary: '#D4AF37', // Gold remains the same
    accent: '#1A1A1A',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    background: '#0F0F0F', // Very dark background
    surface: '#1A1A1A', // Slightly lighter surface
    'surface-variant': '#2A2A2A',
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
    VCard: {
      flat: true,
      rounded: 'xl', // Softer rounded corners for premium feel
      hover: true,
      elevation: 0,
      class: 'border-thin' // Subtle border instead of heavy shadows
    },
    VBtn: {
      rounded: 'lg',
      class: 'text-none letter-spacing-normal' // Modern, non-all-caps buttons
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg'
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
