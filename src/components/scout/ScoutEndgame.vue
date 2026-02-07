<template>
  <h1>EndGame</h1>
  <div>
    <h2>Climb</h2>
    <div>
       <label>
      <input type="radio" value="slow" v-model="climb" />L1
    </label>
    <label>
      <input type="radio" value="medium" v-model="climb" />L2
    </label>
    <label>
      <input type="radio" value="fast" v-model="climb" />L3
    </label>
     <label>
      <input type="checkbox" value="fast" v-model="climbAborted" />Not Successful
    </label>
    </div>
  </div>
  <h2>Additional Fuel</h2>
   <ScoutCycle v-model="model"/>
</template>
<script setup>
import { computed } from 'vue';
import ScoutCycle from './ScoutCycle.vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});
</script>
