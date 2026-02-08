import ScoutForm from './ScoutView.vue';
import ScoutHome from './ScoutHome.vue';

const routes = [
  {
    path: '/scout/:match/:team',
    name: 'scout-form',
    component: () => ScoutForm,
    meta: { requiresAuth: true },
    // Redirect to the auton section by default when entering a scout form
    redirect: to => {
      // Using a named route is more robust than constructing the path manually.
      return { name: 'scout-auton', params: to.params };
    },
    children: [
      { path: 'auton', // relative path -> /scout/:match/:team/auton
        name: 'scout-auton',
        component: () => import('./components/ScoutAuton.vue') ,
        children: [
        {
            path: 'scoring', // -> /scout/:match/:team/auton/scoring
            name: 'scout-auton-scoring',
            component: () => import('./components/ScoreCycle.vue'),
            meta: { title: 'Scoring' }
          }
        ]
      },
      {
        path: 'teleop', // relative path -> /scout/:match/:team/teleop
        name: 'scout-teleop',
        component: () => import('./components/ScoutTeleop.vue')
      },
      {
        path: 'endgame',
        name: 'scout-endgame',
        component: () => import('./components/ScoutEndgame.vue')
      },
      {
        path: "observations", // relative path -> /scout/:match/:team/observations
        name: 'scout-observations',
        component: () => import('./components/ScoutObservations.vue'),
        meta: { title: 'Observations' }
      }

    ]
  }
];

export default {
  scoutRoutes: routes,
  ScoutHome: ScoutHome,
  ScoutForm: ScoutForm
}
