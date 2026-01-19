import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// these are local dev only - do not use in production
const firebaseConfig = {
    apiKey: 'fake-api-key',
    authDomain: 'localhost',
    projectId: 'defield-firebase',
    storageBucket: 'defield-firebase.appspot.com',
    messagingSenderId: '1234567890',
    appId: '1:1234567890:web:abcdef123456'
}

const firebaseApp = initializeApp(firebaseConfig)
if (window.location.hostname === 'localhost') {
  import('firebase/auth').then(({ connectAuthEmulator }) => {
    connectAuthEmulator(getAuth(firebaseApp), 'http://localhost:9099');
  });
}
const auth = getAuth(firebaseApp)
const app = createApp(App)
app.provide('$auth', auth)

app.mount('#app')
