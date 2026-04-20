import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { auth, onAuthStateChanged } from './firebase'
import scoutModule from './scout/scout'
import gamesModule from './games/games'

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
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./views/SettingsView.vue'),
    },
    {
      path: '/summary/match/:event/:match',
      name: 'match-summary',
      component: () => import('./summary/MatchSummary.vue'),
    },
    ...scoutModule.scoutRoutes, 
    ...gamesModule.routes
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
// The Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!auth.currentUser;

  // All routes except 'login' require authentication
  if (to.name !== 'login' && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    // Don't let logged-in users go back to login page
    next({ name: 'home' });
  } else {
    next();
  }
});

let app;

// Central authentication state change listener
onAuthStateChanged(auth, (user) => {
  // This callback is executed when the auth state changes, and also once on initial load.

  // Mount the app only after the initial auth state is determined.
  if (!app) {
    app = createApp(App).use(router);
    app.mount('#app');
  }

  // If the user is unauthenticated and they are not on the login page,
  // redirect them to the login page. This handles the case where a user
  // signs out from another tab or their session expires.
  if (!user && router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' });
  }
});
