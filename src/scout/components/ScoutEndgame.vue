<template>
  <h1>EndGame</h1>
  <div>
    <h2>Climb</h2>
    <div>
    <label>
      <input type="radio" value="1" v-model="climb" />L1
    </label>
    <label>
      <input type="radio" value="2" v-model="climb" />L2
    </label>
    <label>
      <input type="radio" value="3" v-model="climb" />L3
    </label>
     <label>
      <input type="checkbox" v-model="climbAborted" />Not Successful
    </label>
    </div>
  </div>
  <h2>Additional Fuel</h2>
    <h3>Scoring</h3>
    <div>
        <button @click="previousScoringCycle" :disabled="scoringCurrentIndex === 0" type="button">Previous Cycle</button>
        <span>Cycle {{ scoringCurrentIndex + 1 }} of {{ (model.scoring || []).length }}</span>
        <button @click="nextScoringCycle" :disabled="scoringCurrentIndex >= (model.scoring || []).length - 1" type="button">Next Cycle</button>
        <button @click="addScoringCycle" type="button">New Cycle</button>
    </div>
    <Scoring v-model="currentScoringCycle" />
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import Scoring from './ScoreCycle.vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

const climb = computed({
  get: () => model.value.climb,
  set: (value) => { model.value.climb = value; }
});

const climbAborted = computed({
  get: () => model.value.climbAborted,
  set: (value) => { model.value.climbAborted = value; }
});

// --- Scoring Cycles ---
const scoringCurrentIndex = ref(0);

watch(() => model.value.scoring, (newCycles) => {
    if (!newCycles || newCycles.length === 0) {
        model.value.scoring = [{}];
    }
    scoringCurrentIndex.value = (model.value.scoring?.length || 1) - 1;
}, { immediate: true });

const currentScoringCycle = computed({
  get: () => (model.value.scoring || [])[scoringCurrentIndex.value] || {},
  set: (value) => {
    const newCycles = [...(model.value.scoring || [])];
    newCycles[scoringCurrentIndex.value] = value;
    model.value.scoring = newCycles;
  }
});

function addScoringCycle() {
  const cycles = model.value.scoring || [];
  const newCycles = [...cycles, {}];
  model.value.scoring = newCycles;
  scoringCurrentIndex.value = newCycles.length - 1;
}

function previousScoringCycle() {
  if (scoringCurrentIndex.value > 0) {
    scoringCurrentIndex.value--;
  }
}

function nextScoringCycle() {
  const cycles = model.value.scoring || [];
  if (scoringCurrentIndex.value < cycles.length - 1) {
    scoringCurrentIndex.value++;
  }
}


</script>
