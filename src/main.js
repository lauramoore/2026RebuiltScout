import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'
import ScoutForm from './components/scout/ScoutForm.vue'
import ScoutHome from './components/scout/ScoutHome.vue'


// these are local dev only - do not use in production
const firebaseConfig = {
    apiKey: 'fake-api-key',
    authDomain: 'localhost',
    projectId: '2974-rebuilt-scout',
    storageBucket: '2974-rebuilt-scout.appspot.com',
    messagingSenderId: '1234567890',
    appId: '1:1234567890:web:abcdef123456'
}

const firebaseApp = initializeApp(firebaseConfig)
if (window.location.hostname === 'localhost') {
  import('firebase/auth').then(({ connectAuthEmulator }) => {
    connectAuthEmulator(getAuth(firebaseApp), 'http://localhost:9099');
  });
}

const routes = [
  { path: '/', component: ScoutHome },
  { path: '/scout/:match/:team', name: 'scout', component: ScoutForm },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})


const auth = getAuth(firebaseApp)
const app = createApp(App).use(router)
app.provide('$auth', auth)

app.mount('#app')
