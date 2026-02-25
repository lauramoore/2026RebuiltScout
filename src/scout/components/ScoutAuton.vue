<template>
  <h1>Auton</h1>
  <div>
    <h2>Preload</h2>

    <div class="form-group">
      <label>
        <input type="radio" value="0" v-model="preload.count" /> 0
      </label>
      <label>
        <input type="radio" value="2" v-model="preload.count" /> 2
      </label>
      <label>
        <input type="radio" value="4" v-model="preload.count" /> 4
      </label>
      <label>
        <input type="radio" value="6" v-model="preload.count" /> 6
      </label>
      <label>
        <input type="radio" value="8" v-model="preload.count" /> 8
      </label>
    </div>
    <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="preload.speed" />pew
    </label>
    <label>
      <input type="radio" value="3" v-model="preload.speed" /> pew-pew
    </label>
    <label>
      <input type="radio" value="7" v-model="preload.speed" /> avalanche!
    </label>
  </div>
   <div class="form-group">
    <label>
      <input type="radio" value="1" v-model="preload.accuracy" /> wild
    </label>
    <label>
      <input type="radio" value="3" v-model="preload.accuracy" /> on target
    </label>
    <label>
      <input type="radio" value="7" v-model="preload.accuracy" /> bullseye
    </label>
  </div>
  <div class="form-group">
     <label>
      <input type="checkbox" value="true" v-model="preload.mobileShot" /> on the move
    </label>
  </div>
  </div>

  <div>
    <h2>Scoring Cycles</h2>
  <CycleNavigator :current-index="currentIndex" :total-cycles="cycles.length" @previous="previousCycle" @next="nextCycle" @add="addCycle" />
  <ScoreCycle v-model="currentCycleModel"/>
  </div>

  <div>
    <h2>L1 Climb</h2>
    <div class="form-group">
      <label> <input type="checkbox" v-model="climb" /> Successful </label>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import ScoreCycle from './ScoreCycle.vue';
import CycleNavigator from './CycleNavigator.vue';
import { useCycleManager } from '../composables/useCycleManager.js';

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

const preload = computed({
  get: () => model.value.preload || {} ,
  set: (val) => model.value = { ...model.value, preload: val }
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
