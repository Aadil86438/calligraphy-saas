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
    error: '#E53935', // Modern Red
    info: '#1E88E5',
    success: '#43A047',
    warning: '#FB8C00',
    background: '#FDFBFA', // Soft Off-White
    surface: '#FFFFFF',
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'luxuryTheme',
    themes: {
      luxuryTheme
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
