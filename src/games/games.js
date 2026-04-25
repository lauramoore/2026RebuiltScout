
const routes = [
   { path: '/games',
    name: 'games-home',
    component: () => import('./views/GamesDashboard.vue'),
    meta: { requiresAuth: true }
   },
   {
    path: '/games/captains/:event',
    name: 'games-captains',
    component: () => import('./views/AllianceCaptains.vue'),
    meta: { requiresAuth: true}
   }

];
export default {
  routes: routes
}
