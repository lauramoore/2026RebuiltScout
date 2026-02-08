import ScoutHome from './ScoutHome.vue';

const routes = [
  {
    path: '/scout/:match/:team',
    name: 'scout-form',
    component: () => import('./ScoutView.vue'),
    meta: { requiresAuth: true },
    // Redirect to the auton section by default when entering a scout form
    redirect: to => {
      // Using a named route is more robust than constructing the path manually.
      return { name: 'scout-auton', params: to.params };
    },
    children: [
      { path: 'auton', // relative path -> /scout/:match/:team/auton
        name: 'scout-auton',
        component: () => import('./components/ScoutAuton.vue')
      },
      {
        path: 'teleop', // relative path -> /scout/:match/:team/teleop
        name: 'scout-teleop',
        component: () => import('./components/ScoutTeleop.vue'),
         children: [
        {
            path: 'scoring', // -> /scout/:match/:team/teleop/scoring
            name: 'scout-telop-scoring',
            component: () => import('./components/ScoreCycle.vue'),
            meta: { title: 'Scoring' }
        },
         {
            path: 'passing', // -> /scout/:match/:team/teleop/defense
            name: 'scout-teleop-passing',
            component: () => import('./components/PassingCycle.vue'),
            meta: { title: 'Passing' }
        },
         {
            path: 'defense', // -> /scout/:match/:team/teleop/defense
            name: 'scout-teleop-defense',
            component: () => import('./components/DefenseCycle.vue'),
            meta: { title: 'Defense' }
        },

         ]
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
  ScoutHome: ScoutHome
}
