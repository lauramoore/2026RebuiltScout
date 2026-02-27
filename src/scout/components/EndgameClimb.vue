<template>
  <h1>Endgame</h1>
  <h3>Climb</h3>
  <div class="form-group">
     <label>
      <input type="radio" value="0" v-model="climbLevel" /> none
    </label>
    <label>
      <input type="radio" value="1" v-model="climbLevel" /> 1
    </label>
    <label>
      <input type="radio" value="2" v-model="climbLevel" /> 2
    </label>
    <label>
      <input type="radio" value="3" v-model="climbLevel" /> 3
    </label>
     <label>
      <input type="radio" value="-1" />Failed
    </label>
  </div>
  <div class="form-group">
    <h4>Started At</h4>
    <label>
      <input type="radio" value="1" v-model="climbStart" /> 5
    </label>
    <label>
      <input type="radio" value="2" v-model="climbStart" /> 10
    </label>
    <label>
      <input type="radio" value="3" v-model="climbStart" /> 15
    </label>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useClimb } from '../composables/useClimb.js';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(['update:modelValue']);

const climbData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const { climbLevel, climbStart} = useClimb(climbData);
</script>
