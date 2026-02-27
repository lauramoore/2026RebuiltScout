<template>
  <h2>Climb</h2>
  <div class="form-group">
    <label>
      <input type="radio" value="0" v-model="climbLevel" />None
    </label>
     <label>
      <input type="radio" value="1" v-model="climbLevel" />1
    </label>
     <label>
      <input type="radio" value="-1"  v-model="climbLevel" />Failed
    </label>
  </div>
  <div class="form-group">
    <h4>Started</h4>
     <label>
      <input type="radio" value="1" v-model="climbStart" /> 10
    </label>
    <label>
      <input type="radio" value="1" v-model="climbStart" /> 15
    </label>
    <label>
      <input type="radio" value="2" v-model="climbStart" /> 20
    </label>
    <label>
      <input type="radio" value="3" v-model="climbStart" /> 25
    </label>
  </div>
    <div class="form-group">
    <h4>Dismounted</h4>
     <label>
      <input type="radio" value="5" v-model="climbDismount" /> 5
    </label>
    <label>
      <input type="radio" value="10" v-model="climbDismount" /> 10
    </label>
    <label>
      <input type="radio" value="20" v-model="climbDismount" /> 20
    </label>
    <label>
      <input type="radio" value="40" v-model="climbDismount" /> 40
    </label>
        <label>
      <input type="radio" value="120" v-model="climbDismount" /> stuck
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

const { climbLevel, climbStart, climbDismount} = useClimb(climbData);
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
</style>
