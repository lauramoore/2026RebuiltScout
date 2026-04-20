
const routes = [
   { path: '/games',
    name: 'games-dashboard',
    component: () => import('./views/GamesDashboard.vue'),
    meta: { requiresAuth: true }
   }

];
export default {
  routes: routes
}

