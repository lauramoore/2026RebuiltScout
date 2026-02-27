<template>
  <h1>Teleop</h1>
  <div>
    <router-link :to="{ name: 'scout-teleop-passing', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Passing/Stockpiling</button>
    </router-link>
    <router-link :to="{ name: 'scout-teleop-scoring', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Scoring</button>
    </router-link>
    <router-link :to="{ name: 'scout-teleop-defense', params: $route.params }" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Defense</button>
    </router-link>
  </div>

  <CycleNavigator v-if="currentCycleType" :current-index="currentIndex" :total-cycles="cycles.length" @previous="previousCycle" @next="nextCycle" @add="addCycle" new-button-text="New Cycle" />

  <!-- The router will render the matched child component here. -->
  <!-- We use v-slot to pass the correct v-model (a single cycle object) to the rendered component. -->
  <router-view v-slot="{ Component }">
    <component :is="Component" v-model="currentCycleModel" />
  </router-view>
  <EndgameClimb v-model="climb" />
</template>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCycleManager } from '../composables/useCycleManager.js';
import CycleNavigator from './CycleNavigator.vue';
import EndgameClimb from './EndgameClimb.vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);
const route = useRoute();
const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

// This computed property will be the v-model for the EndgameClimb component.
const climb = computed({
  get: () => model.value.climb || {},
  set: (climbValue) => {
    model.value = { ...model.value, climb: climbValue };
  }
});

// Determine which type of cycle is active based on the route name
const currentCycleType = computed(() => {
  const routeName = String(route.name || '');
  if (routeName.endsWith('passing')) return 'passing';
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
