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
   <h3>Passing</h3>
    <div>
        <button @click="previousPassingCycle" :disabled="passingCurrentIndex === 0" type="button">Previous Cycle</button>
        <span>Cycle {{ passingCurrentIndex + 1 }} of {{ (model.passing || []).length }}</span>
        <button @click="nextPassingCycle" :disabled="passingCurrentIndex >= (model.passing || []).length - 1" type="button">Next Cycle</button>
        <button @click="addPassingCycle" type="button">New Cycle</button>
    </div>
    <Passing v-model="currentPassingCycle"/>

    <h3>Scoring</h3>
    <div>
        <button @click="previousScoringCycle" :disabled="scoringCurrentIndex === 0" type="button">Previous Cycle</button>
        <span>Cycle {{ scoringCurrentIndex + 1 }} of {{ (model.scoring || []).length }}</span>
        <button @click="nextScoringCycle" :disabled="scoringCurrentIndex >= (model.scoring || []).length - 1" type="button">Next Cycle</button>
        <button @click="addScoringCycle" type="button">New Cycle</button>
    </div>
    <Scoring v-model="currentScoringCycle" />

    <h3>Defense</h3>
    <div>
        <button @click="previousDefenseCycle" :disabled="defenseCurrentIndex === 0" type="button">Previous Cycle</button>
        <span>Cycle {{ defenseCurrentIndex + 1 }} of {{ (model.defense || []).length }}</span>
        <button @click="nextDefenseCycle" :disabled="defenseCurrentIndex >= (model.defense || []).length - 1" type="button">Next Cycle</button>
        <button @click="addDefenseCycle" type="button">New Cycle</button>
    </div>
    <Defense v-model="currentDefenseCycle" />
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import Passing from './PassingCycle.vue';
import Scoring from './ScoreCycle.vue';
import Defense from './DefenseCycle.vue';

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
  set: (value) => { model.value = { ...model.value, climb: value }; }
});

const climbAborted = computed({
  get: () => model.value.climbAborted,
  set: (value) => { model.value = { ...model.value, climbAborted: value }; }
});

// --- Passing Cycles ---
const passingCurrentIndex = ref(0);

watch(() => model.value.passing, (newCycles) => {
    if (!newCycles || newCycles.length === 0) {
        model.value = { ...model.value, passing: [{}] };
    }
    passingCurrentIndex.value = (model.value.passing?.length || 1) - 1;
}, { immediate: true });

const currentPassingCycle = computed({
  get: () => (model.value.passing || [])[passingCurrentIndex.value] || {},
  set: (value) => {
    const newCycles = [...(model.value.passing || [])];
    newCycles[passingCurrentIndex.value] = value;
    model.value = { ...model.value, passing: newCycles };
  }
});

function addPassingCycle() {
  const cycles = model.value.passing || [{}];
  const lastCycle = cycles[cycles.length - 1] || {};
  const newCycles = [...cycles, { ...lastCycle }];
  model.value = { ...model.value, passing: newCycles };
  passingCurrentIndex.value = newCycles.length - 1;
}

function previousPassingCycle() {
  if (passingCurrentIndex.value > 0) {
    passingCurrentIndex.value--;
  }
}

function nextPassingCycle() {
  const cycles = model.value.passing || [];
  if (passingCurrentIndex.value < cycles.length - 1) {
    passingCurrentIndex.value++;
  }
}

// --- Scoring Cycles ---
const scoringCurrentIndex = ref(0);

watch(() => model.value.scoring, (newCycles) => {
    if (!newCycles || newCycles.length === 0) {
        model.value = { ...model.value, scoring: [{}] };
    }
    scoringCurrentIndex.value = (model.value.scoring?.length || 1) - 1;
}, { immediate: true });

const currentScoringCycle = computed({
  get: () => (model.value.scoring || [])[scoringCurrentIndex.value] || {},
  set: (value) => {
    const newCycles = [...(model.value.scoring || [])];
    newCycles[scoringCurrentIndex.value] = value;
    model.value = { ...model.value, scoring: newCycles };
  }
});

function addScoringCycle() {
  const cycles = model.value.scoring || [{}];
  const lastCycle = cycles[cycles.length - 1] || {};
  const newCycles = [...cycles, { ...lastCycle }];
  model.value = { ...model.value, scoring: newCycles };
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

// --- Defense Cycles ---
const defenseCurrentIndex = ref(0);

watch(() => model.value.defense, (newCycles) => {
    if (!newCycles || newCycles.length === 0) {
        model.value = { ...model.value, defense: [{}] };
    }
    defenseCurrentIndex.value = (model.value.defense?.length || 1) - 1;
}, { immediate: true });

const currentDefenseCycle = computed({
  get: () => (model.value.defense || [])[defenseCurrentIndex.value] || {},
  set: (value) => {
    const newCycles = [...(model.value.defense || [])];
    newCycles[defenseCurrentIndex.value] = value;
    model.value = { ...model.value, defense: newCycles };
  }
});

function addDefenseCycle() {
  const cycles = model.value.defense || [{}];
  const lastCycle = cycles[cycles.length - 1] || {};
  const newCycles = [...cycles, { ...lastCycle }];
  model.value = { ...model.value, defense: newCycles };
  defenseCurrentIndex.value = newCycles.length - 1;
}

function previousDefenseCycle() {
  if (defenseCurrentIndex.value > 0) {
    defenseCurrentIndex.value--;
  }
}

function nextDefenseCycle() {
  const cycles = model.value.defense || [];
  if (defenseCurrentIndex.value < cycles.length - 1) {
    defenseCurrentIndex.value++;
  }
}
</script>
