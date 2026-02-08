<template>
  <h1>Auton</h1>
  <div>
    <button @click="previousCycle" :disabled="currentIndex === 0" type="button">Previous Cycle</button>
    <span>Cycle {{ currentIndex + 1 }} of {{ (model.scoring || []).length }}</span>
    <button @click="nextCycle" :disabled="currentIndex >= (model.scoring || []).length - 1" type="button">Next Cycle</button>
    <button @click="addCycle" type="button">New Cycle</button>
  </div>
  <ScoreCycle v-model="currentCycleModel"/>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import ScoreCycle from './ScoreCycle.vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

const currentIndex = ref(0);

watch(() => model.value.scoring, (newCycles) => {
    if (!newCycles || newCycles.length === 0) {
        model.value = { ...model.value, scoring: [{}] };
    }
    currentIndex.value = (model.value.scoring?.length || 1) - 1;
}, { immediate: true });

const currentCycleModel = computed({
  get: () => {
    return (model.value.scoring || [])[currentIndex.value] || {};
  },
  set: (value) => {
    const newCycles = [...(model.value.scoring || [])];
    newCycles[currentIndex.value] = value;
    model.value = { ...model.value, scoring: newCycles };
  }
});

function addCycle() {
  const cycles = model.value.scoring || [{}];
  const lastCycle = cycles[cycles.length - 1] || {};
  const newCycles = [...cycles, { ...lastCycle }];
  model.value = { ...model.value, scoring: newCycles };
  currentIndex.value = newCycles.length - 1;
}

function previousCycle() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function nextCycle() {
  const cycles = model.value.scoring || [];
  if (currentIndex.value < cycles.length - 1) {
    currentIndex.value++;
  }
}
</script>
