import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { auth, onAuthStateChanged } from './firebase'
import scoutModule from './scout/scout'

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
    },
    ...scoutModule.scoutRoutes
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

const app = createApp(App).use(router);
app.mount('#app')
