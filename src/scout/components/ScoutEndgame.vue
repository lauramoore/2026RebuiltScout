<template>
  <h1>Endgame</h1>
  <div>
     <h2>Climb</h2>
     <label>
       <input type="radio" value="L1" v-model="endGameClimb" /> L1
     </label>
     <label>
       <input type="radio" value="L2" v-model="endGameClimb" /> L2
     </label>
     <label>
       <input type="radio" value="L3" v-model="endGameClimb" /> L3
     </label>
     <label>
       <input type="checkbox" v-model="endGameClimbFail" /> Failed
     </label>
  </div>
  <div>
    <h2>Cycles</h2>
    <router-link :to="{ name: 'scout-endgame-scoring', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Scoring</button>
    </router-link>
    <router-link :to="{ name: 'scout-endgame-defense', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Defense</button>
    </router-link>
  </div>

  <!-- Display title from route meta -->
  <h2 v-if="$route.meta.title">{{ $route.meta.title }}</h2>

  <CycleNavigator v-if="currentCycleType" :current-index="currentIndex" :total-cycles="cycles.length" @previous="previousCycle" @next="nextCycle" @add="addCycle" new-button-text="New Cycle" />

  <!-- The router will render the matched child component here. -->
  <!-- We use v-slot to pass the correct v-model (a single cycle object) to the rendered component. -->
  <router-view v-slot="{ Component }">
    <component :is="Component" v-model="currentCycleModel" />
  </router-view>
</template>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCycleManager } from '../composables/useCycleManager.js';
import CycleNavigator from './CycleNavigator.vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);
const route = useRoute();

const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

const endGameClimb = computed({
  get: () => model.value.endGameClimb,
  set: (val) => model.value = { ...model.value, endGameClimb: val }
});

const endGameClimbFail = computed({
  get: () => model.value.endGameClimbFail,
  set: (val) => model.value = { ...model.value, endGameClimbFail: val }
});

// Determine which type of cycle is active based on the route name
const currentCycleType = computed(() => {
  const routeName = String(route.name || '');
  if (routeName.endsWith('scoring')) return 'scoring';
  if (routeName.endsWith('defense')) return 'defense';
  return null;
});

const { currentIndex, cycles, currentCycleModel, addCycle, previousCycle, nextCycle } = useCycleManager(model, currentCycleType);
</script>

<style scoped>
button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}
</style>
