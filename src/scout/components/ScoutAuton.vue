<template>
  <h1>Auton</h1>
  <div>
    <h2>Preload</h2>

    <div>
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
    <div>
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
   <div>
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
  <div>
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
     <h2>L1 Climb <label> <input type="checkbox" v-model="climb" />
     </label></h2>
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
  set: (val) => model.value = { ...model.value, climb: val }
});

const preload = computed({
  get: () => model.value.preload || 0 ,
  set: (val) => model.value = { ...model.value, preload: val }
});

const cycleKey = ref('scoring');

const { currentIndex, cycles, currentCycleModel, addCycle, previousCycle, nextCycle } = useCycleManager(model, cycleKey);

</script>
