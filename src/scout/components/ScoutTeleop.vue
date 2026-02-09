<template>
  <h1>Teleop</h1>
  <div>
      <router-link :to="`/scout/${$route.params.match}/${$route.params.team}/teleop/scoring`" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Scoring</button>
    </router-link>

    <router-link :to="`/scout/${$route.params.match}/${$route.params.team}/teleop/passing`" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Passing/Stockpiling</button>
    </router-link>

    <router-link :to="`/scout/${$route.params.match}/${$route.params.team}/teleop/defense`" custom v-slot="{ navigate, isActive }">
      <button :class="{ active: isActive }" @click="navigate">Defense</button>
    </router-link>
  </div>

  <!-- Display title from route meta -->
  <h2 v-if="$route.meta.title">{{ $route.meta.title }}</h2>

  <div v-if="cycleType">
    <button @click="previousCycle" :disabled="currentIndex === 0" type="button">Previous Cycle</button>
    <span>Cycle {{ currentIndex + 1 }} of {{ (model[cycleType] || []).length }}</span>
    <button @click="nextCycle" :disabled="currentIndex >= (model[cycleType] || []).length - 1" type="button">Next Cycle</button>
    <button @click="addCycle" type="button">New Cycle</button>
  </div>

  <!-- The router will render the matched child component here. -->
  <!-- v-model on router-view passes the model down to the route component. -->
  <router-view v-model="currentCycleModel"></router-view>
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

const cycleType = computed(() => {
    const pathParts = route.path.split('/');
    const type = pathParts[pathParts.length - 1];
    if (['passing', 'scoring', 'defense'].includes(type)) {
        return type;
    }
    return null;
});

const currentIndex = ref(0);

watch(cycleType, (newType) => {
    if (!newType) return;

    const cycles = model.value[newType] || [];
    if (cycles.length === 0) {
        const newCycles = [{}];
        model.value[newType] = newCycles;
        currentIndex.value = 0;
    } else {
        currentIndex.value = cycles.length - 1;
    }
}, { immediate: true });


const currentCycleModel = computed({
  get: () => {
    if (!cycleType.value) return {};
    const cycles = model.value[cycleType.value] || [];
    return cycles[currentIndex.value] || {};
  },
  set: (value) => {
    if (!cycleType.value) return;
    const cycles = model.value[cycleType.value] || [];
    const newCycles = [...cycles];
    newCycles[currentIndex.value] = value;
    model.value[cycleType.value] = newCycles;
  }
});

function addCycle() {
  if (!cycleType.value) return;
  const cycles = model.value[cycleType.value] || [];
  const newCycles = [...cycles, {}];
  model.value[cycleType.value] = newCycles;
  currentIndex.value = newCycles.length - 1;
}

function previousCycle() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function nextCycle() {
  if (!cycleType.value) return;
  const cycles = model.value[cycleType.value] || [];
  if (currentIndex.value < cycles.length - 1) {
    currentIndex.value++;
  }
}
</script>

<style scoped>
button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}
</style>
