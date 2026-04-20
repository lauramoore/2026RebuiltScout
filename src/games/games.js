
const routes = [
   { path: '/games',
    name: 'games-home',
    component: () => import('./views/GamesDashboard.vue'),
    meta: { requiresAuth: true }
   }

];
export default {
  routes: routes
}

