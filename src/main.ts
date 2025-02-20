import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import { createI18n } from 'vue-i18n'

// Load messages from JSON files
import en from './locales/en.json'
import de from './locales/de.json'

// Define your messages for different locales
const messages = {
  en: en,
  de: de
}

const i18n = createI18n({
  legacy: false, // Enable Composition API mode
  locale: 'de', 
  fallbackLocale: 'de',
  messages, 
})

createApp(App)
  .use(router)
  .use(i18n) // Use the i18n instance
  .mount('#app')
