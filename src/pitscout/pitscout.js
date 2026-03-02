import PitScoutHome from './PitScoutHome.vue';

const routes = [
  {
    path: '/pitscout',
    name: 'pitscout-home',
    component: PitScoutHome,
    meta: { requiresAuth: true, title: 'Pit Scouting' },
  },
  {
    path: '/pitscout/:team',
    name: 'pitscout-form',
    // Lazy-load the component for better performance
    component: () => import('./PitScoutView.vue'),
    meta: { requiresAuth: true, title: 'Pit Scout Form' },
  }
];

export default {
  routes: routes
};
