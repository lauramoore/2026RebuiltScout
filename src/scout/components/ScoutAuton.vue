<template>
  <h1>Auton</h1>
  <ScoreCycle v-model="model"/>
</template>
<script setup>
import { computed } from 'vue';
import ScoreCycle from './ScoreCycle.vue';

const props = defineProps({
  modelValue: Object
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>
