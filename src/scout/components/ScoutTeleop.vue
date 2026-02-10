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

  <!-- Display title from route meta -->
  <h2 v-if="$route.meta.title">{{ $route.meta.title }}</h2>

  <div v-if="currentCycleType">
    <button @click="previousCycle" :disabled="currentIndex === 0" type="button">Previous Cycle</button>
    <span>Cycle {{ currentIndex + 1 }} of {{ (model[currentCycleType] || []).length }}</span>
    <button @click="nextCycle" :disabled="currentIndex >= (model[currentCycleType] || []).length - 1" type="button">Next Cycle</button>
    <button @click="addCycle" type="button">New Cycle</button>
  </div>

  <!-- The router will render the matched child component here. -->
  <!-- We use v-slot to pass the correct v-model (a single cycle object) to the rendered component. -->
  <router-view v-slot="{ Component }">
    <component :is="Component" v-model="currentCycleModel" />
  </router-view>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);
const route = useRoute();

const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

// Determine which type of cycle is active based on the route name
const currentCycleType = computed(() => {
  const routeName = String(route.name || '');
  if (routeName.endsWith('passing')) return 'passing';
  if (routeName.endsWith('scoring')) return 'scoring';
  if (routeName.endsWith('defense')) return 'defense';
  return null;
});

const currentIndex = ref(0);

// When the cycle type changes (e.g., user clicks "Scoring"), update the logic
watch(currentCycleType, (newType) => {
  if (newType) {
    const cycles = model.value[newType] || [];
    if (cycles.length === 0) {
      // Initialize with one empty cycle if none exist
      model.value[newType] = [{}];
    }
    // Go to the last cycle for this type
    currentIndex.value = (model.value[newType]?.length || 1) - 1;
  }
}, { immediate: true });

const currentCycleModel = computed({
  get: () => {
    if (!currentCycleType.value) return {};
    const cycles = model.value[currentCycleType.value] || [];
    return cycles[currentIndex.value] || {};
  },
  set: (value) => {
    if (!currentCycleType.value) return;
    const newCycles = [...(model.value[currentCycleType.value] || [])];
    newCycles[currentIndex.value] = value;
    model.value[currentCycleType.value] = newCycles;
  }
});

function addCycle() {
  const cycles = model.value[currentCycleType.value] || [];
  model.value[currentCycleType.value] = [...cycles, {}];
  currentIndex.value = cycles.length;
}

function previousCycle() {
  if (currentIndex.value > 0) currentIndex.value--;
}

function nextCycle() {
  const cycles = model.value[currentCycleType.value] || [];
  if (currentIndex.value < cycles.length - 1) currentIndex.value++;
}
</script>

<style scoped>
button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}
</style>
