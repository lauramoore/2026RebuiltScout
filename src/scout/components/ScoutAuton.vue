<template>
  <h1>Auton</h1>
  <div>
     <h2>Start Location</h2>

    <div class="form-group">
      <label>
        <input type="radio" value="0" v-model="startAt" /> Depot
      </label>
      <label>
        <input type="radio" value="2" v-model="startAt" /> Hub
      </label>
      <label>
        <input type="radio" value="4" v-model="startAt" /> Outpost
      </label>
    </div>
  </div>

  <div>
    <h2>Scoring Cycles</h2>
  <CycleNavigator :current-index="currentIndex" :total-cycles="cycles.length" @previous="previousCycle" @next="nextCycle" @add="addCycle" />
  <ScoreCycle v-model="currentCycleModel"/>
  </div>

  <div>
    <AutonClimb />
  </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import ScoreCycle from './ScoreCycle.vue';
import CycleNavigator from './CycleNavigator.vue';
import { useCycleManager } from '../composables/useCycleManager.js';
import AutonClimb from './AutonClimb.vue'

const props = defineProps({
  modelValue: Object
});
const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

const climb = computed({
  get: () => model.value.autonClimb || false,
  set: (val) => model.value = { ...model.value, autonClimb: val }
});

const startAt = computed({
  get: () => model.value.startAt || {} ,
  set: (val) => model.value = { ...model.value, startAt: val }
});

const cycleKey = ref('scoring');

const { currentIndex, cycles, currentCycleModel, addCycle, previousCycle, nextCycle } = useCycleManager(model, cycleKey);
</script>

<style scoped>
.form-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.form-group-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: start;
}
</style>
