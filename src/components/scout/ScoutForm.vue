<template>
  <div>Match # {{ $route.params.match }}</div>
  <div>Team # {{ $route.params.team }}</div>
  <button>Save</button>
  <ScoutAuton />
  <ScoutTeleop />
  <ScoutEndgame />
</template>
<script setup>
import ScoutAuton from './ScoutAuton.vue';
import ScoutTeleop from './ScoutTeleop.vue';
import ScoutEndgame from './ScoutEndgame.vue';

defineProps(['match', 'team'])
</script>
export default {};
