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
      return { path: `/scout/${to.params.match}/${to.params.team}/auton` };
    },
    children: [
      { path: 'auton',
        component: () => import('./components/ScoutAuton.vue') ,
          redirect: to => {
          // `to.params` will have `match` and `team` from the parent route
          return { path: `/scout/${to.params.match}/${to.params.team}/auton/scoring` };
        },
        children: [
        {
            path: 'scoring', // -> /scout/:match/:team/teleop/scoring
            component: () => import('./components/ScoreCycle.vue'),
            meta: { title: 'Scoring' }
          }
        ]
      },
      {
        path: 'teleop', // relative path -> /scout/:match/:team/teleop
        component: () => import('./components/ScoutTeleop.vue'),
        // Redirect to a default child route for teleop
        redirect: to => {
          // `to.params` will have `match` and `team` from the parent route
          return { path: `/scout/${to.params.match}/${to.params.team}/teleop/scoring` };
        },
        children: [
          {
            path: 'passing', // -> /scout/:match/:team/teleop/passing
            component: () => import('./components/PassingCycle.vue'),
            meta: { title: 'Passing/Stockpiling' }
          },
          {
            path: 'scoring', // -> /scout/:match/:team/teleop/scoring
            component: () => import('./components/ScoreCycle.vue'),
            meta: { title: 'Scoring' }
          },
          {
            path: 'defense', // -> /scout/:match/:team/teleop/defense
            component: () => import('./components/DefenseCycle.vue'),
            meta: { title: 'Defense' }
          }
        ]
      },
      {
        path: 'endgame',
        component: () => import('./components/ScoutEndgame.vue'),
        // Redirect to a default child route for endgame
        redirect: to => {
          return { path: `/scout/${to.params.match}/${to.params.team}/endgame/scoring` };
        },
         children: [
          {
            path: 'passing', // -> /scout/:match/:team/endgame/passing
            component: () => import('./components/PassingCycle.vue'),
            meta: { title: 'Passing/Stockpiling' }
          },
          {
            path: 'scoring', // -> /scout/:match/:team/endgame/scoring
            component: () => import('./components/ScoreCycle.vue'),
            meta: { title: 'Scoring' }
          },
          {
            path: 'defense', // -> /scout/:match/:team/endgame/defense
            component: () => import('./components/DefenseCycle.vue'),
            meta: { title: 'Defense' }
          }
        ]
      },
      {
        path: "observations",
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
