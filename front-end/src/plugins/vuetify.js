// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
    theme: {
        defaultTheme: 'dark',
        themes: {
            dark: {
                dark: true,
                colors: {
                    primary: '#C6FF00',
                    btnCatalogo: '#1A237E',
                    btnPlaylists: '#1A237E',
                    primaryDark: 'AFB42B',
                    secondary: '#303030',
                    background: '#070707',
                }
            }
        }
    }
})
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
