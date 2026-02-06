import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { auth, onAuthStateChanged } from './firebase'

const routes = [
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/LoginView.vue')
    },
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue'),
      meta: { requiresAuth: true } // Mark this as protected
    }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// The Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Helper to wait for Firebase to initialize
  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  };

  const isAuthenticated = await getCurrentUser();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' }); // Don't let logged-in users go back to login page
  } else {
    next();
  }
});

const firebaseApi = {
  refreshSchedule: async () => {
    const response = await fetch('/api/getEventSchedule');
    if (!response.ok) {
      // Handle API errors more gracefully if needed
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    // httpsCallable automatically unwraps a 'data' property.
    // With fetch, you get the raw body, so you parse it as JSON.
    return response.status
  }
}

const app = createApp(App).use(router);
app.provide('$auth', auth)
app.provide('$api', firebaseApi)
app.mount('#app')
